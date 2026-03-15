import { ChevronRight, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { useAddToCart, useProduct } from "../hooks/useBackend";

function fmt(price: bigint) {
  return `\u20b9${(Number(price) / 100).toLocaleString("en-IN")}`;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id ?? "");
  const addToCart = useAddToCart();
  const [qty, setQty] = useState(1);

  if (isLoading)
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );

  if (!product)
    return <div className="text-center py-20">Product not found</div>;

  const discount = product.originalPrice
    ? Math.round(
        (1 - Number(product.price) / Number(product.originalPrice)) * 100,
      )
    : 0;

  const imageUrl =
    product.imageUrl?.getDirectURL?.() ??
    `https://picsum.photos/seed/${product.id}/600/600`;

  return (
    <div
      className="max-w-5xl mx-auto px-4 py-8"
      data-ocid="product_detail.page"
    >
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          to={`/category/${product.categoryId}`}
          className="hover:text-primary capitalize"
        >
          {product.categoryId}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="relative">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full aspect-square object-cover rounded-2xl shadow"
          />
          {discount > 0 && (
            <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
              {discount}% OFF
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-2xl md:text-3xl font-display font-bold">
            {product.name}
          </h1>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{fmt(product.price)}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {fmt(product.originalPrice)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-destructive font-semibold">
                {discount}% off
              </span>
            )}
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>
          <p className="text-sm">
            <span className="font-medium">Stock: </span>
            <span
              className={
                Number(product.stock) > 0
                  ? "text-green-600"
                  : "text-destructive"
              }
            >
              {Number(product.stock) > 0
                ? `${product.stock} available`
                : "Out of stock"}
            </span>
          </p>

          <div className="flex items-center gap-3">
            <span className="font-medium text-sm">Quantity:</span>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                type="button"
                className="px-3 py-2 hover:bg-muted"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                data-ocid="product_detail.qty_minus_button"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 font-medium">{qty}</span>
              <button
                type="button"
                className="px-3 py-2 hover:bg-muted"
                onClick={() => setQty((q) => q + 1)}
                data-ocid="product_detail.qty_plus_button"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <Button
            size="lg"
            className="bg-primary text-primary-foreground gap-2 mt-2"
            data-ocid="product_detail.add_cart_button"
            disabled={Number(product.stock) === 0 || addToCart.isPending}
            onClick={() => {
              addToCart.mutate(
                { productId: product.id, quantity: BigInt(qty) },
                {
                  onSuccess: () => toast.success("Added to cart!"),
                  onError: () => toast.error("Failed to add to cart"),
                },
              );
            }}
          >
            <ShoppingCart className="w-5 h-5" /> Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
