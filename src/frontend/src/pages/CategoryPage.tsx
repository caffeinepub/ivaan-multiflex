import { ChevronRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { Skeleton } from "../components/ui/skeleton";
import { useCategories, useProductsByCategory } from "../hooks/useBackend";
import { SKELETON_KEYS_8 } from "../lib/skeletonKeys";

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const { data: products, isLoading } = useProductsByCategory(id ?? "");
  const { data: categories } = useCategories();
  const category = categories?.find((c) => c.id === id);
  const activeProducts = products?.filter((p) => p.isActive) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" data-ocid="category.page">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
        <Link
          to="/"
          className="hover:text-primary"
          data-ocid="category.home_link"
        >
          Home
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">
          {category?.name ?? id}
        </span>
      </nav>

      <h1 className="text-3xl font-display font-bold mb-8">
        {category?.name ?? id}
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {SKELETON_KEYS_8.map((k) => (
            <Skeleton key={k} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : activeProducts.length === 0 ? (
        <div className="text-center py-20" data-ocid="category.empty_state">
          <p className="text-xl font-semibold mb-2">No products yet</p>
          <p className="text-muted-foreground">
            Check back soon for new arrivals!
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          data-ocid="category.product_list"
        >
          {activeProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
