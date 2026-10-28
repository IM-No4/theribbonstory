import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Search,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Heart,
  Truck,
  CreditCard,
  MessageCircle,
  Sun,
  Droplets,
  Feather,
  CheckCircle2,
  Package,
  ArrowRight,
  Check,
} from "lucide-react";
import { useSeo } from "../utils/seo";

const CARE_TIPS = [
  {
    icon: Feather,
    title: "Soft Dusting",
    desc: "A light pass with a soft brush or dry microfiber cloth keeps your keepsake looking fresh and detailed.",
    tip: "A simple dusting every now and then is all it needs.",
  },
  {
    icon: Sun,
    title: "Indoor Display",
    desc: "Display indoors on your favourite desk, bookshelf, or bedside table where it can bring a smile to your space.",
    tip: "Designed to look lovely in any room.",
  },
  {
    icon: Droplets,
    title: "Gentle Refresh",
    desc: "If needed, lightly wipe with a soft cloth and a touch of clean water, then let it dry naturally.",
    tip: "Solid colors crafted to stay vibrant.",
  },
  {
    icon: Heart,
    title: "Included Stand",
    desc: "Rest your figurine on its included smooth wooden stand for an elegant, steady tabletop presentation.",
    tip: "Comes ready to display right away.",
  },
];

const FAQ_CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "personalization", label: "Photo & Figurines" },
  { id: "care-materials", label: "Materials & Care" },
  { id: "shipping", label: "Delivery & Shipping" },
  { id: "orders", label: "Payments & Orders" },
];

const FAQS = [
  {
    category: "personalization",
    q: "What kind of photos work best for custom 3D keepsakes?",
    a: "Clear, well-lit photos taken from front or 3/4 angles work best. Selfies, candid portraits, wedding photos, and phone snapshots are all welcome! Make sure facial features, hair, and preferred outfits are clearly visible.",
  },
  {
    category: "personalization",
    q: "Will I get to preview what my 3D figurine looks like?",
    a: "Absolutely! Our live online 3D customizer generates an instant stylized preview right on your screen so you can inspect the look, choose sizing, and add your personalized engraved stand inscription before placing your order.",
  },
  {
    category: "personalization",
    q: "What can I engrave on the keepsake stand?",
    a: "You can engrave names, anniversary dates, heartfelt messages, nicknames, coordinates, or inside jokes (up to 40 characters).",
  },
  {
    category: "care-materials",
    q: "What are The Ribbon Story figurines made of?",
    a: "Every figurine is crafted using premium, non-toxic Bio-PLA derived from renewable sugarcane and cornstarch. It has a warm, tactile satin finish, vibrant solid colors throughout, and wonderful durability.",
  },
  {
    category: "care-materials",
    q: "How should I clean and care for my 3D keepsake?",
    a: "Simply dust it gently with a soft cloth or brush whenever needed. A light wipe with clean water keeps it fresh and bright.",
  },
  {
    category: "shipping",
    q: "How long does it take from order to doorstep delivery?",
    a: "Personalized photo figurines take 1–3 business days for precision 3D slicing, multi-color printing, and gift packaging. Once dispatched, express courier transit takes 2–3 business days for metro cities and 3–5 business days across the rest of India.",
  },
  {
    category: "shipping",
    q: "What if something isn't right with my order?",
    a: "We want you to love your keepsake. If anything is amiss when your package arrives, simply message our friendly team on WhatsApp or email, and we will gladly make and send you a fresh replacement.",
  },
  {
    category: "shipping",
    q: "How do I track my active order?",
    a: "Visit our dedicated Track Order page (or click 'Track Order' in the menu or footer) and enter your 6-character Order ID for real-time live tracking and delivery milestones.",
  },
  {
    category: "orders",
    q: "What payment options are accepted?",
    a: "We support all major Indian payment methods: UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit cards (Visa, Mastercard, RuPay), Net Banking across 50+ banks, and Cash on Delivery (COD) with verification.",
  }
];

export default function FaqPage() {
  useSeo({
    title: "FAQs & Keepsake Care | The Ribbon Story",
    description:
      "Frequently asked questions about personalized 3D figurines, photo requirements, materials, express delivery, and keepsake care instructions.",
  });

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory =
        activeCategory === "all" || faq.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <main className="min-h-screen bg-[#FBF8F4] text-stone-800">
      {/* 1. HERO SECTION */}
      <section className="relative border-b border-stone-200/80 bg-white">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-rose-100/50 blur-3xl" />
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50/60 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-700 shadow-2xs sm:text-xs">
              <HelpCircle size={14} />
              Help Center &amp; Care Guide
            </span>

            <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              FAQs &amp; Keepsake Care
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">
              Everything you need to know about photo-to-3D keepsakes, our solid-pigment
              materials, safe delivery, and keeping your figurines beautiful for a lifetime.
            </p>

            {/* Live Search Input */}
            <div className="mt-6 relative max-w-lg mx-auto">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions (e.g. photo, cleaning, delivery, materials)..."
                className="w-full pl-11 pr-4 py-3 bg-[#FBF8F4] border border-stone-200 rounded-2xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400 hover:text-stone-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. KEEPSAKE CARE SECTION (HIGHLIGHTED PROMINENTLY) */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] text-rose-700">
              Simple &amp; Long-Lasting
            </span>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-stone-900">
              How to Care for Your 3D Keepsake
            </h2>
          </div>
          <p className="text-xs text-stone-500 max-w-sm">
            Simple, thoughtful suggestions to keep your 3D creation looking lovely for years to come:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CARE_TIPS.map((tip, idx) => {
            const Icon = tip.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-[0_3px_16px_rgba(60,40,30,0.025)] flex flex-col justify-between"
              >
                <div>
                  <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-3.5">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-display font-bold text-stone-900 text-base">
                    {tip.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-stone-600">
                    {tip.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-[11px] text-stone-600 font-medium">
                  <Check size={13} className="shrink-0 text-rose-600" />
                  <span>{tip.tip}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. INTERACTIVE FAQ ACCORDIONS */}
      <section className="border-t border-stone-200/80 bg-white py-10 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] text-rose-700">
              Answers &amp; Details
            </span>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-stone-900">
              Frequently Asked Questions
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap mb-8">
            {FAQ_CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setOpenFaqIndex(null);
                  }}
                  className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                    active
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-[#FBF8F4] text-stone-600 hover:bg-stone-100 border border-stone-200/80"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-stone-200 bg-[#FBF8F4]">
                <p className="font-display text-base font-bold text-stone-800">
                  No matching questions found
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  Try searching for another keyword or reach out directly to our concierge.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="mt-3 text-xs font-bold text-rose-600 hover:underline"
                >
                  Reset search
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-stone-200/80 bg-[#FBF8F4] transition-all overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4"
                      aria-expanded={isOpen}
                    >
                      <span className="font-display font-bold text-stone-900 text-sm sm:text-base leading-snug">
                        {faq.q}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`text-stone-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-rose-600" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-200/60 pt-3">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 4. CONCIERGE HELP CTA BANNER */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-3xl bg-[#302522] p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-300">
              <Sparkles size={13} />
              Need custom assistance?
            </span>
            <h3 className="font-display text-2xl text-white sm:text-3xl font-bold leading-tight">
              Have a question not answered here?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 max-w-lg leading-relaxed">
              Our studio artisans are ready to help with special photo requests, bulk corporate gifting, or order inquiries.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <Link
              to="/contact"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-xs sm:text-sm font-bold text-white transition hover:bg-rose-700"
            >
              <MessageCircle size={16} />
              Contact Studio
            </Link>
            <Link
              to="/packaging-delivery"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-xs sm:text-sm font-bold text-white transition hover:bg-white/10"
            >
              <Truck size={16} />
              Packaging &amp; Delivery
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
