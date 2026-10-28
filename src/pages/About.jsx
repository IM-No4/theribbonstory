
import { motion } from "framer-motion";
import {
  Heart,
  Sparkles,
  Users,
  Gift,
  ArrowRight,
  Camera,
  Shapes,
  Package,
} from "lucide-react";
import { Link } from "react-router-dom";
import { LogoMark } from "../components/Logo";
import { useSeo } from "../utils/seo";

const values = [
  {
    icon: Heart,
    title: "Memories That Matter",
    text: "We believe the little moments in life deserve something more lasting than a photo on your phone.",
  },
  {
    icon: Sparkles,
    title: "Made to Feel Special",
    text: "From playful collectibles to personalized figurines, each creation is designed to bring a little joy.",
  },
  {
    icon: Users,
    title: "A Gift for Your Story",
    text: "Celebrate friendships, family, pets, milestones or simply something that makes you smile.",
  },
  {
    icon: Gift,
    title: "Little Things, Big Meaning",
    text: "Find a thoughtful keepsake for someone you love, or a tiny companion to brighten your own space.",
  },
];

const offerings = [
  {
    icon: Shapes,
    number: "01",
    title: "Ready-made collectibles",
    text: "Cute desk buddies, flexi creatures, fridge magnets and miniature decor for everyday joy.",
    link: "/shop",
    linkText: "Explore collections",
  },
  {
    icon: Camera,
    number: "02",
    title: "Personalized figurines",
    text: "Turn a favourite photograph into a custom figurine inspired by the people or pets you cherish.",
    link: "/personalized",
    linkText: "Create your figurine",
  },
  {
    icon: Package,
    number: "03",
    title: "Keepsakes for occasions",
    text: "Discover little gifts for birthdays, anniversaries, celebrations and moments worth remembering.",
    link: "/shop",
    linkText: "Find your keepsake",
  },
];

export default function About() {
  useSeo({
    title: "Our Story | The Ribbon Story",
    description:
      "Discover The Ribbon Story: cute 3D-printed collectibles, personalized figurines and little keepsakes inspired by the moments that matter.",
  });

  return (
    <main className="min-h-screen overflow-hidden bg-[#FBF8F4] text-stone-800">
      {/* INTRODUCTION */}
      <section className="relative border-b border-stone-200/70">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-rose-100/50 blur-3xl sm:h-96 sm:w-96" />

        <div className="container-page relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="min-w-0"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-white px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-rose-700 shadow-sm sm:text-xs">
                <Heart size={13} />
                Our story
              </span>

              <h1 className="mt-5 max-w-2xl font-display text-3xl font-bold leading-[1.12] tracking-tight text-stone-900 sm:mt-6 sm:text-5xl lg:text-6xl">
                You give us a memory.
                <span className="mt-1 block text-rose-700">
                  We turn it into something you can keep.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-stone-600 sm:mt-5 sm:text-base sm:leading-7">
                Some things are too special to leave in a camera roll.
                At The Ribbon Story, we create 3D-printed collectibles
                and personalized figurines that give your favourite
                moments a little place in the real world.
              </p>

              <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 sm:text-base sm:leading-7">
                From a tiny creature for your desk to a figurine inspired
                by someone you love, we believe meaningful gifts don't
                have to be big. They just have to mean something.
              </p>

              <p className="mt-5 font-script text-xl text-rose-700 sm:text-2xl">
                Little things. Big meaning.
              </p>
            </motion.div>

            {/* BRAND CARD */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="mx-auto w-full max-w-md"
            >
              <div className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-[0_12px_40px_rgba(60,40,30,0.06)] sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#FBF5EF] p-2 sm:h-20 sm:w-20">
                    <LogoMark to="/" size="compact" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-display text-lg font-bold leading-tight text-stone-900 sm:text-xl">
                      The Ribbon Story
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500 sm:text-xs">
                      3D Keepsake Atelier
                    </p>
                  </div>
                </div>

                <div className="my-5 h-px bg-stone-100 sm:my-6" />

                <p className="font-display text-2xl font-bold leading-snug text-stone-900 sm:text-3xl">
                  Not just something to give.
                  <span className="text-rose-700"> Something to remember.</span>
                </p>

                <p className="mt-3 text-xs leading-5 text-stone-500 sm:text-sm sm:leading-6">
                  Small collectibles. Personal stories. Keepsakes
                  made to bring a little happiness into everyday life.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {["Collectibles", "Personalized gifts", "3D keepsakes"].map(
                    (label) => (
                      <span
                        key={label}
                        className="rounded-full border border-stone-200 bg-[#FBF8F4] px-3 py-1.5 text-[10px] font-medium text-stone-600 sm:text-xs"
                      >
                        {label}
                      </span>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHAT WE CREATE */}
      <section className="container-page mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mb-6 sm:mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-700 sm:text-xs">
            A little something for everyone
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-stone-900 sm:text-3xl">
            What you'll find here
          </h2>
          <p className="mt-2 max-w-xl text-xs leading-5 text-stone-600 sm:text-sm sm:leading-6">
            Whether you're shopping for yourself or searching for a
            thoughtful gift, there's more than one way to make it personal.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {offerings.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.number}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="flex flex-col rounded-2xl border border-stone-200/80 bg-white p-5 transition hover:border-rose-200 sm:rounded-3xl sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                    <Icon size={20} strokeWidth={1.7} />
                  </div>
                  <span className="font-display text-sm font-bold text-stone-300">
                    {item.number}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-lg font-bold text-stone-900 sm:text-xl">
                  {item.title}
                </h3>

                <p className="mt-2 flex-1 text-xs leading-5 text-stone-600 sm:text-sm sm:leading-6">
                  {item.text}
                </p>

                <Link
                  to={item.link}
                  className="mt-5 inline-flex min-h-10 items-center gap-2 text-xs font-bold text-rose-700 transition hover:text-rose-900 sm:text-sm"
                >
                  {item.linkText}
                  <ArrowRight size={15} />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* OUR VALUES */}
      <section className="border-y border-stone-200/70 bg-white">
        <div className="container-page mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="mb-6 max-w-xl sm:mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-700 sm:text-xs">
              What matters to us
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-stone-900 sm:text-3xl">
              The little things behind every keepsake
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {values.map((value, index) => {
              const Icon = value.icon;

              return (
                <motion.article
                  key={value.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="rounded-2xl border border-stone-100 bg-[#FBF8F4] p-4 sm:p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-rose-700 ring-1 ring-inset ring-stone-200/80">
                    <Icon size={19} strokeWidth={1.7} />
                  </div>

                  <h3 className="mt-3 font-display text-base font-bold text-stone-900 sm:text-lg">
                    {value.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-stone-600 sm:text-sm sm:leading-6">
                    {value.text}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ONE CLOSING CTA */}
      <section className="px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl rounded-3xl bg-[#302522] px-5 py-8 text-center sm:px-10 sm:py-11">
          <Sparkles className="mx-auto text-rose-300" size={23} />

          <h2 className="mx-auto mt-3 max-w-2xl font-display text-2xl font-bold leading-tight text-white sm:text-4xl">
            Ready to make a little memory tangible?
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-xs leading-6 text-stone-300 sm:text-sm sm:leading-7">
            Find a collectible that makes you smile, or create a
            personalized figurine inspired by someone special.
          </p>

          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/shop"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
            >
              Explore Collections
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/personalized"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Create Your Figurine
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
