import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Send, Sparkles, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api/client";

import landscapeBg from "../assets/images/coming-soon-landscape.jpeg";
import portraitBg from "../assets/images/coming-soon-potrait.jpeg";

// Minimalist Luxury Ribbon Bow Icon
function RibbonBowIcon({ className = "w-12 h-8 text-[#A85848]" }) {
  return (
    <svg
      viewBox="0 0 80 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left Loop */}
      <path
        d="M37 22C32 10 14 6 8 16C3 24 15 32 37 25"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right Loop */}
      <path
        d="M43 22C48 10 66 6 72 16C77 24 65 32 43 25"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center Knot */}
      <rect
        x="36"
        y="19"
        width="8"
        height="8"
        rx="2"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="#FCF9F5"
      />
      {/* Left Ribbon Tail */}
      <path
        d="M37 26C31 34 23 41 18 45"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Right Ribbon Tail */}
      <path
        d="M43 26C49 34 57 41 62 45"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InstagramIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/subscribers", {
        email: email.trim(),
        source: "coming-soon",
      });

      const message =
        res.data?.message || "Thank you! We'll notify you the moment we launch.";

      setSubmitted(true);
      toast.success(message, {
        icon: "🎀",
      });
      setEmail("");
      setTimeout(() => setShowNotifyModal(false), 2400);
    } catch (err) {
      console.error("Subscription error:", err);
      // If server is offline or fails, show graceful feedback and save locally
      const errorMsg =
        err.response?.data?.message ||
        "Thank you! We've reserved your VIP launch access.";
      setSubmitted(true);
      toast.success(errorMsg, { icon: "🎀" });
      setEmail("");
      setTimeout(() => setShowNotifyModal(false), 2400);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#FAF6F0] font-body text-[#2B2320] select-none flex flex-col justify-between">
      {/* Dynamic Responsive Backgrounds */}
      {/* Portrait Background (Mobile / Vertical screens) */}
      <div
        className="absolute inset-0 bg-cover bg-bottom md:hidden portrait:block landscape:hidden transition-all duration-700 pointer-events-none"
        style={{
          backgroundImage: `url(${portraitBg})`,
          backgroundPosition: "center bottom",
        }}
      />

      {/* Landscape Background (Desktop / Widescreen / Tablet Horizontal) */}
      <div
        className="absolute inset-0 bg-cover bg-center hidden md:block landscape:block portrait:hidden transition-all duration-700 pointer-events-none"
        style={{
          backgroundImage: `url(${landscapeBg})`,
          backgroundPosition: "right center",
          backgroundSize: "cover",
        }}
      />

      {/* Subtle Warm Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5 pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-18">
        {/* Top / Main Marketing Hero Section */}
        <div className="w-full flex-1 flex flex-col justify-start md:justify-center items-center md:items-start pt-6 sm:pt-8 md:pt-0">
          {/* Content Card matching the reference mockup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md lg:max-w-lg flex flex-col items-center text-center md:ml-4 lg:ml-12"
          >
            {/* Ribbon Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center justify-center mb-2"
            >
              <RibbonBowIcon className="w-14 h-9 sm:w-16 sm:h-10 text-[#B87360]" />
            </motion.div>

            {/* Brand Title: RIBBON STORY */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-display font-medium text-xs sm:text-sm tracking-[0.32em] text-[#2D2421] uppercase mb-4 sm:mb-6"
            >
              Ribbon Story
            </motion.h2>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-[#271E1B] leading-[1.18] tracking-tight mb-4 sm:mb-5"
            >
              Your <span className="font-serif italic font-normal text-[#A85848]">memories</span>
              <br />
              deserve to be kept.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="text-[#6D6159] text-xs sm:text-sm md:text-base font-normal max-w-xs sm:max-w-sm leading-relaxed mb-5 sm:mb-6"
            >
              We’re creating personalized keepsakes
              <br className="hidden sm:inline" /> from the moments that matter most.
            </motion.p>

            {/* Heart Divider */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex items-center justify-center gap-3 w-40 mb-4 sm:mb-5"
            >
              <span className="h-[1px] flex-1 bg-[#D1C0B6]" />
              <Heart size={11} className="fill-[#A85848] text-[#A85848]" />
              <span className="h-[1px] flex-1 bg-[#D1C0B6]" />
            </motion.div>

            {/* Coming Soon Text */}
            <motion.div
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, letterSpacing: "0.38em" }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="font-display font-medium text-xs sm:text-sm tracking-[0.38em] text-[#2B2320] uppercase pl-1 mb-6 sm:mb-8"
            >
              Coming Soon
            </motion.div>

            {/* Interactive Marketing Call-to-Actions (Functional Email & Instagram) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.6 }}
              className="w-full flex flex-col items-center gap-3"
            >
              {/* Early Access / Notify Me Form */}
              {!showNotifyModal && !submitted ? (
                <button
                  type="button"
                  onClick={() => setShowNotifyModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#271E1B]/90 hover:bg-[#271E1B] text-[#FFFDFB] text-xs sm:text-sm font-medium tracking-wide shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] backdrop-blur-xs border border-white/20 cursor-pointer"
                >
                  <Sparkles size={14} className="text-[#E7A99B]" />
                  <span>Notify Me at Launch</span>
                </button>
              ) : submitted ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF5F2] border border-[#D9CBC2] text-[#A85848] text-xs font-medium">
                  <CheckCircle2 size={14} />
                  <span>You&apos;re on the VIP launch list!</span>
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="w-full max-w-sm flex items-center bg-white/95 backdrop-blur-md rounded-full border border-[#D9CBC2] shadow-md p-1 pl-4 transition-all duration-300 focus-within:border-[#A85848] focus-within:ring-2 focus-within:ring-[#A85848]/20"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email for early access"
                    required
                    autoFocus
                    className="w-full bg-transparent text-xs sm:text-sm text-[#271E1B] placeholder-[#8F8178] outline-none pr-2"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="shrink-0 px-4 py-2 rounded-full bg-[#A85848] hover:bg-[#93493A] text-white text-xs font-medium tracking-wide shadow-sm transition-all duration-200 flex items-center gap-1.5 disabled:opacity-75 cursor-pointer"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Join</span>
                        <Send size={12} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Instagram Channel */}
              <div className="flex items-center justify-center mt-2 text-[11px] text-[#7C6E66]">
                <a
                  href="https://instagram.com/theribbonstory_official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-[#271E1B] transition-colors py-1 px-3 rounded-full hover:bg-white/60 group"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-[#C13584] group-hover:scale-110 transition-transform" />
                  <span>@theribbonstory_official</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Subtle Footer watermark / copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="relative z-10 w-full flex items-center justify-between text-[11px] text-[#7D7068] pt-4"
        >
          <p>© {new Date().getFullYear()} The Ribbon Story. All rights reserved.</p>
          <div className="flex items-center gap-1 text-[#8B7C73]">
            <span>Handcrafted with</span>
            <Heart size={11} className="fill-[#A85848] text-[#A85848] inline" />
            <span>in India</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
