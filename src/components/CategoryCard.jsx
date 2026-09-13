import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CategoryCard({ to, title, description, icon: Icon, gradient, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.1 }}
    >
      <Link
        to={to}
        className="group relative flex h-80 flex-col justify-end overflow-hidden rounded-3xl p-7 shadow-soft"
        style={{ background: gradient }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
        <div className="absolute -right-6 -top-6 opacity-15 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
          <Icon size={160} strokeWidth={1} color="#fff" />
        </div>

        <div className="relative z-10">
          <h3 className="font-display text-2xl text-cream-50">{title}</h3>
          <p className="mt-2 text-sm text-cream-100/85 leading-relaxed max-w-[85%]">{description}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-cream-50 border-b border-cream-50/40 pb-0.5 transition-all group-hover:gap-2.5 group-hover:border-cream-50">
            Shop the collection <ArrowUpRight size={15} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
