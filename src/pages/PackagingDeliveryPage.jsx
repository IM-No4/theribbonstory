import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  Heart,
  Sparkles,
  Clock,
  MapPin,
  Check,
  ArrowRight,
  Gift,
  HelpCircle,
  MessageCircle,
} from "lucide-react";
import { useSeo } from "../utils/seo";

const PACKAGING_PILLARS = [
  {
    step: "01",
    title: "Custom Protective Cradle",
    desc: "Each figurine is gently nested in a soft, custom-contoured cradle tailored to hold its unique shape securely and softly in place.",
    badge: "Snug Fit",
    footer: "Cushioned with artisan care",
  },
  {
    step: "02",
    title: "Signature Keepsake Box",
    desc: "A clean, sturdy box crafted to protect your keepsake on its travels and look lovely on a shelf or desk long after unboxing.",
    badge: "Gift-Ready",
    footer: "Designed to be kept and cherished",
  },
  {
    step: "03",
    title: "Hand-Tied Studio Ribbon",
    desc: "Hand-finished with our signature satin ribbon and studio seal for an effortless, delightful unboxing experience.",
    badge: "Atelier Touch",
    footer: "A wonderful first impression",
  },
  {
    step: "04",
    title: "Personal Message Card",
    desc: "Includes a little note of craftsmanship, simple display suggestions, and your personalized gift message for your recipient.",
    badge: "Complimentary",
    footer: "A thoughtful personal touch",
  },
];

const DELIVERY_TIERS = [
  {
    region: "Metro Cities",
    transit: "2 – 3 Business Days",
    cities: "Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad",
    icon: Truck,
  },
  {
    region: "Tier-2 & State Capitals",
    transit: "3 – 5 Business Days",
    cities: "Jaipur, Chandigarh, Lucknow, Kochi, Indore, Bhopal, Surat, Patna and more",
    icon: Clock,
  },
  {
    region: "All Other Cities & Towns",
    transit: "4 – 6 Business Days",
    cities: "Reliable doorstep delivery across all serviceable pin codes in India",
    icon: MapPin,
  },
];

const COURIER_PARTNERS = [
  "BlueDart Express",
  "Delhivery Air",
  "DTDC",
  "Xpressbees",
  "Ekart",
];

export default function PackagingDeliveryPage() {
  useSeo({
    title: "Packaging & Delivery | The Ribbon Story",
    description:
      "Learn how every keepsake is lovingly packaged in our signature gift box and delivered across India.",
  });

  return (
    <main className="min-h-screen bg-[#FBF8F4] text-stone-800">
      {/* 1. HERO SECTION */}
      <section className="relative border-b border-stone-200/80 bg-white">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-rose-100/50 blur-3xl" />
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50/60 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-700 shadow-2xs sm:text-xs">
              <Gift size={14} />
              Thoughtfully Packaged &amp; Delivered
            </span>

            <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
              Packaging &amp; Delivery
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">
              Every keepsake is a little memory. We wrap, cushion, and send each creation
              with love so opening your parcel feels just as special as keeping it.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/track-order"
                className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2"
              >
                <Truck size={15} />
                <span>Track Your Order</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/faqs"
                className="inline-flex items-center gap-1.5 py-2.5 px-5 rounded-full border border-stone-200 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
              >
                <HelpCircle size={14} />
                <span>FAQs &amp; Care</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PACKAGING PRESENTATION */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] text-rose-700">
            Made To Be Gifted
          </span>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-stone-900">
            Our Signature Gift Presentation
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-stone-600">
            Arrives ready to delight, with no extra wrapping needed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {PACKAGING_PILLARS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-[0_3px_18px_rgba(60,40,30,0.025)] flex flex-col justify-between group hover:border-rose-200 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                    STEP {item.step}
                  </span>
                  <span className="text-[10px] font-semibold text-stone-600 bg-[#FBF8F4] px-2.5 py-1 rounded-full border border-stone-200/60">
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-display font-bold text-stone-900 text-lg">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-stone-600">
                  {item.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center gap-2 text-xs font-medium text-stone-600">
                <Check size={14} className="text-rose-600 shrink-0" />
                <span>{item.footer}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. TRANSIT TIMELINES & COURIER PARTNERS */}
      <section className="border-t border-stone-200/80 bg-white py-10 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] text-rose-700">
              Doorstep Delivery
            </span>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-stone-900">
              Estimated Delivery Times
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-600">
              Personalized figurines are handcrafted to order, then dispatched via express couriers:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {DELIVERY_TIERS.map((tier, idx) => {
              const Icon = tier.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-stone-200/80 bg-[#FBF8F4] p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="h-10 w-10 rounded-xl bg-white text-rose-700 border border-stone-200/80 flex items-center justify-center mb-3">
                      <Icon size={19} />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      {tier.region}
                    </span>
                    <h3 className="font-display font-bold text-xl text-stone-900 mt-1">
                      {tier.transit}
                    </h3>
                    <p className="mt-2 text-xs text-stone-500 leading-relaxed">
                      {tier.cities}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200/60 text-[11px] font-medium text-stone-600 flex items-center gap-1.5">
                    <Check size={13} className="text-rose-600" />
                    <span>Live Tracking Updates</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trusted Couriers Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FBF8F4] border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white border border-stone-200 text-rose-600 flex items-center justify-center shrink-0">
                <Truck size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">
                  Delivered With Care
                </p>
                <p className="text-[11px] text-stone-500">
                  Shipped via leading express courier networks across India
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-stone-600">
              {COURIER_PARTNERS.map((name) => (
                <span
                  key={name}
                  className="px-3 py-1 rounded-full bg-white border border-stone-200 text-[11px]"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. STUDIO PROMISE & PEACE OF MIND */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-3xl border border-rose-100 bg-white p-6 sm:p-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 shadow-[0_4px_20px_rgba(60,40,30,0.03)]">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Heart size={32} />
          </div>

          <div className="space-y-1.5 text-center md:text-left flex-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-700">
              Our Studio Promise
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900">
              Here To Make It Right
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
              We want you to love your keepsake from the moment it arrives. If anything about
              your order isn't completely right when you open your parcel, simply reach out to
              our studio team and we'll take care of it for you right away.
            </p>
          </div>

          <Link
            to="/contact"
            className="btn-primary py-2.5 px-6 text-xs font-bold shrink-0 flex items-center gap-2"
          >
            <MessageCircle size={15} />
            <span>Chat With Us</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
