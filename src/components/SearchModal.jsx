import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { api, assetUrl } from "../api/client";

export default function SearchModal({ isOpen, onClose, onOpenCustomizer }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      api
        .get("/products", { params: { search: query } })
        .then(({ data }) => setResults(data.products || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 lg:p-10 flex justify-center items-start pt-16 sm:pt-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-espresso-700/50 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          className="relative w-full max-w-2xl bg-cream-50 rounded-3xl shadow-2xl overflow-hidden border border-blush-200 z-10"
        >
          {/* Search Input Bar */}
          <div className="p-4 sm:p-5 bg-white border-b border-blush-200 flex items-center gap-3">
            <Search className="text-ribbon-500 shrink-0" size={22} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search keepsakes, photo magnets, 3D pet gifts..."
              className="w-full bg-transparent text-base text-burgundy-900 placeholder:text-espresso-300 focus:outline-none"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 rounded-full text-espresso-400 hover:text-burgundy-900"
              >
                <X size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-xs font-semibold text-espresso-400 hover:text-burgundy-900 px-2 py-1"
            >
              ESC
            </button>
          </div>

          {/* Results Area */}
          <div className="max-h-96 overflow-y-auto p-4 sm:p-6 space-y-3">
            {loading ? (
              <div className="py-8 text-center text-espresso-400 text-sm">Searching memories...</div>
            ) : query && results.length === 0 ? (
              <div className="py-8 text-center text-espresso-400 text-sm">
                No keepsakes found for &quot;{query}&quot;. Try searching &quot;3D&quot;, &quot;pet&quot;, &quot;photo magnet&quot;, or &quot;hamper&quot;.
              </div>
            ) : results.length > 0 ? (
              results.map((p) => (
                <div
                  key={p._id || p.slug}
                  className="p-3 rounded-2xl bg-white border border-espresso-100 hover:border-ribbon-300 transition flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={assetUrl(p.images?.[0])}
                      alt={p.name}
                      className="h-14 w-14 rounded-xl object-cover border border-blush-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/product/${p.slug}`}
                        onClick={onClose}
                        className="font-display font-semibold text-burgundy-900 hover:text-ribbon-600 truncate block text-sm sm:text-base"
                      >
                        {p.name}
                      </Link>
                      <p className="text-xs text-espresso-400 truncate">{p.tagline}</p>
                      <span className="font-display font-semibold text-xs text-burgundy-900 mt-0.5 block">
                        ₹{p.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {p.isCustomizable ? (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenCustomizer(p);
                        }}
                        className="btn-secondary py-1.5 px-3 text-xs"
                      >
                        Personalize →
                      </button>
                    ) : (
                      <Link
                        to={`/product/${p.slug}`}
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-blush-100 text-espresso-500"
                      >
                        <ArrowRight size={18} />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-espresso-400 mb-3">
                  Popular Keepsake Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {["3D Pet Magnet", "Polaroid Magnet", "Custom Couple Keepsake", "Travel Memory Magnet", "Gift Hamper"].map(
                    (term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1.5 rounded-full bg-white border border-blush-200 text-xs text-burgundy-800 hover:border-ribbon-400 hover:bg-blush-50 transition flex items-center gap-1.5"
                      >
                        <Sparkles size={12} className="text-ribbon-500" />
                        {term}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
