
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Camera,
  Palette,
  Printer,
  PackageCheck,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";
import { useSeo } from "../utils/seo";

const steps = [
  {
    num: "01",
    title: "Choose your keepsake",
    desc: "Explore our ready-made 3D-printed collectibles or create a personalized figurine inspired by your photo.",
    detail: "Find something playful for yourself or meaningful for someone special.",
    icon: Camera,
    tag: "Choose",
  },
  {
    num: "02",
    title: "Make it personal",
    desc: "For personalized figurines, share your reference photo and choose the available options for your keepsake.",
    detail: "Add optional base text where supported, then review your selections before ordering.",
    icon: Palette,
    tag: "Customize",
  },
  {
    num: "03",
    title: "Made for your order",
    desc: "We prepare your chosen creation using our 3D-printing process, with attention to its shape, details and finish.",
    detail: "Personalized figurines are made to order. Ready-made items follow their listed availability.",
    icon: Printer,
    tag: "Create",
  },
  {
    num: "04",
    title: "Ready to be gifted",
    desc: "Your keepsake is prepared for delivery so it can become part of a desk, shelf, celebration or special memory.",
    detail: "Delivery estimates and packaging details are provided according to your order.",
    icon: PackageCheck,
    tag: "Deliver",
  },
];

export default function HowItWorksPage() {
  useSeo({
    title: "How It Works | The Ribbon Story",
    description:
      "Discover how The Ribbon Story turns your ideas and favourite photos into cute 3D-printed collectibles and personalized keepsakes.",
  });

  return (
    <main className="min-h-screen overflow-hidden bg-[#FBF8F4] text-stone-800">
      {/* HERO */}
      <section className="relative border-b border-stone-200/70">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-rose-100/50 blur-3xl sm:h-96 sm:w-96" />

        <div className="container-page relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-white px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-700 shadow-sm sm:text-xs">
              <Sparkles size={13} />
              A little story behind every keepsake
            </span>

            <h1 className="mx-auto mt-5 max-w-3xl font-display text-3xl font-bold leading-[1.12] tracking-tight text-stone-900 sm:mt-6 sm:text-5xl lg:text-6xl">
              From your idea
              <span className="block text-rose-700">
                to something you can keep.
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-stone-600 sm:mt-5 sm:text-base sm:leading-7">
              Discover a collectible you love, make it personal if you wish,
              and let us turn it into a little keepsake for your home or
              someone special.
            </p>
          </motion.div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="container-page mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:py-20">
        <div className="mb-7 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-700 sm:text-xs">
              Simple by design
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-stone-900 sm:text-3xl">
              Your keepsake journey
            </h2>
          </div>
          <span className="hidden pb-1 text-xs text-stone-500 sm:block">
            Four simple steps
          </span>
        </div>

        <div className="relative">
          {/* Timeline connector on desktop */}
          <div className="absolute bottom-10 left-[27px] top-10 hidden w-px bg-rose-200 md:block" />

          <div className="space-y-3 sm:space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.article
                  key={step.num}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.06,
                  }}
                  className="relative rounded-2xl border border-stone-200/80 bg-white p-4 shadow-[0_3px_18px_rgba(60,40,30,0.025)] transition hover:border-rose-200 sm:rounded-3xl sm:p-6 md:p-7"
                >
                  <div className="flex items-start gap-3.5 sm:gap-5">
                    <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100 sm:h-14 sm:w-14">
                      <Icon size={21} strokeWidth={1.7} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[10px] font-bold tracking-[0.12em] text-rose-700 sm:text-xs">
                          STEP {step.num}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-stone-300" />
                        <span className="text-[10px] font-medium text-stone-500 sm:text-xs">
                          {step.tag}
                        </span>
                      </div>

                      <h3 className="mt-1.5 font-display text-lg font-bold leading-snug text-stone-900 sm:mt-2 sm:text-2xl">
                        {step.title}
                      </h3>

                      <p className="mt-2 text-xs leading-5 text-stone-600 sm:text-sm sm:leading-6">
                        {step.desc}
                      </p>

                      <div className="mt-3 flex items-start gap-2 border-t border-stone-100 pt-3">
                        <Check
                          size={14}
                          className="mt-0.5 shrink-0 text-rose-600"
                        />
                        <p className="text-[11px] leading-5 text-stone-500 sm:text-xs">
                          {step.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="px-4 pb-10 sm:px-6 sm:pb-16">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#302522] px-5 py-9 text-center sm:px-10 sm:py-12 lg:py-14">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-200 sm:text-xs">
            <Sparkles size={14} />
            Little things. Big meaning.
          </span>

          <h2 className="mx-auto mt-3 max-w-2xl font-display text-2xl font-bold leading-tight text-white sm:text-4xl">
            Find a little something worth keeping.
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-xs leading-6 text-stone-300 sm:text-sm sm:leading-7">
            Choose a cute collectible or create a personalized figurine
            inspired by a favourite memory.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:mt-7 sm:flex-row">
            <Link
              to="/shop"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
            >
              Shop Collectibles
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/personalized"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Personalize a Figurine
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
