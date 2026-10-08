import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const MENU_CATEGORIES = [
  {
    id: "3d-keepsakes",
    title: "3D Keepsakes",
    badge: "Hot",
    badgeColor: "bg-rose-500",
    to: "/3d-keepsakes",
    columns: [
      {
        title: "3D Miniatures & Sculptures",
        links: [
          { label: "3D Couple Figurine", to: "/product/3d-couple-magnet" },
          { label: "3D Pet Miniature (Dog & Cat)", to: "/product/3d-pet-magnet" },
          { label: "Family Keepsake Sculpture", to: "/product/custom-3d-family-magnet" },
          { label: "Baby Hand & Foot Castings", to: "/product/3d-baby-hand-foot-cast-keepsake" },
        ],
      },
      {
        title: "Display & Base Options",
        links: [
          { label: "Handcrafted Mahogany Base", to: "/3d-keepsakes" },
          { label: "Polished Marble Plinth", to: "/3d-keepsakes" },
          { label: "Strong Magnet Backing", to: "/3d-keepsakes" },
          { label: "Illuminated Shadow Box Frame", to: "/3d-keepsakes" },
        ],
      },
      {
        title: "Occasions",
        links: [
          { label: "1st Anniversary Keepsake", to: "/shop?occasion=anniversary" },
          { label: "Pet Memorial & Remembrance", to: "/3d-keepsakes" },
          { label: "Wedding & Engagement Gift", to: "/shop?occasion=wedding" },
          { label: "Baby Welcome & Milestones", to: "/3d-keepsakes" },
        ],
      },
    ],
    promo: {
      tag: "100% Handcrafted",
      title: "Custom 3D Figurines",
      subtitle: "Handcrafted miniature sculpts from your favorite photos",
      img: "/src/assets/images/3d-couple-keepsake.jpeg",
      cta: "Explore 3D Gifts",
      to: "/3d-keepsakes",
    },
  },
  {
    id: "photo-magnets",
    title: "Photo Magnets",
    badge: "Trending",
    badgeColor: "bg-amber-500",
    to: "/shop?category=photo-magnets",
    columns: [
      {
        title: "Acrylic & Crystal Styles",
        links: [
          { label: "Crystal Acrylic Photo Magnet", to: "/product/personalized-photo-magnet" },
          { label: "Heart & Arch Cut Acrylics", to: "/shop?category=photo-magnets" },
          { label: "Custom Name & Date Plaques", to: "/product/custom-name-date-magnet" },
          { label: "Collage Story Magnets", to: "/shop?category=photo-magnets" },
        ],
      },
      {
        title: "Value Bundles",
        links: [
          { label: "Pack of 4 Memory Magnets", to: "/shop?category=photo-magnets" },
          { label: "Pack of 8 Fridge Gallery Wall", to: "/shop?category=photo-magnets" },
          { label: "Deluxe Keepsake Gift Set", to: "/shop" },
        ],
      },
      {
        title: "Top Themes",
        links: [
          { label: "Vacation & Travel Souvenirs", to: "/product/travel-memory-magnet" },
          { label: "Anniversary & Couple Memories", to: "/shop?occasion=anniversary" },
          { label: "Best Friends Friendship Snaps", to: "/shop" },
        ],
      },
    ],
    promo: {
      tag: "Best Seller",
      title: "Crystal Acrylic Magnets",
      subtitle: "Vibrant, high-gloss scratch-proof memory keepsakes",
      img: "/src/assets/images/photo-magnet.jpeg",
      cta: "Shop Magnets",
      to: "/shop?category=photo-magnets",
    },
  },
  {
    id: "polaroid-magnets",
    title: "Polaroid Art",
    badge: "New",
    badgeColor: "bg-indigo-500",
    to: "/shop?category=polaroid-magnets",
    columns: [
      {
        title: "Retro Polaroid Styles",
        links: [
          { label: "Classic Polaroid Memory Magnets", to: "/product/polaroid-memory-magnet" },
          { label: "Custom Handwritten Caption Prints", to: "/product/polaroid-memory-magnet" },
          { label: "Mini Polaroid Keychains", to: "/product/personalized-keepsake-keychain" },
        ],
      },
      {
        title: "Memory Sets",
        links: [
          { label: "Set of 4 Polaroid Pack", to: "/shop?category=polaroid-magnets" },
          { label: "Set of 9 Milestone Story Wall", to: "/shop?category=polaroid-magnets" },
          { label: "Romantic Storyline Box", to: "/shop" },
        ],
      },
      {
        title: "Occasions",
        links: [
          { label: "Birthday Memories", to: "/shop?occasion=birthday" },
          { label: "Roadtrip & Holiday Captures", to: "/shop" },
          { label: "Graduation & Milestones", to: "/shop" },
        ],
      },
    ],
    promo: {
      tag: "Vintage Charm",
      title: "Retro Polaroid Sets",
      subtitle: "Capture real nostalgia with custom caption magnets",
      img: "/src/assets/images/polaroid-art.jpeg",
      cta: "Create Polaroid Set",
      to: "/shop?category=polaroid-magnets",
    },
  },
  {
    id: "build-a-box",
    title: "🎁 Build A Hamper",
    badge: "Custom",
    badgeColor: "bg-emerald-600",
    to: "/build-a-box",
    columns: [
      {
        title: "Interactive Hamper Studio",
        links: [
          { label: "Step 1: Choose Luxury Gift Box", to: "/build-a-box" },
          { label: "Step 2: Add Custom 3D Keepsake", to: "/build-a-box" },
          { label: "Step 3: Add Chocolates & Lights", to: "/build-a-box" },
          { label: "Step 4: Free Handwritten Card", to: "/build-a-box" },
        ],
      },
      {
        title: "Signature Hampers",
        links: [
          { label: "Cosy Evenings Gift Hamper", to: "/product/cosy-evenings-gift-hamper" },
          { label: "Celebration Sweets & Keepsake Box", to: "/product/celebration-sweets-keepsake-box" },
          { label: "Romantic Ribbon Hamper", to: "/shop?occasion=anniversary" },
        ],
      },
      {
        title: "Unboxing Experience",
        links: [
          { label: "Signature Crimson Ribbon Bow", to: "/build-a-box" },
          { label: "Warm Fairy Light Illumination", to: "/build-a-box" },
          { label: "Artisan Belgian Truffles", to: "/build-a-box" },
        ],
      },
    ],
    promo: {
      tag: "100% Bespoke",
      title: "Luxury Hamper Studio",
      subtitle: "Hand-tie your custom gifts in an artisanal satin ribbon box",
      img: "/src/assets/images/luxury-ribbon-hamper.jpeg",
      cta: "Start Building",
      to: "/build-a-box",
    },
  },
  {
    id: "birthday",
    title: "Birthday",
    badge: "Popular",
    badgeColor: "bg-rose-500",
    to: "/shop?occasion=birthday",
    columns: [
      {
        title: "By Recipient",
        links: [
          { label: "Birthday Gifts for Her", to: "/shop?occasion=birthday&tag=for-her" },
          { label: "Birthday Gifts for Him", to: "/shop?occasion=birthday&tag=for-him" },
          { label: "Birthday Gifts for Best Friend", to: "/shop?occasion=birthday&tag=for-friend" },
          { label: "Birthday Gifts for Kids", to: "/shop?occasion=birthday&tag=for-kids" },
        ],
      },
      {
        title: "Top Birthday Keepsakes",
        links: [
          { label: "3D Birthday Figurine", to: "/3d-keepsakes" },
          { label: "Birthday Photo Magnets", to: "/shop?category=photo-magnets" },
          { label: "Personalized Keepsake Keychain", to: "/product/personalized-keepsake-keychain" },
        ],
      },
      {
        title: "By Budget",
        links: [
          { label: "Gifts Under ₹499", to: "/shop?maxPrice=499" },
          { label: "Gifts Under ₹999", to: "/shop?maxPrice=999" },
          { label: "Luxury Keepsakes (₹1499+)", to: "/shop?minPrice=1499" },
        ],
      },
    ],
    promo: {
      tag: "Birthday Special",
      title: "Make Birthdays Unforgettable",
      subtitle: "Turn childhood and bestie photos into lasting keepsakes",
      img: "/src/assets/images/3d-dog-keepsake.jpeg",
      cta: "Explore Birthday Gifts",
      to: "/shop?occasion=birthday",
    },
  },
  {
    id: "anniversary",
    title: "Anniversary",
    to: "/shop?occasion=anniversary",
    columns: [
      {
        title: "Romantic Keepsakes",
        links: [
          { label: "3D Couple Miniature Sculpt", to: "/product/3d-couple-magnet" },
          { label: "Anniversary Photo Magnet Set", to: "/shop?occasion=anniversary" },
          { label: "Custom Name & Date Plaque", to: "/product/custom-name-date-magnet" },
        ],
      },
      {
        title: "Milestone Years",
        links: [
          { label: "1st Anniversary Gifts", to: "/shop?occasion=anniversary" },
          { label: "5th Wooden Plaque Keepsakes", to: "/shop?occasion=anniversary" },
          { label: "10th & 25th Silver Jubilee Gifts", to: "/shop?occasion=anniversary" },
        ],
      },
      {
        title: "Combos & Hampers",
        links: [
          { label: "Couple Figurine + Truffles Hamper", to: "/build-a-box" },
          { label: "Our Story Polaroid Box", to: "/shop?category=polaroid-magnets" },
        ],
      },
    ],
    promo: {
      tag: "Couples Choice",
      title: "3D Couple Keepsake",
      subtitle: "Celebrate your love story with a hand-painted couple sculpt",
      img: "/src/assets/images/3d-couple-keepsake.jpeg",
      cta: "Create Couple Keepsake",
      to: "/product/3d-couple-magnet",
    },
  },
  {
    id: "recipients",
    title: "Gifts By Relation",
    to: "/shop",
    columns: [
      {
        title: "For Loved Ones",
        links: [
          { label: "Gifts for Her / Wife / Girlfriend", to: "/shop?tag=for-her" },
          { label: "Gifts for Him / Husband / Boyfriend", to: "/shop?tag=for-him" },
          { label: "Gifts for Parents / Mom & Dad", to: "/shop?tag=for-parents" },
          { label: "Gifts for Best Friends", to: "/shop?tag=for-friend" },
        ],
      },
      {
        title: "Family & Pets",
        links: [
          { label: "Family Silhouette 3D Sculpt", to: "/product/custom-3d-family-magnet" },
          { label: "3D Pet Miniature Keepsake", to: "/product/3d-pet-magnet" },
          { label: "Baby Hand & Foot Castings", to: "/product/3d-baby-hand-foot-cast-keepsake" },
        ],
      },
      {
        title: "Special Occasions",
        links: [
          { label: "Long Distance Couples", to: "/shop?occasion=couples" },
          { label: "Housewarming & New Home", to: "/shop" },
          { label: "Corporate Gifting", to: "/contact" },
        ],
      },
    ],
    promo: {
      tag: "Family Memories",
      title: "Family 3D Keepsake",
      subtitle: "Immortalize the bond of your family in realistic 3D",
      img: "/src/assets/images/3d-family-keepsake.jpeg",
      cta: "View Family Keepsakes",
      to: "/product/custom-3d-family-magnet",
    },
  },
  {
    id: "express",
    title: "⚡ Same Day",
    badge: "Express",
    badgeColor: "bg-emerald-600",
    to: "/shop?tag=express",
    columns: [
      {
        title: "Fast-Track Keepsakes",
        links: [
          { label: "Same-Day Dispatch Photo Magnets", to: "/shop?category=photo-magnets" },
          { label: "Express Polaroid Sets", to: "/shop?category=polaroid-magnets" },
          { label: "Ready-to-Ship Gift Hampers", to: "/shop" },
        ],
      },
      {
        title: "Top Metro Cities",
        links: [
          { label: "Bengaluru (Same Day)", to: "/shop?tag=express" },
          { label: "Mumbai & Pune (Next Day)", to: "/shop?tag=express" },
          { label: "Delhi NCR (Next Day)", to: "/shop?tag=express" },
          { label: "Hyderabad & Chennai (24-48h)", to: "/shop?tag=express" },
        ],
      },
      {
        title: "Assurance",
        links: [
          { label: "Pincode Delivery Check", to: "/track-order" },
          { label: "Live Courier Tracking", to: "/track-order" },
        ],
      },
    ],
    promo: {
      tag: "Speedy Delivery",
      title: "Last Minute Gifting?",
      subtitle: "Lightning-fast handcrafted gifts dispatched within hours",
      img: "/src/assets/images/same-day-delivery.jpeg",
      cta: "Explore Express Gifts",
      to: "/shop?tag=express",
    },
  },
];

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
