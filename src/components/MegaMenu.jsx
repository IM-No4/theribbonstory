import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MENU_CATEGORIES } from "../data/menuCategories";

export default function MegaMenu({ activeCategory, onClose, onMouseEnter }) {
  const cat = MENU_CATEGORIES.find((c) => c.id === activeCategory);
  if (!cat) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
      className="absolute left-0 right-0 top-full bg-white border-b border-slate-200/80 shadow-2xl z-50 py-7 px-4 sm:px-6 lg:px-10"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
        {/* Subcategories Columns */}
        <div className="col-span-8 grid grid-cols-3 gap-6">
          {cat.columns.map((col, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-ribbon-500"></span>
                <span>{col.title}</span>
              </h4>
              <ul className="space-y-2">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      to={link.to}
                      onClick={onClose}
                      className="text-xs text-slate-600 hover:text-ribbon-600 hover:translate-x-0.5 transition-all block py-0.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Visual Promo Banner */}
        {cat.promo && (
          <div className="col-span-4 rounded-2xl bg-gradient-to-br from-rose-50/60 via-slate-50 to-pink-50/40 p-4 border border-rose-100/70 flex gap-4 items-center shadow-xs">
            <img
              src={cat.promo.img}
              alt={cat.promo.title}
              className="h-28 w-24 rounded-xl object-cover shadow-sm border border-white shrink-0"
            />
            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-ribbon-600 bg-white px-2 py-0.5 rounded-md inline-block shadow-xs border border-rose-100">
                {cat.promo.tag}
              </span>
              <h5 className="font-display font-bold text-sm text-slate-900 leading-tight truncate">
                {cat.promo.title}
              </h5>
              <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{cat.promo.subtitle}</p>
              <Link
                to={cat.promo.to}
                onClick={onClose}
                className="inline-flex items-center gap-1 text-xs font-bold text-ribbon-600 hover:text-ribbon-700 pt-0.5"
              >
                <span>{cat.promo.cta}</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
