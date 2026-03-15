import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAddToCart } from "../hooks/useBackend";
import type { Product } from "../hooks/useBackend";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

function formatPrice(price: bigint) {
  return `\u20b9${(Number(price) / 100).toLocaleString("en-IN")}`;
}

export default function ProductCard({
  product,
  index,
}: { product: Product; index: number }) {
  const addToCart = useAddToCart();
  const discount = product.originalPrice
    ? Math.round(
        (1 - Number(product.price) / Number(product.originalPrice)) * 100,
      )
    : 0;
  const imageUrl =
    product.imageUrl?.getDirectURL?.() ??
    `https://picsum.photos/seed/${product.id}/400/400`;

  return (
    <div
      className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow group"
      data-ocid={`product.item.${index + 1}`}
    >
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs">
              {discount}% OFF
            </Badge>
          )}
          {Number(product.stock) === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-sm font-medium line-clamp-2 leading-snug mb-1">
            {product.name}
          </p>
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <Button
          size="sm"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
          data-ocid={`product.add_cart_button.${index + 1}`}
          disabled={Number(product.stock) === 0 || addToCart.isPending}
          onClick={() => {
            addToCart.mutate(
              { productId: product.id, quantity: BigInt(1) },
              {
                onSuccess: () => toast.success("Added to cart!"),
                onError: () => toast.error("Failed to add to cart"),
              },
            );
          }}
        >
          <ShoppingCart className="w-3 h-3" /> Add to Cart
        </Button>
      </div>
    </div>
  );
}
