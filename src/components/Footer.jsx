import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CheckCircle2,
  Gift,
  CreditCard,
  Lock,
} from "lucide-react";
import { LogoMark } from "./Logo";
import toast from "react-hot-toast";

const FOOTER_COLUMNS = [
  {
    title: "Categories",
    links: [
      { label: "🎁 Build A Custom Hamper", to: "/build-a-box" },
      { label: "3D Keepsakes & Miniatures", to: "/3d-keepsakes" },
      { label: "Personalized Photo Magnets", to: "/shop?category=photo-magnets" },
      { label: "Polaroid Frame Magnets", to: "/shop?category=polaroid-magnets" },
      { label: "Couple & Romantic Gifts", to: "/shop?occasion=couples" },
      { label: "Baby & Pet Keepsakes", to: "/3d-keepsakes" },
    ],
  },
  {
    title: "Occasions",
    links: [
      { label: "Birthday Gifts", to: "/shop?occasion=birthday" },
      { label: "Anniversary Keepsakes", to: "/shop?occasion=anniversary" },
      { label: "Wedding & Pre-Wedding", to: "/shop?occasion=wedding" },
      { label: "Housewarming Gifts", to: "/shop?occasion=housewarming" },
      { label: "Friendship Day Specials", to: "/shop?occasion=friendship" },
      { label: "Just Because / Love", to: "/shop?occasion=just-because" },
    ],
  },
  {
    title: "Gifts By Relation",
    links: [
      { label: "Gifts for Her / Wife / Girlfriend", to: "/shop?tag=for-her" },
      { label: "Gifts for Him / Husband / Boyfriend", to: "/shop?tag=for-him" },
      { label: "Gifts for Couples", to: "/shop?occasion=couples" },
      { label: "Gifts for Parents", to: "/shop?tag=for-parents" },
      { label: "Gifts for Best Friends", to: "/shop?tag=for-friend" },
      { label: "Corporate & Bulk Gifting", to: "/contact" },
    ],
  },
  {
    title: "Customer Support",
    links: [
      { label: "Track Your Order", to: "/track-order" },
      { label: "How Customization Works", to: "/how-it-works" },
      { label: "Delivery & Shipping Info", to: "/how-it-works" },
      { label: "Contact Support & WhatsApp", to: "/contact" },
      { label: "Returns & Quality Guarantee", to: "/about" },
      { label: "FAQs & Keepsake Care", to: "/how-it-works" },
    ],
  },
];

const TRUST_PILLARS = [
  {
    icon: Truck,
    title: "Express PAN-India Delivery",
    desc: "Same Day & Express slots in 50+ major cities",
  },
  {
    icon: Sparkles,
    title: "100% Handcrafted & Unique",
    desc: "Made with bespoke care from your photos",
  },
  {
    icon: ShieldCheck,
    title: "Quality & Safe Packing",
    desc: "Luxury ribbon box with damage-proof shield",
  },
  {
    icon: Headphones,
    title: "Dedicated Gifting Support",
    desc: "Expert keepsake artists available on WhatsApp",
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Subscribed! Use code RIBBON100 for ₹100 off on your first order.", {
      duration: 5000,
    });
    setEmail("");
  };

  return (
    <footer className="bg-espresso-700 text-cream-200 border-t border-espresso-600">
      {/* 1. TRUST PILLARS STRIP (IGP Style) */}
      <div className="border-b border-espresso-600/80 bg-espresso-700/60 py-8 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_PILLARS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl bg-espresso-600/30">
                <div className="h-12 w-12 rounded-xl bg-ribbon-500/20 text-blush-300 flex items-center justify-center shrink-0">
                  <Icon size={24} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-cream-50">{p.title}</h4>
                  <p className="text-xs text-cream-300/70 leading-snug">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. NEWSLETTER VOUCHER PROMO */}
      <div className="border-b border-espresso-600/80 py-8 px-4 sm:px-6 lg:px-10 bg-espresso-700/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-coral-400">
              <Gift size={14} /> Get ₹100 Off Your First Keepsake
            </span>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-cream-50">
              Join The Ribbon Club for Exclusive Gifting Perks
            </h3>
            <p className="text-xs text-cream-300/70">
              Be the first to hear about seasonal sales, new 3D sculptures, and gift inspirations.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row gap-2 max-w-md">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-full bg-espresso-600/60 border border-espresso-500 text-sm text-cream-50 placeholder:text-cream-400/50 focus:outline-none focus:border-ribbon-400 min-w-[260px]"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-ribbon-500 hover:bg-ribbon-600 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm whitespace-nowrap"
            >
              Get ₹100 Off
            </button>
          </form>
        </div>
      </div>

      {/* 3. MAIN SITEMAP DIRECTORY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <LogoMark to="/" size="compact" light />
            <p className="text-xs text-cream-300/80 leading-relaxed max-w-sm">
              The Ribbon Story transforms your cherished memories, photos, and milestones into handcrafted 3D keepsakes, crystal acrylic magnets, and luxury gift boxes.
            </p>
            <div className="space-y-2 text-xs text-cream-300/90 pt-2">
              <p className="flex items-center gap-2">
                <MapPin size={14} className="text-ribbon-400 shrink-0" />
                <span>Indiranagar, Bengaluru, Karnataka 560038</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-emerald-400 shrink-0" />
                <span>+91 98765 43210 (Mon-Sat 10 AM - 8 PM)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-coral-400 shrink-0" />
                <span>support@theribbonstory.com</span>
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-full bg-espresso-600 hover:bg-ribbon-500 text-cream-100 flex items-center justify-center transition"
                title="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-full bg-espresso-600 hover:bg-ribbon-500 text-cream-100 flex items-center justify-center transition"
                title="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-full bg-espresso-600 hover:bg-ribbon-500 text-cream-100 flex items-center justify-center transition"
                title="Twitter / X"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Directory Columns */}
          {FOOTER_COLUMNS.map((col, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="font-display font-bold text-sm text-cream-50 border-b border-espresso-600 pb-2">
                {col.title}
              </h4>
              <ul className="space-y-2 text-xs">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      to={link.to}
                      className="text-cream-300/70 hover:text-white transition-colors block py-0.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 4. PAYMENT GATEWAY BADGES & COPYRIGHT */}
      <div className="border-t border-espresso-600/80 bg-espresso-800/80 py-6 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-cream-300/60">
          <div className="flex items-center gap-2">
            <Lock size={13} className="text-emerald-400" />
            <span>100% Safe &amp; Secure Checkout. Verified Payment Options:</span>
            <span className="font-semibold text-cream-200">UPI, RuPay, Visa, Mastercard, NetBanking, COD</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/about" className="hover:text-cream-50">About Us</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-cream-50">Privacy Policy</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-cream-50">Terms of Service</Link>
            <span>•</span>
            <Link to="/admin" className="text-blush-300 hover:text-white font-semibold">Admin Portal</Link>
            <span>•</span>
            <span>© 2026 The Ribbon Story India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
