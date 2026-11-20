/**
 * Seasonal hero presets. Choosing one in the admin fills the text fields;
 * the storefront uses `accent` to tint the hero for that theme.
 */
export const HERO_PRESETS = {
  custom: {
    label: "Custom",
    emoji: "✨",
    accent: { highlight: "text-ribbon-600", dot: "bg-rose-500", glow: "bg-rose-200/35", banner: "bg-stone-900 text-white" },
  },
  christmas: {
    label: "Christmas",
    effect: "snow",
    emoji: "🎄",
    accent: { highlight: "text-red-600", dot: "bg-emerald-600", glow: "bg-red-200/40", banner: "bg-red-700 text-white" },
    text: {
      badge: "Christmas is coming",
      headline: "Gifts they'll",
      highlight: "unwrap with a smile.",
      subtext: "Cute 3D-printed collectibles, desk buddies and fridge magnets, perfect for stockings, secret Santa and everyone on your list.",
      overlayText: "Little gifts, big Christmas joy.",
      ctaText: "Shop Christmas Gifts",
      ctaLink: "/shop",
      bannerText: "🎄 Christmas gifting is here, order early for delivery before the 25th!",
    },
  },
  newyear: {
    label: "New Year",
    effect: "sparkles",
    emoji: "🎆",
    accent: { highlight: "text-violet-600", dot: "bg-violet-500", glow: "bg-violet-200/40", banner: "bg-violet-700 text-white" },
    text: {
      badge: "New Year, new little things",
      headline: "Start the year with",
      highlight: "something cute.",
      subtext: "Fresh desk buddies and collectibles to brighten your space and your gifting in the new year.",
      overlayText: "Cheers to a year of small joys.",
      ctaText: "Shop New Arrivals",
      ctaLink: "/shop",
      bannerText: "🎆 Happy New Year! Discover this season's favourites.",
    },
  },
  diwali: {
    label: "Diwali",
    effect: "sparkles",
    emoji: "🪔",
    accent: { highlight: "text-amber-600", dot: "bg-amber-500", glow: "bg-amber-200/45", banner: "bg-amber-600 text-white" },
    text: {
      badge: "Festival of lights",
      headline: "Light up their",
      highlight: "Diwali.",
      subtext: "Thoughtful 3D-printed gifts and collectibles to share the joy of the festive season.",
      overlayText: "Gifts that glow with love.",
      ctaText: "Shop Festive Gifts",
      ctaLink: "/shop",
      bannerText: "🪔 Happy Diwali! Festive gifting, handcrafted in India.",
    },
  },
  valentine: {
    label: "Valentine's",
    effect: "hearts",
    emoji: "💖",
    accent: { highlight: "text-rose-600", dot: "bg-rose-500", glow: "bg-rose-300/40", banner: "bg-rose-600 text-white" },
    text: {
      badge: "For the one you love",
      headline: "Little things for",
      highlight: "big love.",
      subtext: "Cute couple collectibles and sweet little gifts to say what words can't.",
      overlayText: "Say it with something small and sweet.",
      ctaText: "Shop Gifts for Couples",
      ctaLink: "/shop",
      bannerText: "💖 Valentine's gifting is here, order early!",
    },
  },
};
