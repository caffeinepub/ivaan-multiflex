import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex flex-col leading-none mb-3">
            <span className="text-[10px] font-display font-semibold tracking-widest text-primary uppercase">
              multiflex
            </span>
            <span className="text-2xl font-display font-extrabold tracking-tight">
              IVAAN
            </span>
          </div>
          <p className="text-sm text-white/60">
            India's Best Online Shopping Destination. Easy to buy, easy to
            order, easy to use.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Quick Links</h3>
          <div className="flex flex-col gap-2 text-sm text-white/70">
            <Link
              to="/"
              className="hover:text-white transition-colors"
              data-ocid="footer.home_link"
            >
              Home
            </Link>
            <Link
              to="/orders"
              className="hover:text-white transition-colors"
              data-ocid="footer.orders_link"
            >
              My Orders
            </Link>
            <Link
              to="/seller"
              className="hover:text-white transition-colors"
              data-ocid="footer.seller_link"
            >
              Seller Dashboard
            </Link>
            <Link
              to="/contact"
              className="hover:text-white transition-colors"
              data-ocid="footer.contact_link"
            >
              Contact Us
            </Link>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Contact Us</h3>
          <div className="flex flex-col gap-2 text-sm text-white/70">
            <a
              href="tel:9058414214"
              className="flex items-center gap-2 hover:text-white"
              data-ocid="footer.phone_link"
            >
              <Phone className="w-4 h-4" /> 9058414214
            </a>
            <a
              href="mailto:mohdkashifsaifi2002@gmail.com"
              className="flex items-center gap-2 hover:text-white"
              data-ocid="footer.email_link"
            >
              <Mail className="w-4 h-4" /> mohdkashifsaifi2002@gmail.com
            </a>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>West Rohtash Nagar, Shahdara, Delhi - 110032</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 text-center text-xs text-white/40 py-4">
        © 2024 IVAAN Multiflex. All rights reserved.
      </div>
    </footer>
  );
}
