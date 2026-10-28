import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, X, Sparkles, Truck, Gift, Palette, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Cute 3D Keepsake Studio Bot / Mascot Face
function CuteMascot({ size = 36, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Cute Rounded Ears */}
      <circle cx="12" cy="13" r="5.5" fill="#FDA4AF" />
      <circle cx="12" cy="13" r="3.2" fill="#E11D48" />
      <circle cx="36" cy="13" r="5.5" fill="#FDA4AF" />
      <circle cx="36" cy="13" r="3.2" fill="#E11D48" />

      {/* Little Antenna with Glowing Gem */}
      <path
        d="M24 11V4.5"
        stroke="#E11D48"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="24" cy="4" r="3" fill="#F43F5E" />
      <circle cx="23" cy="3" r="1" fill="#FFFFFF" />

      {/* Main 3D Head Shape */}
      <rect
        x="6"
        y="10"
        width="36"
        height="30"
        rx="15"
        fill="#FFFFFF"
        stroke="#F43F5E"
        strokeWidth="2.5"
      />

      {/* Soft Visor / Face Area */}
      <rect
        x="9.5"
        y="13.5"
        width="29"
        height="23"
        rx="11.5"
        fill="#FFF5F6"
      />

      {/* Rosy Kawaii Cheeks */}
      <ellipse cx="14" cy="27" rx="3.5" ry="2" fill="#FDA4AF" opacity="0.9" />
      <ellipse cx="34" cy="27" rx="3.5" ry="2" fill="#FDA4AF" opacity="0.9" />

      {/* Sparkly Kawaii Eyes */}
      <circle cx="18" cy="22" r="3.2" fill="#1E293B" />
      <circle cx="16.8" cy="20.8" r="1.2" fill="#FFFFFF" />
      <circle cx="19" cy="23.2" r="0.6" fill="#FFFFFF" />

      <circle cx="30" cy="22" r="3.2" fill="#1E293B" />
      <circle cx="28.8" cy="20.8" r="1.2" fill="#FFFFFF" />
      <circle cx="31" cy="23.2" r="0.6" fill="#FFFFFF" />

      {/* Sweet Friendly Smile */}
      <path
        d="M21 26.5C21.8 28.5 26.2 28.5 27 26.5"
        stroke="#1E293B"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Signature Studio Ribbon Bow on Chin */}
      <path
        d="M20 40L24 37.5L28 40L26 36.5L28 34L24 35.5L20 34L22 36.5Z"
        fill="#E11D48"
      />
      <circle cx="24" cy="36.5" r="1.5" fill="#FDA4AF" />
    </svg>
  );
}

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
    const phone = "917905275048";
    const text = encodeURIComponent(
      customMessage || "Hi The Ribbon Story team! I have a question about customizing a gift/keepsake."
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
      {/* Cute Mascot Concierge Help Button & Quick Action Drawer */}
      <div className="pointer-events-auto relative">
        <AnimatePresence>
          {showChatPopup && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute bottom-16 right-0 w-80 bg-white rounded-3xl shadow-2xl p-5 border border-rose-100 text-left space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                    <CuteMascot size={28} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-900 block leading-tight">
                      Ribbon Bot &amp; Concierge
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Studio online now
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowChatPopup(false)}
                  className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition"
                  aria-label="Close assistant"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                Hi! Need help turning a memory into a 3D keepsake, tracking an order, or finding a gift?
              </p>

              {/* Quick Action Buttons */}
              <div className="space-y-1.5">
                <Link
                  to="/track-order"
                  onClick={() => setShowChatPopup(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 hover:bg-rose-50 border border-stone-200/80 text-xs font-semibold text-stone-800 hover:text-rose-700 transition group"
                >
                  <Truck size={14} className="text-rose-500 group-hover:translate-x-0.5 transition" />
                  <span>Track Live Delivery Status</span>
                </Link>

                <Link
                  to="/personalized"
                  onClick={() => setShowChatPopup(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 hover:bg-rose-50 border border-stone-200/80 text-xs font-semibold text-stone-800 hover:text-rose-700 transition group"
                >
                  <Palette size={14} className="text-rose-500 group-hover:scale-110 transition" />
                  <span>Photo to 3D Figurine Customizer</span>
                </Link>

                <Link
                  to="/faqs"
                  onClick={() => setShowChatPopup(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 hover:bg-rose-50 border border-stone-200/80 text-xs font-semibold text-stone-800 hover:text-rose-700 transition group"
                >
                  <Sparkles size={14} className="text-rose-500 group-hover:scale-110 transition" />
                  <span>FAQs &amp; Keepsake Care Guide</span>
                </Link>
              </div>

              {/* Direct WhatsApp CTA */}
              <button
                onClick={() => openWhatsApp("Hi The Ribbon Story! I would like some assistance with a keepsake.")}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <MessageCircle size={15} />
                <span>Chat with Artist on WhatsApp</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cute Mascot Floating Trigger Button */}
        <button
          onClick={() => setShowChatPopup(!showChatPopup)}
          aria-label="Studio Assistant & WhatsApp Support"
          className="relative h-14 w-14 rounded-full bg-gradient-to-br from-white via-rose-50 to-pink-100 border-2 border-rose-300 text-rose-700 flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-108 active:scale-95 transition-all duration-300 group cursor-pointer"
          title="Ribbon Bot — Studio Assistant"
        >
          <CuteMascot size={36} className="group-hover:scale-110 transition-transform duration-300" />
          {/* Online Pulse Dot */}
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </span>
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
            className="pointer-events-auto h-10 w-10 rounded-full bg-white/95 hover:bg-white text-stone-700 border border-stone-200 flex items-center justify-center shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            title="Scroll to Top"
          >
            <ArrowUp size={16} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
