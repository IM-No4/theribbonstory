import { motion } from "framer-motion";

export default function AuthShowcase() {
  return (
    <div className="relative w-full h-full max-h-screen flex items-center justify-center p-6 lg:p-12 overflow-hidden select-none bg-white">
      {/* --- Floating Abstract Geometric Shapes in Brand Rose/Coral/Gold Tones --- */}

      {/* Top Left Soft Rose Blurred Sphere */}
      <motion.div
        animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-10 -left-12 w-64 h-64 rounded-full bg-gradient-to-br from-rose-200/60 via-amber-100/50 to-pink-100/40 blur-2xl pointer-events-none"
      />

      {/* Top Right Big Coral Semicircle flush with top edge */}
      <motion.div
        animate={{ rotate: [0, 4, 0], y: [0, -6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-10 right-16 w-56 h-28 rounded-b-full bg-gradient-to-r from-[#FF9A8B] to-[#E11D48] opacity-85"
      />

      {/* Top Far-Right Rose-Crimson Shape flush with right edge */}
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-bl from-rose-300 to-rose-400 opacity-75"
      />

      {/* Upper-Left Warm Peach/Gold Disc */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-16 left-8 w-44 h-44 rounded-full bg-gradient-to-tr from-[#FDA4AF] via-[#FDE047] to-[#FCA5A5] opacity-65"
      />

      {/* Dot Grid Pattern on the Right */}
      <div className="absolute top-36 right-12 grid grid-cols-6 gap-2.5 opacity-30 pointer-events-none">
        {[...Array(24)].map((_, i) => (
          <span key={i} className="w-1 h-1 rounded-full bg-slate-400" />
        ))}
      </div>

      {/* Bottom Left Glowing Soft Red-Pink Blur Blob */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], x: [0, 8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 -left-10 w-56 h-56 rounded-full bg-gradient-to-tr from-[#E11D48]/35 via-[#FB7185]/30 to-amber-100/40 blur-xl pointer-events-none"
      />

      {/* Bottom Center Red-Coral Rounded Shield Shape */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/4 w-24 h-36 rounded-3xl bg-gradient-to-b from-[#E11D48] to-[#BE123C] shadow-lg opacity-90"
      />

      {/* Bottom Warm Coral Semicircle flush with bottom edge */}
      <motion.div
        animate={{ rotate: [0, 6, 0], y: [0, 4, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-6 left-1/2 w-40 h-20 rounded-t-full bg-gradient-to-r from-[#FDA4AF] to-[#FB7185] opacity-90"
      />

      {/* Bottom Right Floating Rounded Rose-Gold Pebble */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-14 right-10 w-28 h-24 rounded-[2rem] bg-gradient-to-tr from-[#FECDD3] to-[#FDE047] shadow-md opacity-90"
      />

      {/* Small Coral Semicircle near Text */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-20 w-12 h-6 rounded-b-full bg-gradient-to-r from-[#FF9A8B] to-[#E11D48] opacity-80"
      />

      {/* --- Central Main Typography --- */}
      <div className="relative z-10 max-w-lg text-center px-4">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-[46px] font-bold text-slate-900 leading-[1.2] tracking-tight font-body"
        >
          Changing the way <br />
          <span className="text-slate-900">the world gifts</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-3 text-xs sm:text-sm text-slate-400 font-medium tracking-wide"
        >
          Every Gift Tells a Story • Bespoke Luxury Hampers & Keepsakes
        </motion.p>
      </div>
    </div>
  );
}
