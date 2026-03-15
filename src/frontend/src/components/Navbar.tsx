import { Menu, ShoppingCart, Store, User, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart, useUserProfile } from "../hooks/useBackend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const NAV_LINKS = [
  { path: "/", label: "Home" },
  { path: "/orders", label: "My Orders" },
  { path: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { identity, login, clear } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: cart } = useCart();
  const { data: profile } = useUserProfile();
  const navigate = useNavigate();

  const cartCount =
    cart?.reduce((sum, item) => sum + Number(item.quantity), 0) ?? 0;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 gap-4">
        <Link
          to="/"
          className="flex flex-col leading-none min-w-max"
          data-ocid="nav.link"
        >
          <span className="text-[10px] font-display font-semibold tracking-widest text-primary uppercase">
            multiflex
          </span>
          <span className="text-2xl font-display font-extrabold text-foreground tracking-tight">
            IVAAN
          </span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-xl">
          <input
            className="w-full border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Search products, brands and more..."
            data-ocid="nav.search_input"
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate("/");
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          {profile?.isSeller && (
            <Link to="/seller">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex gap-1"
                data-ocid="nav.seller_button"
              >
                <Store className="w-4 h-4" /> Seller
              </Button>
            </Link>
          )}
          <Link to="/cart" className="relative" data-ocid="nav.cart_link">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Button
                  variant="ghost"
                  size="icon"
                  data-ocid="nav.profile_button"
                >
                  <User className="w-5 h-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                data-ocid="nav.logout_button"
                className="hidden md:flex"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={login}
              data-ocid="nav.login_button"
              className="bg-primary text-primary-foreground"
            >
              Login
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            data-ocid="nav.menu_button"
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-3 flex flex-col gap-3">
          <input
            className="border border-border rounded-full px-4 py-2 text-sm w-full"
            placeholder="Search..."
            data-ocid="nav.mobile_search_input"
          />
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className="text-sm py-1 hover:text-primary"
                data-ocid="nav.mobile_link"
              >
                {item.label}
              </Link>
            ))}
            {profile?.isSeller && (
              <Link
                to="/seller"
                onClick={() => setMenuOpen(false)}
                className="text-sm py-1 hover:text-primary"
              >
                Seller Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
