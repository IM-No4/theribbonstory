import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Gift, Heart, RotateCcw } from "lucide-react";
import { assetUrl } from "../api/client";

export default function VirtualUnboxingModal({ isOpen, onClose, product, customNote }) {
  const [stage, setStage] = useState("tied"); // "tied" -> "untying" -> "unboxed"

  if (!isOpen) return null;

  const handleUntie = () => {
    setStage("untying");
    setTimeout(() => {
      setStage("unboxed");
    }, 1200);
  };

  const handleReset = () => {
    setStage("tied");
  };

  const productImage = product?.images?.[0] || product?.image || "/images/photo-magnet.webp";
  const productName = product?.name || "Bespoke Keepsake Gift Box";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-burgundy-950 to-slate-950 text-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden p-6 sm:p-8 text-center space-y-6"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-rose-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="text-amber-400" />
              <span>Virtual Ribbon Unboxing Experience</span>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Interactive Unboxing Stage */}
          <div className="relative min-h-[320px] flex flex-col items-center justify-center py-4">
            {stage === "tied" && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-6 flex flex-col items-center"
              >
                {/* 3D Gift Box with Ribbon Bow */}
                <div className="relative w-56 h-56 rounded-3xl bg-gradient-to-br from-burgundy-800 via-burgundy-900 to-rose-950 border-2 border-rose-300/40 shadow-2xl flex items-center justify-center group cursor-pointer"
                  onClick={handleUntie}
                >
                  {/* Vertical Satin Ribbon */}
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-10 bg-gradient-to-r from-ribbon-500 via-rose-400 to-ribbon-600 shadow-md shadow-black/40 border-x border-rose-200/50" />
                  {/* Horizontal Satin Ribbon */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-gradient-to-b from-ribbon-500 via-rose-400 to-ribbon-600 shadow-md shadow-black/40 border-y border-rose-200/50" />

                  {/* Golden Center Wax Seal Bow */}
                  <div className="relative z-10 h-16 w-16 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 shadow-xl flex items-center justify-center border-2 border-amber-100 group-hover:scale-110 transition-transform">
                    <Gift size={28} className="text-burgundy-950 stroke-[2.2]" />
                  </div>

                  <span className="absolute -bottom-3 px-3 py-1 rounded-full bg-white text-burgundy-900 text-[10px] font-bold uppercase tracking-wider shadow-lg">
                    The Ribbon Story Box
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-white">
                    Your Bespoke Keepsake Box is Sealed
                  </h3>
                  <p className="text-xs text-rose-200/80">
                    Click the button below to untie the satin ribbon and preview the unboxing.
                  </p>
                </div>

                <button
                  onClick={handleUntie}
                  className="btn-primary py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-rose-950/60 animate-bounce"
                >
                  <Gift size={16} />
                  <span>Untie Satin Ribbon &amp; Open Box</span>
                </button>
              </motion.div>
            )}

            {stage === "untying" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 flex flex-col items-center justify-center"
              >
                <div className="relative w-48 h-48 rounded-full bg-rose-500/20 border-2 border-rose-300/40 flex items-center justify-center animate-pulse">
                  <motion.div
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    <Sparkles size={54} className="text-amber-400" />
                  </motion.div>
                </div>
                <p className="text-sm font-display font-bold text-rose-200">
                  Untying handcrafted ribbon &amp; lifting box lid...
                </p>
              </motion.div>
            )}

            {stage === "unboxed" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="space-y-5 w-full flex flex-col items-center"
              >
                {/* Unboxed Keepsake Showcase */}
                <div className="relative w-64 rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/25 shadow-2xl space-y-3">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-rose-50 border border-white/30 shadow-inner">
                    <img
                      src={assetUrl(productImage)}
                      alt={productName}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider bg-burgundy-900/90 text-white px-2 py-0.5 rounded-md shadow-xs">
                      100% Handcrafted
                    </span>
                  </div>

                  <div className="text-left space-y-1">
                    <h4 className="font-display font-bold text-sm text-white line-clamp-1">
                      {productName}
                    </h4>
                    <p className="text-[11px] text-rose-200">
                      Hand-finished in crystal acrylic with double-faced satin knot.
                    </p>
                  </div>

                  {/* Greeting Card Preview */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-rose-50 to-blush-50 border border-rose-200 text-left text-xs text-burgundy-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[10px] text-ribbon-600 uppercase tracking-wider">
                      <Heart size={12} className="fill-ribbon-500 text-ribbon-500" />
                      <span>Complimentary Greeting Card</span>
                    </div>
                    <p className="italic text-[11px] text-espresso-700">
                      &quot;{customNote || "A memory frozen in time, handcrafted with love and wrapped with our signature ribbon."}&quot;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReset}
                    className="py-2 px-4 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-rose-200 flex items-center gap-1.5 transition"
                  >
                    <RotateCcw size={13} />
                    <span>Tie Ribbon Again</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="btn-primary py-2 px-5 text-xs font-bold uppercase tracking-wider"
                  >
                    <span>Close Preview</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
