import { Headphones, Shield, ShoppingBag, Truck } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { Skeleton } from "../components/ui/skeleton";
import { useCategories, useProducts } from "../hooks/useBackend";
import { seedIfEmpty } from "../lib/seedData";
import { SKELETON_KEYS_8 } from "../lib/skeletonKeys";

const CATEGORY_ICONS: Record<string, string> = {
  fashion: "\u{1F457}",
  electronics: "\u{1F4F1}",
  home: "\u{1F3E0}",
  beauty: "\u{1F484}",
  sports: "\u26BD",
  books: "\u{1F4DA}",
  toys: "\u{1F9F8}",
  kitchen: "\u{1F373}",
};

const HERO_CATS = ["fashion", "electronics", "beauty", "home"];

const FEATURES = [
  {
    key: "delivery",
    icon: <Truck className="w-6 h-6" />,
    title: "Free Delivery",
    desc: "On orders above \u20b9299",
  },
  {
    key: "payment",
    icon: <Shield className="w-6 h-6" />,
    title: "Secure Payment",
    desc: "100% safe transactions",
  },
  {
    key: "returns",
    icon: <ShoppingBag className="w-6 h-6" />,
    title: "Easy Returns",
    desc: "7-day hassle-free returns",
  },
  {
    key: "support",
    icon: <Headphones className="w-6 h-6" />,
    title: "24/7 Support",
    desc: "Dedicated customer care",
  },
];

export default function HomePage() {
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: products, isLoading: prodLoading } = useProducts();

  useEffect(() => {
    seedIfEmpty();
  }, []);

  const featured = products?.filter((p) => p.isActive).slice(0, 8) ?? [];

  return (
    <div data-ocid="home.page">
      <section
        className="relative bg-gradient-to-br from-primary/90 to-purple-700 text-white py-16 px-4 overflow-hidden"
        data-ocid="home.hero_section"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-widest opacity-80 mb-2">
              Welcome to
            </p>
            <div className="flex flex-col leading-none mb-4">
              <span className="text-base font-display font-semibold tracking-widest uppercase opacity-80">
                multiflex
              </span>
              <span className="text-5xl md:text-7xl font-display font-extrabold">
                IVAAN
              </span>
            </div>
            <p className="text-lg md:text-xl opacity-90 mb-6 max-w-md">
              India's Best Online Shopping Destination. Millions of products at
              unbeatable prices.
            </p>
            <Link to="/category/fashion">
              <button
                type="button"
                className="bg-white text-primary font-bold px-8 py-3 rounded-full hover:bg-white/90 transition-colors"
                data-ocid="hero.shop_now_button"
              >
                Shop Now
              </button>
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              {HERO_CATS.map((cat) => (
                <div
                  key={cat}
                  className="bg-white/10 backdrop-blur rounded-xl p-4 text-center text-2xl"
                >
                  {CATEGORY_ICONS[cat]}
                  <p className="text-xs mt-1 capitalize opacity-80">{cat}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute -bottom-8 left-0 right-0 h-16 bg-background rounded-t-[50%]" />
      </section>

      <section className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.key}
              className="flex flex-col items-center text-center p-4 bg-card border border-border rounded-xl"
            >
              <div className="text-primary mb-2">{f.icon}</div>
              <p className="font-semibold text-sm">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="max-w-7xl mx-auto px-4 py-8"
        data-ocid="home.categories_section"
      >
        <h2 className="text-2xl font-display font-bold mb-6">
          Shop by Category
        </h2>
        {catLoading ? (
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {SKELETON_KEYS_8.map((k) => (
              <Skeleton key={k} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {categories?.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="flex flex-col items-center justify-center bg-card border border-border rounded-xl p-3 hover:border-primary hover:shadow-md transition-all group"
                data-ocid={`home.category_link.${i + 1}`}
              >
                <span className="text-2xl mb-1">
                  {CATEGORY_ICONS[cat.id] ?? "\u{1F6CB}"}
                </span>
                <span className="text-xs font-medium text-center leading-tight group-hover:text-primary">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section
        className="max-w-7xl mx-auto px-4 py-8"
        data-ocid="home.products_section"
      >
        <h2 className="text-2xl font-display font-bold mb-6">
          Featured Products
        </h2>
        {prodLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {SKELETON_KEYS_8.map((k) => (
              <Skeleton key={k} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-r from-accent/20 to-primary/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-display font-bold mb-2">
              Become a Seller on IVAAN
            </h3>
            <p className="text-muted-foreground">
              Reach millions of customers. List your products and grow your
              business.
            </p>
          </div>
          <Link to="/profile">
            <button
              type="button"
              className="bg-primary text-primary-foreground font-bold px-8 py-3 rounded-full hover:bg-primary/90 transition-colors whitespace-nowrap"
              data-ocid="promo.seller_register_button"
            >
              Start Selling
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
