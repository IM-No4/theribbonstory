import { motion } from "framer-motion";
import { Heart, Sparkles, Users, Leaf, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { LogoMark } from "../components/Logo";

const values = [
  { icon: Heart, title: "Memory First", text: "We don't build generic products. We build physical representations of your real life memories." },
  { icon: Sparkles, title: "Handcrafted Care", text: "From 3D sculpting to acrylic photo sealing, every piece is inspected and finished by hand." },
  { icon: Users, title: "For Every Moment", text: "Designed for birthdays, anniversaries, best friends, pets, and quiet everyday milestones." },
  { icon: Leaf, title: "Ribbon Packaging", text: "Thoughtfully packaged in tissue, ribbon, and luxury gift boxes — ready to bring happy tears." },
];

export default function About() {
  return (
    <div className="bg-cream-50 min-h-screen py-16 sm:py-24">
      <div className="container-page space-y-20">
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            <span className="section-eyebrow">Our Story &amp; Philosophy</span>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-burgundy-900 leading-tight">
              You give us a memory. We turn it into something you can keep.
            </h1>
            <p className="text-espresso-500 text-base leading-relaxed">
              The Ribbon Story was born out of a simple belief: our most cherished memories deserve more than staying buried inside a phone camera roll.
            </p>
            <p className="text-espresso-500 text-base leading-relaxed">
              What started as a small passion studio crafting personalized acrylic photo magnets evolved into a D2C keepsake brand. Today, we turn pet photos into 3D figurine magnets, couple portraits into 3D sculpts, travel moments into passport stamps, and milestone days into physical objects that live permanently on your fridge door.
            </p>
            <p className="text-espresso-500 text-base italic font-script text-xl text-ribbon-600">
              "Little memories. Beautiful keepsakes."
            </p>

            <div className="pt-2">
              <Link to="/personalized" className="btn-primary py-3.5 px-7 text-sm font-semibold">
                <span>Start Crafting Your Keepsake</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="p-8 rounded-3xl bg-white border border-blush-200 shadow-xl text-center space-y-4">
              <div className="mx-auto h-28 w-28 rounded-full bg-blush-50 p-3 shadow-inner flex items-center justify-center">
                <LogoMark to="/" size="compact" />
              </div>
              <h3 className="font-display text-2xl font-bold text-burgundy-900">The Ribbon Story Studio</h3>
              <p className="text-xs text-espresso-400">
                Thoughtfully crafted in India • Pan-India Express Delivery
              </p>
            </div>
          </motion.div>
        </div>

        {/* Values */}
        <div className="pt-12 border-t border-blush-200">
          <div className="text-center max-w-lg mx-auto mb-12">
            <span className="section-eyebrow">Crafting Values</span>
            <h2 className="font-display text-3xl font-bold text-burgundy-900 mt-1">
              What drives every keepsake
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={v.title} className="card-editorial p-6 bg-white text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blush-100 text-ribbon-600">
                  <v.icon size={20} />
                </div>
                <h3 className="font-display font-bold text-lg text-burgundy-900">{v.title}</h3>
                <p className="text-xs text-espresso-500 leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

