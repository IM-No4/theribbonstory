/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Modern Crisp Base Palette (Clean Luxury Gifting Style like IGP.com)
        cream: {
          50: "#FFFFFF",
          100: "#F8FAFC",
          200: "#F1F5F9",
          300: "#E2E8F0",
          400: "#CBD5E1",
        },
        blush: {
          50: "#FFF5F6",
          100: "#FFE4E6",
          200: "#FECDD3",
          300: "#FDA4AF",
          400: "#FB7185",
          500: "#F43F5E",
        },
        peach: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
        },
        lavender: {
          50: "#FAF5FF",
          100: "#F3E8FF",
          200: "#E9D5FF",
          300: "#D8B4FE",
        },
        ribbon: {
          50: "#FFF1F2",
          100: "#FFE4E6",
          200: "#FECDD3",
          300: "#FDA4AF",
          400: "#FB7185",
          500: "#E11D48", // Vibrant Rose Red
          600: "#BE123C",
          700: "#9F1239",
          800: "#881337",
          900: "#6B0D2B",
          950: "#4C051E",
        },
        burgundy: {
          50: "#FFF1F2",
          500: "#E11D48",
          600: "#BE123C",
          700: "#9F1239",
          800: "#881337",
          900: "#1E293B", // Crisp Deep Slate for text/headings
          950: "#0F172A",
        },
        coral: {
          400: "#FB7185",
          500: "#F43F5E",
          600: "#E11D48",
        },
        espresso: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#94A3B8",
          400: "#64748B",
          500: "#475569",
          600: "#334155",
          700: "#1E293B",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "'Cormorant Garamond'", "serif"],
        body: ["'Jost'", "'Plus Jakarta Sans'", "sans-serif"],
        script: ["'Sacramento'", "'Alex Brush'", "cursive"],
      },
      boxShadow: {
        soft: "0 10px 25px -5px rgba(225, 29, 72, 0.08), 0 8px 10px -6px rgba(225, 29, 72, 0.04)",
        card: "0 2px 12px 0 rgba(15, 23, 42, 0.05)",
        hover: "0 16px 32px -8px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(225, 29, 72, 0.12)",
        glow: "0 0 25px rgba(225, 29, 72, 0.25)",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(180deg, #FFF1F2 0%, #FFFFFF 100%)",
        "ribbon-gradient": "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)",
        "rose-gold": "linear-gradient(135deg, #FDA4AF 0%, #FB7185 100%)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-subtle": "pulseSubtle 3s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
