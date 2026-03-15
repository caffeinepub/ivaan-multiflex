import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

const CONTACT_ITEMS = [
  {
    icon: <Phone className="w-5 h-5" />,
    label: "Phone",
    value: "9058414214",
    href: "tel:9058414214",
  },
  {
    icon: <Mail className="w-5 h-5" />,
    label: "Email",
    value: "mohdkashifsaifi2002@gmail.com",
    href: "mailto:mohdkashifsaifi2002@gmail.com",
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    label: "Address",
    value: "West Rohtash Nagar, Shahdara, Delhi - 110032",
    href: undefined,
  },
  {
    icon: <Clock className="w-5 h-5" />,
    label: "Hours",
    value: "Mon - Sat: 9:00 AM - 7:00 PM",
    href: undefined,
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12" data-ocid="contact.page">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold mb-3">Contact Us</h1>
        <p className="text-muted-foreground">
          We're here to help. Reach out to us anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
            <div className="flex flex-col leading-none mb-4">
              <span className="text-xs font-display font-semibold tracking-widest text-primary uppercase">
                multiflex
              </span>
              <span className="text-3xl font-display font-extrabold">
                IVAAN
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              India's Best Online Shopping Destination
            </p>
          </div>

          {CONTACT_ITEMS.map((item) => (
            <div key={item.label} className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="font-medium">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">Send us a message</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="contact-name"
                className="text-sm font-medium mb-1 block"
              >
                Name
              </label>
              <Input
                id="contact-name"
                placeholder="Your name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="contact.name_input"
              />
            </div>
            <div>
              <label
                htmlFor="contact-email"
                className="text-sm font-medium mb-1 block"
              >
                Email
              </label>
              <Input
                id="contact-email"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                data-ocid="contact.email_input"
              />
            </div>
            <div>
              <label
                htmlFor="contact-message"
                className="text-sm font-medium mb-1 block"
              >
                Message
              </label>
              <Textarea
                id="contact-message"
                placeholder="How can we help?"
                rows={5}
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                data-ocid="contact.message_textarea"
              />
            </div>
            <Button
              className="w-full bg-primary text-primary-foreground"
              data-ocid="contact.submit_button"
              onClick={() => {
                toast.success("Message sent! We'll get back to you soon.");
                setForm({ name: "", email: "", message: "" });
              }}
            >
              Send Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
