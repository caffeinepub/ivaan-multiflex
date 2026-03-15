import { ShoppingBag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  useCart,
  useClearCart,
  usePlaceOrder,
  useProducts,
  useRemoveFromCart,
} from "../hooks/useBackend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

function fmt(price: bigint) {
  return `\u20b9${(Number(price) / 100).toLocaleString("en-IN")}`;
}

export default function CartPage() {
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: products } = useProducts();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();
  const placeOrder = usePlaceOrder();
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const navigate = useNavigate();

  const cartItems = (cart ?? [])
    .map((item) => ({
      ...item,
      product: products?.find((p) => p.id === item.productId),
    }))
    .filter((i) => i.product);
  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.product!.price) * Number(item.quantity),
    0,
  );

  if (cartLoading)
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );

  if (!isAuthenticated)
    return (
      <div
        className="max-w-3xl mx-auto px-4 py-20 text-center"
        data-ocid="cart.page"
      >
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Please login to view cart</h2>
        <Button
          onClick={login}
          className="bg-primary text-primary-foreground"
          data-ocid="cart.login_button"
        >
          Login
        </Button>
      </div>
    );

  if (cartItems.length === 0)
    return (
      <div
        className="max-w-3xl mx-auto px-4 py-20 text-center"
        data-ocid="cart.empty_state"
      >
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">
          Add some products to get started.
        </p>
        <Link to="/">
          <Button
            className="bg-primary text-primary-foreground"
            data-ocid="cart.continue_shopping_button"
          >
            Continue Shopping
          </Button>
        </Link>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" data-ocid="cart.page">
      <h1 className="text-3xl font-display font-bold mb-8">
        Shopping Cart ({cartItems.length})
      </h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cartItems.map((item, i) => {
            const img =
              item.product!.imageUrl?.getDirectURL?.() ??
              `https://picsum.photos/seed/${item.productId}/200/200`;
            return (
              <div
                key={item.productId}
                className="flex gap-4 bg-card border border-border rounded-xl p-4"
                data-ocid={`cart.item.${i + 1}`}
              >
                <img
                  src={img}
                  alt={item.product!.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.product!.name}</p>
                  <p className="text-muted-foreground text-sm">
                    Qty: {item.quantity.toString()}
                  </p>
                  <p className="font-bold mt-1">{fmt(item.product!.price)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  data-ocid={`cart.remove_button.${i + 1}`}
                  onClick={() =>
                    removeFromCart.mutate({
                      productId: item.productId,
                      quantity: item.quantity,
                    })
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
        <div className="bg-card border border-border rounded-xl p-6 h-fit space-y-4">
          <h3 className="font-bold text-lg">Order Summary</h3>
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{fmt(BigInt(Math.round(total)))}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600">
            <span>Delivery</span>
            <span>FREE</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span>{fmt(BigInt(Math.round(total)))}</span>
          </div>
          <Button
            className="w-full bg-primary text-primary-foreground"
            data-ocid="cart.place_order_button"
            disabled={placeOrder.isPending}
            onClick={() => {
              placeOrder.mutate(BigInt(Math.round(total)), {
                onSuccess: () => {
                  toast.success("Order placed successfully!");
                  navigate("/orders");
                },
                onError: () => toast.error("Failed to place order"),
              });
            }}
          >
            {placeOrder.isPending ? "Placing..." : "Place Order"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            data-ocid="cart.clear_button"
            onClick={() => clearCart.mutate()}
          >
            Clear Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
