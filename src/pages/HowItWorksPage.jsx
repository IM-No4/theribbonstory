import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "Choose Your Piece",
      desc: "Pick from photo magnets, polaroid keepsakes, 3D pet & couple magnets, or curated luxury gift hampers.",
      detail: "Select the shape, size, and material finish that best captures your memory.",
    },
    {
      num: "02",
      title: "Personalize in Studio",
      desc: "Upload high-resolution photos directly from your phone, add names, special dates, or handwritten notes.",
      detail: "Our live customizer gives you an instant preview before finalizing your order.",
    },
    {
      num: "03",
      title: "Handcrafted & Printed",
      desc: "Our studio technicians precision 3D-sculpt, acrylic seal, and hand-polish your unique keepsake.",
      detail: "Every piece passes strict quality checks for vivid colors and smooth scratch-proof durability.",
    },
    {
      num: "04",
      title: "Luxury Ribbon Unboxing",
      desc: "Packed with premium tissue paper, signature ribbon, and a personalized thank-you note card.",
      detail: "Express pan-India delivery arrives safely at your doorstep within 3-5 business days.",
    },
  ];

  return (
    <div className="bg-cream-50 min-h-screen py-16 sm:py-24">
      <div className="container-page max-w-4xl">
        <div className="text-center mb-16">
          <span className="section-eyebrow">Behind The Craft</span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-display font-bold text-burgundy-900 leading-tight">
            From memory to keepsake.
          </h1>
          <p className="mt-4 text-base text-espresso-500 max-w-xl mx-auto leading-relaxed">
            Every product at The Ribbon Story follows a deliberate, loving creation journey. Here is how your memory comes to life.
          </p>
        </div>

        {/* 4 Steps Timeline */}
        <div className="space-y-12 relative before:absolute before:left-8 before:top-10 before:bottom-10 before:w-0.5 before:bg-blush-200 hidden md:block">
          {steps.map((step, index) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start gap-8 relative"
            >
              <div className="h-16 w-16 rounded-full bg-burgundy-900 text-cream-50 font-display text-xl font-bold flex items-center justify-center shrink-0 shadow-lg border-4 border-cream-50 z-10">
                {step.num}
              </div>

              <div className="flex-1 card-editorial p-8 bg-white">
                <h3 className="font-display text-2xl font-bold text-burgundy-900">{step.title}</h3>
                <p className="text-base text-espresso-600 mt-2 font-medium">{step.desc}</p>
                <p className="text-xs text-espresso-400 mt-3 pt-3 border-t border-espresso-100/60 leading-relaxed">
                  {step.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile View */}
        <div className="space-y-6 md:hidden">
          {steps.map((step) => (
            <div key={step.num} className="card-editorial p-6 bg-white">
              <span className="text-xs font-bold text-ribbon-500 font-display">STEP {step.num}</span>
              <h3 className="font-display text-xl font-bold text-burgundy-900 mt-1">{step.title}</h3>
              <p className="text-sm text-espresso-600 mt-2">{step.desc}</p>
              <p className="text-xs text-espresso-400 mt-2 pt-2 border-t border-espresso-100">{step.detail}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Link to="/personalized" className="btn-primary py-4 px-8 text-base shadow-lg">
            Create Your Keepsake Now
          </Link>
        </div>
      </div>
    </div>
  );
}
