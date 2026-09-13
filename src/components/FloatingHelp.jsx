import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, ArrowUp, X, Sparkles, Truck, Gift, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingHelp() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showChatPopup, setShowChatPopup] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", checkScroll);
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openWhatsApp = (customMessage) => {
    const phone = "919876543210";
    const text = encodeURIComponent(
      customMessage || "Hi The Ribbon Story team! I have a question about customizing a gift/keepsake."
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      {/* WhatsApp Concierge Help Button & Quick Action Drawer */}
      <div className="pointer-events-auto relative">
        <AnimatePresence>
          {showChatPopup && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute bottom-16 right-0 w-80 bg-white rounded-3xl shadow-2xl p-5 border border-blush-200 text-left space-y-4"
            >
              <div className="flex items-center justify-between border-b border-blush-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-rose-50 flex items-center justify-center text-ribbon-500">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-burgundy-900 block leading-none">
                      Keepsake Concierge
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Artists online now
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowChatPopup(false)}
                  className="text-espresso-400 hover:text-espresso-600 p-1 rounded-full hover:bg-slate-100 transition"
                >
                  <X size={15} />
                </button>
              </div>

              <p className="text-xs text-espresso-500 leading-relaxed">
                Need help turning a memory into a keepsake or creating a personalized hamper?
              </p>

              {/* Quick Action Buttons */}
              <div className="space-y-1.5">
                <Link
                  to="/track-order"
                  onClick={() => setShowChatPopup(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-cream-50 hover:bg-blush-50 border border-blush-200 text-xs font-semibold text-burgundy-900 transition group"
                >
                  <Truck size={14} className="text-ribbon-500 group-hover:translate-x-0.5 transition" />
                  <span>Track Live Delivery Status</span>
                </Link>

                <Link
                  to="/build-a-box"
                  onClick={() => setShowChatPopup(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-cream-50 hover:bg-blush-50 border border-blush-200 text-xs font-semibold text-burgundy-900 transition group"
                >
                  <Gift size={14} className="text-ribbon-500 group-hover:scale-110 transition" />
                  <span>Build A Custom Gift Hamper</span>
                </Link>

                <Link
                  to="/personalized"
                  onClick={() => setShowChatPopup(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-cream-50 hover:bg-blush-50 border border-blush-200 text-xs font-semibold text-burgundy-900 transition group"
                >
                  <Palette size={14} className="text-ribbon-500 group-hover:scale-110 transition" />
                  <span>Photo Customizer &amp; Studio</span>
                </Link>
              </div>

              {/* Direct WhatsApp CTA */}
              <button
                onClick={() => openWhatsApp("Hi The Ribbon Story! I would like some expert guidance on choosing a personalized gift.")}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <MessageCircle size={15} />
                <span>Chat with Artist on WhatsApp</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowChatPopup(!showChatPopup)}
          aria-label="Concierge & WhatsApp Support"
          className="h-13 w-13 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          title="Keepsake Concierge & WhatsApp"
        >
          <MessageCircle size={26} />
        </button>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="pointer-events-auto h-10 w-10 rounded-full bg-white/90 hover:bg-white text-burgundy-900 border border-blush-300 flex items-center justify-center shadow-card hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200"
            title="Scroll to Top"
          >
            <ArrowUp size={16} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
