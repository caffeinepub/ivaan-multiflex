import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import { OrderStatus } from "../backend.d";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { useMyOrders } from "../hooks/useBackend";

function fmt(price: bigint) {
  return `\u20b9${(Number(price) / 100).toLocaleString("en-IN")}`;
}

const STATUS_COLORS: Record<string, string> = {
  [OrderStatus.pending]: "bg-yellow-100 text-yellow-800",
  [OrderStatus.shipped]: "bg-blue-100 text-blue-800",
  [OrderStatus.delivered]: "bg-green-100 text-green-800",
  [OrderStatus.cancelled]: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const { data: orders, isLoading } = useMyOrders();

  if (isLoading)
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" data-ocid="orders.page">
      <h1 className="text-3xl font-display font-bold mb-8">My Orders</h1>
      {!orders || orders.length === 0 ? (
        <div className="text-center py-20" data-ocid="orders.empty_state">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">
            Start shopping to see your orders here.
          </p>
          <Link to="/">
            <Button
              className="bg-primary text-primary-foreground"
              data-ocid="orders.shop_button"
            >
              Shop Now
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <div
              key={order.id}
              className="bg-card border border-border rounded-xl p-5"
              data-ocid={`orders.item.${i + 1}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Order ID
                  </p>
                  <p className="font-mono text-sm">
                    {order.id.slice(0, 16)}...
                  </p>
                </div>
                <Badge className={STATUS_COLORS[order.status] ?? ""}>
                  {order.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {order.items.length} item(s)
                </p>
                <p className="font-bold">{fmt(order.total)}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(
                  Number(order.timestamp) / 1_000_000,
                ).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
