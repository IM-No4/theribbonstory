import { motion, AnimatePresence } from "framer-motion";
import { X, Star, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "../store/cartStore";
import toast from "react-hot-toast";

export default function QuickViewModal({ product, isOpen, onClose, onOpenCustomizer }) {
  const { addItem } = useCartStore();
  const [selectedImage, setSelectedImage] = useState(0);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addItem({
      productId: product._id || product.slug,
      name: product.name,
      image: product.images?.[0],
      price: product.price,
      quantity: 1,
      selectedOptions: [],
      customization: {},
    });
    toast.success(`${product.name} added to cart!`);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-espresso-700/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-cream-50 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-blush-200 z-10 grid grid-cols-1 md:grid-cols-2 max-h-[92vh] sm:max-h-[85vh] overflow-y-auto my-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 hover:bg-white text-espresso-500 hover:text-burgundy-900 transition shadow-xs"
          >
            <X size={18} />
          </button>

          {/* Left: Gallery */}
          <div className="p-4 sm:p-6 bg-gradient-to-br from-blush-50 to-peach-50 flex flex-col justify-center items-center">
            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-soft border border-blush-200/60 mb-3 max-w-[280px] md:max-w-none">
              <img
                src={product.images?.[selectedImage] || product.images?.[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-11 w-11 rounded-xl overflow-hidden border-2 transition ${
                      selectedImage === i ? "border-ribbon-500 shadow-xs" : "border-transparent opacity-60"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="p-4 sm:p-8 flex flex-col justify-between space-y-4 bg-white">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-ribbon-500">
                {product.category?.replace("-", " ")}
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-burgundy-900 mt-1">{product.name}</h3>
              
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-espresso-500">4.9 (128 reviews)</span>
              </div>

              <div className="mt-2.5 flex items-baseline gap-2.5">
                <span className="font-display text-xl sm:text-2xl font-extrabold text-burgundy-900">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.compareAtPrice && (
                  <span className="text-xs sm:text-sm text-espresso-300 line-through">
                    ₹{product.compareAtPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              <p className="text-xs text-espresso-500 mt-2.5 leading-relaxed">
                {product.description}
              </p>

              <div className="mt-4 pt-3 border-t border-espresso-100/60 space-y-1.5 text-xs text-espresso-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-ribbon-500" />
                  <span>Personalized &amp; crafted especially for you</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={15} className="text-ribbon-500" />
                  <span>Free express delivery across India</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {product.isCustomizable ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCustomizer(product);
                  }}
                  className="btn-primary w-full py-3 text-xs sm:text-sm font-semibold shadow-soft group"
                >
                  <span>Personalize This Keepsake →</span>
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="btn-primary w-full py-3 text-xs sm:text-sm font-semibold shadow-soft"
                >
                  Add to Cart — ₹{product.price}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

