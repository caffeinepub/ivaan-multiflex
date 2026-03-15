import {
  Camera,
  Package,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { OrderStatus } from "../backend.d";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import {
  useAllOrders,
  useCategories,
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateOrderStatus,
  useUpdateProduct,
  useUserProfile,
} from "../hooks/useBackend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { SKELETON_KEYS_3 } from "../lib/skeletonKeys";

function fmt(price: bigint) {
  return `\u20b9${(Number(price) / 100).toLocaleString("en-IN")}`;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  categoryId: "",
  stock: "",
  imageUrl: "",
};

export default function SellerDashboard() {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: profile, isLoading: profLoading } = useUserProfile();
  const { data: products, isLoading: prodLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: orders, isLoading: ordersLoading } = useAllOrders();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateStatus = useUpdateOrderStatus();

  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(null);
    setAddOpen(true);
  };

  const openEdit = (p: NonNullable<typeof products>[0]) => {
    setEditProduct(p.id);
    setImageFile(null);
    setUploadProgress(null);
    const existingUrl = p.imageUrl?.getDirectURL?.() ?? "";
    setImagePreview(existingUrl || null);
    setForm({
      name: p.name,
      description: p.description,
      price: (Number(p.price) / 100).toString(),
      originalPrice: p.originalPrice
        ? (Number(p.originalPrice) / 100).toString()
        : "",
      categoryId: p.categoryId,
      stock: p.stock.toString(),
      imageUrl: existingUrl,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(editProduct ? form.imageUrl || null : null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    const id = editProduct ?? `p_${Date.now()}`;
    setUploadProgress(0);

    let imageBytes: Uint8Array | undefined;
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      imageBytes = new Uint8Array(arrayBuffer);
    }

    const data = {
      id,
      name: form.name,
      description: form.description,
      price: BigInt(Math.round(Number.parseFloat(form.price || "0") * 100)),
      originalPrice: form.originalPrice
        ? BigInt(Math.round(Number.parseFloat(form.originalPrice) * 100))
        : null,
      categoryId: form.categoryId,
      stock: BigInt(Number.parseInt(form.stock || "0")),
      imageUrl: form.imageUrl || `https://picsum.photos/seed/${id}/400/400`,
      imageBytes,
      onUploadProgress: (pct: number) => setUploadProgress(pct),
    };

    if (editProduct) {
      updateProduct.mutate(
        { ...data, isActive: true },
        {
          onSuccess: () => {
            toast.success("Product updated!");
            setEditProduct(null);
            setUploadProgress(null);
          },
          onError: () => {
            toast.error("Failed");
            setUploadProgress(null);
          },
        },
      );
    } else {
      createProduct.mutate(data, {
        onSuccess: () => {
          toast.success("Product added!");
          setAddOpen(false);
          setUploadProgress(null);
        },
        onError: () => {
          toast.error("Failed");
          setUploadProgress(null);
        },
      });
    }
  };

  const isSaving = createProduct.isPending || updateProduct.isPending;

  const ImageUploadField = (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        data-ocid="seller.product_image_upload_button"
      />

      {imagePreview ? (
        <div className="relative rounded-xl overflow-hidden border border-border">
          <img
            src={imagePreview}
            alt="Product preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="gap-1.5"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4" />
              Change Photo
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={clearImage}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {imageFile && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              New photo selected
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-40 rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/30 hover:bg-muted/50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group"
          data-ocid="seller.product_image_upload_button"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Upload Photo</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click to choose from your device
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WEBP up to 10MB
          </p>
        </button>
      )}

      {uploadProgress !== null && (
        <div
          className="space-y-1"
          data-ocid="seller.product_upload_loading_state"
        >
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Uploading photo...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-1.5" />
        </div>
      )}
    </div>
  );

  const ProductFormContent = (
    <div className="space-y-3">
      <Input
        placeholder="Product Name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        data-ocid="seller.product_name_input"
      />
      <Textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) =>
          setForm((f) => ({ ...f, description: e.target.value }))
        }
        data-ocid="seller.product_desc_textarea"
        rows={3}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          data-ocid="seller.product_price_input"
        />
        <Input
          placeholder="Original Price"
          type="number"
          value={form.originalPrice}
          onChange={(e) =>
            setForm((f) => ({ ...f, originalPrice: e.target.value }))
          }
          data-ocid="seller.product_original_price_input"
        />
      </div>
      <Select
        value={form.categoryId}
        onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
      >
        <SelectTrigger data-ocid="seller.product_category_select">
          <SelectValue placeholder="Select Category" />
        </SelectTrigger>
        <SelectContent>
          {categories?.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="Stock Quantity"
        type="number"
        value={form.stock}
        onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
        data-ocid="seller.product_stock_input"
      />

      {ImageUploadField}

      <Button
        className="w-full bg-primary text-primary-foreground"
        onClick={handleSave}
        disabled={isSaving}
        data-ocid="seller.product_save_button"
      >
        {isSaving
          ? "Saving..."
          : editProduct
            ? "Update Product"
            : "Add Product"}
      </Button>
    </div>
  );

  if (!isAuthenticated)
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-4">Seller Dashboard</h2>
        <Button
          className="bg-primary text-primary-foreground"
          onClick={login}
          data-ocid="seller.login_button"
        >
          Login to Continue
        </Button>
      </div>
    );

  if (profLoading)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Skeleton className="h-64" />
      </div>
    );

  if (!profile?.isSeller)
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Not a seller yet</h2>
        <p className="text-muted-foreground mb-6">
          Enable seller mode from your profile to access this dashboard.
        </p>
        <a href="/profile">
          <Button className="bg-primary text-primary-foreground">
            Go to Profile
          </Button>
        </a>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" data-ocid="seller.page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your products and orders
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-primary text-primary-foreground gap-2"
              onClick={openAdd}
              data-ocid="seller.add_product_button"
            >
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            {ProductFormContent}
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="products" data-ocid="seller.tabs">
        <TabsList className="mb-6">
          <TabsTrigger value="products" data-ocid="seller.products_tab">
            Products ({products?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="orders" data-ocid="seller.orders_tab">
            Orders ({orders?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {prodLoading ? (
            <div className="space-y-3">
              {SKELETON_KEYS_3.map((k) => (
                <Skeleton key={k} className="h-20" />
              ))}
            </div>
          ) : products?.length === 0 ? (
            <div
              className="text-center py-16"
              data-ocid="seller.products_empty_state"
            >
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl font-semibold mb-2">No products yet</p>
              <p className="text-muted-foreground">
                Add your first product to get started!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-ocid="seller.products_table">
                <thead className="border-b border-border">
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="pb-3 pr-4">Product</th>
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4">Price</th>
                    <th className="pb-3 pr-4">Stock</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products?.map((p, i) => (
                    <tr
                      key={p.id}
                      className="text-sm"
                      data-ocid={`seller.product_row.${i + 1}`}
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              p.imageUrl?.getDirectURL?.() ??
                              `https://picsum.photos/seed/${p.id}/60/60`
                            }
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <span className="font-medium">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground capitalize">
                        {p.categoryId}
                      </td>
                      <td className="py-3 pr-4 font-semibold">
                        {fmt(p.price)}
                      </td>
                      <td className="py-3 pr-4">{p.stock.toString()}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Dialog
                            open={editProduct === p.id}
                            onOpenChange={(open) => {
                              if (!open) setEditProduct(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => openEdit(p)}
                                data-ocid={`seller.edit_button.${i + 1}`}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Product</DialogTitle>
                              </DialogHeader>
                              {ProductFormContent}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            data-ocid={`seller.delete_button.${i + 1}`}
                            onClick={() =>
                              deleteProduct.mutate(p.id, {
                                onSuccess: () => toast.success("Deleted"),
                                onError: () => toast.error("Failed"),
                              })
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          {ordersLoading ? (
            <div className="space-y-3">
              {SKELETON_KEYS_3.map((k) => (
                <Skeleton key={k} className="h-20" />
              ))}
            </div>
          ) : !orders || orders.length === 0 ? (
            <div
              className="text-center py-16"
              data-ocid="seller.orders_empty_state"
            >
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl font-semibold">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order, i) => (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-xl p-4"
                  data-ocid={`seller.order_row.${i + 1}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">
                        {order.id.slice(0, 20)}...
                      </p>
                      <p className="font-bold mt-1">
                        {fmt(order.total)} &bull; {order.items.length} item(s)
                      </p>
                    </div>
                    <Select
                      value={order.status}
                      onValueChange={(v) =>
                        updateStatus.mutate(
                          { orderId: order.id, status: v as OrderStatus },
                          {
                            onSuccess: () => toast.success("Status updated"),
                            onError: () => toast.error("Failed"),
                          },
                        )
                      }
                    >
                      <SelectTrigger
                        className="w-36"
                        data-ocid={`seller.order_status_select.${i + 1}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(OrderStatus).map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
