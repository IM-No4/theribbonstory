import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ShieldCheck,
  Truck,
  Headphones,
  ArrowRight,
  Lock,
} from "lucide-react";
import { LogoMark } from "./Logo";
import toast from "react-hot-toast";

const FOOTER_COLUMNS = [
  {
    title: "3D Keepsakes",
    links: [
      { label: "Personalized Chibi Figurine", to: "/personalized" },
      { label: "Couple & Anniversary Keepsake", to: "/personalized" },
      { label: "Family & Milestone Sculptures", to: "/personalized" },
      { label: "Pet 3D Portrait Figurines", to: "/personalized" },
      { label: "Browse All Ready 3D Models", to: "/shop" },
    ],
  },
  {
    title: "The Atelier",
    links: [
      { label: "How Photo Modeling Works", to: "/how-it-works" },
      { label: "Multi-Color Bio-PLA Craft", to: "/how-it-works" },
      { label: "Our Story & Studio", to: "/about" },
      { label: "Bulk & Corporate Gifting", to: "/contact" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Track Live Order", to: "/track-order" },
      { label: "WhatsApp Concierge Support", to: "/contact" },
      { label: "Packaging & Delivery Info", to: "/how-it-works" },
      { label: "FAQs & Keepsake Care", to: "/how-it-works" },
    ],
  },
];

const TRUST_HIGHLIGHTS = [
  {
    icon: Truck,
    title: "Express PAN-India Delivery",
    desc: "Speed slots in 50+ major cities",
  },
  {
    icon: Sparkles,
    title: "Handcrafted 3D Art",
    desc: "Bespoke sculpt from your photos",
  },
  {
    icon: ShieldCheck,
    title: "Safe Luxury Packaging",
    desc: "Damage-proof ribbon gift box",
  },
  {
    icon: Headphones,
    title: "Dedicated WhatsApp Support",
    desc: "Direct help from studio artists",
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
    toast.success("Welcome! Use coupon code RIBBON100 for ₹100 off on your first order.", {
      duration: 5000,
    });
    setEmail("");
  };

  return (
    <footer className="bg-[#0F141C] text-stone-300 border-t border-white/10 font-body">
      {/* 1. AIRY & REFINED TRUST PILLARS STRIP */}
      <div className="border-b border-white/10 py-7 px-4 sm:px-6 lg:px-10 bg-white/[0.015]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {TRUST_HIGHLIGHTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-3.5 group">
                <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-rose-400 flex items-center justify-center shrink-0 group-hover:border-rose-500/40 group-hover:bg-rose-500/10 transition-colors">
                  <Icon size={19} />
                </div>
                <div>
                  <h4 className="font-semibold text-[13px] text-white tracking-tight leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[11.5px] text-stone-400/80 leading-tight mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT: BRAND + NEWSLETTER + CLEAN DIRECTORY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Info & Integrated Newsletter (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <LogoMark to="/" size="compact" light />

            <p className="text-xs sm:text-[13px] text-stone-400 leading-relaxed max-w-sm">
              The Ribbon Story transforms your cherished photographs into adorable heirloom 3D chibi figurines and bespoke personalized keepsakes with laser-engraved stands.
            </p>

            {/* Streamlined Newsletter Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 max-w-md">
              <div>
                <span className="text-[10.5px] font-bold uppercase tracking-widest text-rose-400 block">
                  The Ribbon Club
                </span>
                <p className="text-xs text-white font-medium mt-0.5">
                  Get ₹100 off your first bespoke 3D keepsake
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="relative flex items-center">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-3.5 pr-28 py-2.5 rounded-full bg-white/5 border border-white/15 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-rose-400/80 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-1 px-4 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold tracking-wider uppercase transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Join</span>
                  <ArrowRight size={11} />
                </button>
              </form>
            </div>

            {/* Quick Contact & Socials */}
            <div className="space-y-2 text-xs text-stone-400 pt-1">
              <p className="flex items-center gap-2">
                <Phone size={13} className="text-emerald-400 shrink-0" />
                <span>+91 98765 43210 (Mon–Sat 10 AM – 8 PM)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={13} className="text-rose-400 shrink-0" />
                <span>support@theribbonstory.com</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={13} className="text-stone-500 shrink-0" />
                <span>Indiranagar, Bengaluru, Karnataka</span>
              </p>
            </div>

            {/* Minimalist Social Icons */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-full bg-white/5 hover:bg-rose-500 border border-white/10 hover:border-transparent text-stone-300 hover:text-white flex items-center justify-center transition-all duration-200"
                title="Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-full bg-white/5 hover:bg-rose-500 border border-white/10 hover:border-transparent text-stone-300 hover:text-white flex items-center justify-center transition-all duration-200"
                title="Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-full bg-white/5 hover:bg-rose-500 border border-white/10 hover:border-transparent text-stone-300 hover:text-white flex items-center justify-center transition-all duration-200"
                title="Twitter / X"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Clean 3 Navigation Columns (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {FOOTER_COLUMNS.map((col, idx) => (
              <div key={idx} className="space-y-3.5">
                <h4 className="font-semibold text-xs tracking-wider uppercase text-white/90 pb-1 border-b border-white/10">
                  {col.title}
                </h4>
                <ul className="space-y-2.5 text-xs">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link
                        to={link.to}
                        className="text-stone-400 hover:text-white hover:translate-x-0.5 transition-all inline-block py-0.5"
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
      </div>

      {/* 3. ELEGANT MINIMALIST SUB-FOOTER */}
      <div className="border-t border-white/10 py-5 px-4 sm:px-6 lg:px-10 text-[11.5px] text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock size={12} className="text-emerald-400" />
            <span>100% Safe &amp; Secure Checkout</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <Link to="/about" className="hover:text-stone-300 transition-colors">
              About Studio
            </Link>
            <span className="text-stone-700">•</span>
            <Link to="/contact" className="hover:text-stone-300 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-stone-700">•</span>
            <Link to="/contact" className="hover:text-stone-300 transition-colors">
              Terms of Service
            </Link>
            <span className="text-stone-700">•</span>
            <span>© 2026 The Ribbon Story India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
