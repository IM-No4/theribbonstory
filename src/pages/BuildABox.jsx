import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Gift,
  Heart,
  Upload,
  Check,
  Plus,
  Minus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  Box,
  Layers,
  Palette,
  Camera,
  Type,
  Calendar,
} from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { api, assetUrl } from "../api/client";
import toast from "react-hot-toast";

const formatPrice = (n) => `₹${n.toLocaleString("en-IN")}`;

// Box Styles
const BOX_STYLES = [
  {
    id: "burgundy-velvet",
    name: "Royal Burgundy Velvet Box",
    desc: "Plush matte velvet finish with magnetic lid & gold foil seal",
    price: 299,
    img: "/src/assets/images/gifts-for-her.jpeg",
    color: "from-burgundy-900 to-rose-950",
  },
  {
    id: "classic-ivory",
    name: "Classic Ivory Ribbon Box",
    desc: "Timeless cream luxury textured rigid box with satin ribbon wrap",
    price: 249,
    img: "/src/assets/images/gifts-for-birthday.jpeg",
    color: "from-amber-50 to-cream-100",
  },
  {
    id: "blush-satin",
    name: "Blush Pink Celebration Trunk",
    desc: "Romantic pastel blush box lined with custom shredded paper",
    price: 349,
    img: "/src/assets/images/gifts-for-anniversary.jpeg",
    color: "from-pink-100 to-rose-100",
  },
];

// Ribbon Colors
const RIBBON_COLORS = [
  { name: "Burgundy Velvet", hex: "#7A1C2E" },
  { name: "Champagne Gold", hex: "#D4AF37" },
  { name: "Rose Gold Satin", hex: "#E0A899" },
  { name: "Emerald Forest", hex: "#1B4D3E" },
  { name: "Classic Pearl White", hex: "#FDFBF7" },
];

// Main Keepsake Choices
const KEEPSAKE_CHOICES = [
  {
    id: "photo-magnet",
    name: "Personalized Acrylic Photo Magnet",
    tagline: "Crystal gloss finish with custom date & name",
    price: 349,
    img: "/src/assets/images/photo-magnet.jpeg",
  },
  {
    id: "polaroid-set",
    name: "Polaroid Memory Magnet Set (3 Pcs)",
    tagline: "Vintage white bordered magnetic polaroid trio",
    price: 499,
    img: "/src/assets/images/polaroid-art.jpeg",
  },
  {
    id: "3d-miniature",
    name: "3D Figurine Keepsake Sculpt",
    tagline: "Bespoke miniature sculpt handcrafted from your photo",
    price: 699,
    img: "/src/assets/images/3d-dog-keepsake.jpeg",
  },
];

// Curated Add-on Delights
const CURATED_ADDONS = [
  {
    id: "candle",
    name: "Lavender & Vanilla Soy Candle",
    desc: "Hand-poured 100g aroma candle in golden tin",
    price: 299,
    img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "chocolates",
    name: "Artisanal Belgian Dark Chocolates",
    desc: "Box of 6 handcrafted gourmet chocolate truffles",
    price: 249,
    img: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "fairy-lights",
    name: "Warm Golden Fairy String Lights",
    desc: "Battery-powered ambient wire lights for magical unboxing",
    price: 149,
    img: "https://images.unsplash.com/photo-1514517521153-1be72277b32f?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "dry-fruits",
    name: "Roasted Almonds & Cashews Jar",
    desc: "Slow-roasted salted gourmet dry fruits (150g)",
    price: 279,
    img: "https://images.unsplash.com/photo-1536591375315-1b836890327c?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "mug",
    name: "Handmade Ceramic Gold-Rim Mug",
    desc: "Cosy pastel ceramic mug with gold-painted handle",
    price: 349,
    img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80",
  },
];

// Greeting Cards
const CARD_THEMES = [
  { id: "birthday", label: "Happy Birthday 🎂" },
  { id: "anniversary", label: "Happy Anniversary 💖" },
  { id: "congrats", label: "Big Congratulations 🎉" },
  { id: "love", label: "Just Because / I Love You 🌹" },
  { id: "blank", label: "Blank Luxury Ribbon Note ✨" },
];

export default function BuildABox() {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const fileInputRef = useRef(null);

  // Step Tracker
  const [currentStep, setCurrentStep] = useState(1); // 1: Box, 2: Keepsake, 3: Add-ons, 4: Message

  // Selections
  const [selectedBox, setSelectedBox] = useState(BOX_STYLES[0]);
  const [selectedRibbon, setSelectedRibbon] = useState(RIBBON_COLORS[0]);
  const [selectedKeepsake, setSelectedKeepsake] = useState(KEEPSAKE_CHOICES[0]);
  const [keepsakePhoto, setKeepsakePhoto] = useState("/src/assets/images/photo-magnet.jpeg");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [keepsakeCaption, setKeepsakeCaption] = useState("Forever & Always");
  const [selectedAddons, setSelectedAddons] = useState([CURATED_ADDONS[0], CURATED_ADDONS[1]]);
  const [cardTheme, setCardTheme] = useState(CARD_THEMES[0].label);
  const [cardMessage, setCardMessage] = useState(
    "Wishing you the most magical celebration filled with love, laughter, and joy!"
  );

  // Calculate Total Bundle Price
  const boxPrice = selectedBox.price;
  const keepsakePrice = selectedKeepsake.price;
  const addonsPrice = selectedAddons.reduce((sum, item) => sum + item.price, 0);
  const totalHamperPrice = boxPrice + keepsakePrice + addonsPrice;

  const toggleAddon = (addon) => {
    const exists = selectedAddons.some((a) => a.id === addon.id);
    if (exists) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = () => setKeepsakePhoto(reader.result);
    reader.readAsDataURL(file);

    const form = new FormData();
    form.append("photo", file);

    setUploadingPhoto(true);
    try {
      const { data } = await api.post("/upload", form);
      setKeepsakePhoto(data.url);
      toast.success("Photo uploaded to your hamper!");
    } catch (err) {
      toast.error("Using local preview");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddHamperToCart = () => {
    const addonNames = selectedAddons.map((a) => a.name).join(", ");
    addItem({
      productId: `custom-hamper-${Date.now()}`,
      name: `Custom Ribbon Hamper (${selectedBox.name})`,
      image: selectedBox.img,
      price: totalHamperPrice,
      quantity: 1,
      selectedOptions: [
        { name: "Box Style", value: selectedBox.name, priceDelta: 0 },
        { name: "Ribbon Tie", value: selectedRibbon.name, priceDelta: 0 },
        { name: "Main Keepsake", value: selectedKeepsake.name, priceDelta: 0 },
        { name: "Add-ons", value: addonNames || "None", priceDelta: 0 },
      ],
      customization: {
        photoUrl: keepsakePhoto,
        note: `Card: ${cardTheme} | Message: "${cardMessage}" | Keepsake Caption: "${keepsakeCaption}"`,
      },
    });

    toast.success("Custom Gift Hamper added to your cart!");
    navigate("/cart");
  };

  return (
    <div className="bg-cream-50 min-h-screen py-10 sm:py-16">
      <div className="container-page max-w-6xl">
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <span className="section-eyebrow">Interactive Gifting Studio</span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-burgundy-900">
            Build Your Custom Ribbon Hamper
          </h1>
          <p className="text-sm text-espresso-400 max-w-xl mx-auto">
            Design a bespoke luxury gift box in 4 easy steps. Pick your keepsakes, add gourmet treats, and include a personalized handwritten card.
          </p>
        </div>

        {/* Step Indicator Bar */}
        <div className="flex items-center justify-between max-w-2xl mx-auto mb-10 px-4">
          {[
            { step: 1, label: "Box & Ribbon" },
            { step: 2, label: "Keepsake" },
            { step: 3, label: "Curated Add-ons" },
            { step: 4, label: "Card & Message" },
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition shadow-sm ${
                  currentStep === s.step
                    ? "bg-burgundy-900 text-white scale-110 shadow-rose-200"
                    : currentStep > s.step
                    ? "bg-emerald-600 text-white"
                    : "bg-cream-200 text-espresso-400"
                }`}
              >
                {currentStep > s.step ? <Check size={14} /> : s.step}
              </div>
              <span
                className={`text-[11px] font-semibold transition hidden sm:inline ${
                  currentStep === s.step ? "text-burgundy-900" : "text-espresso-400"
                }`}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>

        {/* Main 2-Column Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Step Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* STEP 1: Box Style & Ribbon */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-blush-200 shadow-xl space-y-6"
              >
                <div>
                  <h3 className="font-display text-xl font-bold text-burgundy-900">
                    Step 1: Choose Gift Box Style & Ribbon
                  </h3>
                  <p className="text-xs text-espresso-400 mt-0.5">
                    Select your rigid keepsake trunk and hand-tied satin ribbon color.
                  </p>
                </div>

                {/* Box Options */}
                <div className="space-y-3">
                  {BOX_STYLES.map((box) => {
                    const isSelected = selectedBox.id === box.id;
                    return (
                      <div
                        key={box.id}
                        onClick={() => setSelectedBox(box)}
                        className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 cursor-pointer transition ${
                          isSelected
                            ? "border-burgundy-900 bg-blush-50/60 shadow-xs"
                            : "border-espresso-100 hover:border-ribbon-300 bg-cream-50/40"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={box.img}
                            alt={box.name}
                            className="w-16 h-16 rounded-xl object-cover border border-blush-200"
                          />
                          <div>
                            <div className="font-bold text-sm text-burgundy-900">{box.name}</div>
                            <div className="text-xs text-espresso-400 mt-0.5 leading-snug">
                              {box.desc}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm text-burgundy-900">{formatPrice(box.price)}</div>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1 inline-block">
                              Selected
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Ribbon Selector */}
                <div className="pt-4 border-t border-blush-100 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-burgundy-900">
                    Hand-Tied Satin Ribbon Color: <span className="text-ribbon-600">{selectedRibbon.name}</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {RIBBON_COLORS.map((ribbon) => (
                      <button
                        key={ribbon.name}
                        type="button"
                        onClick={() => setSelectedRibbon(ribbon)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                          selectedRibbon.name === ribbon.name
                            ? "border-burgundy-900 bg-burgundy-900 text-white shadow-xs"
                            : "border-espresso-200/70 bg-white text-espresso-700 hover:border-ribbon-300"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: ribbon.hex }}
                        />
                        <span>{ribbon.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="btn-primary py-3 px-6 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Keepsake</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Main Keepsake & Photo Upload */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-blush-200 shadow-xl space-y-6"
              >
                <div>
                  <h3 className="font-display text-xl font-bold text-burgundy-900">
                    Step 2: Choose Your Custom Keepsake
                  </h3>
                  <p className="text-xs text-espresso-400 mt-0.5">
                    Pick the primary memory piece that will sit inside the gift box.
                  </p>
                </div>

                {/* Keepsake Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {KEEPSAKE_CHOICES.map((k) => {
                    const isSelected = selectedKeepsake.id === k.id;
                    return (
                      <div
                        key={k.id}
                        onClick={() => setSelectedKeepsake(k)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition ${
                          isSelected
                            ? "border-burgundy-900 bg-blush-50/60 shadow-xs"
                            : "border-espresso-100 hover:border-ribbon-300 bg-cream-50/40"
                        }`}
                      >
                        <img
                          src={k.img}
                          alt={k.name}
                          className="w-full h-24 rounded-xl object-cover mb-2"
                        />
                        <div>
                          <div className="font-bold text-xs text-burgundy-900">{k.name}</div>
                          <div className="text-[10px] text-espresso-400 mt-0.5 line-clamp-2">
                            {k.tagline}
                          </div>
                        </div>
                        <div className="mt-3 font-bold text-xs text-burgundy-900">{formatPrice(k.price)}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Photo & Custom Caption Input */}
                <div className="p-4 rounded-2xl bg-cream-50 border border-blush-200 space-y-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-burgundy-900 block">
                    Upload Photo for {selectedKeepsake.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <img
                      src={assetUrl(keepsakePhoto)}
                      alt="Keepsake preview"
                      className="w-16 h-16 rounded-xl object-cover border border-blush-200 bg-white"
                    />
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-outline !py-2 !px-4 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload size={14} />
                        <span>{uploadingPhoto ? "Uploading..." : "Upload Photo"}</span>
                      </button>
                      <p className="text-[10px] text-espresso-400">JPG, PNG, or WEBP up to 10MB</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                      Engraved Caption / Names
                    </label>
                    <input
                      type="text"
                      value={keepsakeCaption}
                      onChange={(e) => setKeepsakeCaption(e.target.value)}
                      placeholder="e.g. Forever & Always • 12.08.2026"
                      className="input-field text-xs py-2"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 text-xs font-semibold text-espresso-500 hover:text-burgundy-900"
                  >
                    ← Back to Box
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="btn-primary py-3 px-6 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <span>Choose Add-ons</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Curated Add-ons */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-blush-200 shadow-xl space-y-6"
              >
                <div>
                  <h3 className="font-display text-xl font-bold text-burgundy-900">
                    Step 3: Add Curated Treats & Lifestyle Items
                  </h3>
                  <p className="text-xs text-espresso-400 mt-0.5">
                    Select any additional delights to place inside the hamper box.
                  </p>
                </div>

                <div className="space-y-3">
                  {CURATED_ADDONS.map((addon) => {
                    const isSelected = selectedAddons.some((a) => a.id === addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon)}
                        className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 cursor-pointer transition ${
                          isSelected
                            ? "border-burgundy-900 bg-blush-50/60 shadow-xs"
                            : "border-espresso-100 hover:border-ribbon-300 bg-cream-50/40"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={addon.img}
                            alt={addon.name}
                            className="w-14 h-14 rounded-xl object-cover border border-blush-200"
                          />
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-burgundy-900">
                              {addon.name}
                            </div>
                            <div className="text-xs text-espresso-400">{addon.desc}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-xs sm:text-sm text-burgundy-900">
                            +{formatPrice(addon.price)}
                          </span>
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                              isSelected
                                ? "bg-burgundy-900 text-white"
                                : "border border-espresso-300 text-transparent"
                            }`}
                          >
                            <Check size={14} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 text-xs font-semibold text-espresso-500 hover:text-burgundy-900"
                  >
                    ← Back to Keepsake
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="btn-primary py-3 px-6 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <span>Greeting Card</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Complimentary Card & Message */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-blush-200 shadow-xl space-y-6"
              >
                <div>
                  <h3 className="font-display text-xl font-bold text-burgundy-900">
                    Step 4: Complimentary Handwritten Gift Card
                  </h3>
                  <p className="text-xs text-espresso-400 mt-0.5">
                    We hand-print this message on a luxury embossed gold-foil greeting card.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-2">
                    Select Card Occasion
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CARD_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setCardTheme(theme.label)}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                          cardTheme === theme.label
                            ? "border-burgundy-900 bg-burgundy-900 text-white shadow-xs"
                            : "border-espresso-200/70 bg-cream-50 text-espresso-700 hover:border-ribbon-300"
                        }`}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-1">
                    Your Personal Message
                  </label>
                  <textarea
                    rows={4}
                    value={cardMessage}
                    onChange={(e) => setCardMessage(e.target.value)}
                    placeholder="Write a heartfelt note for the recipient..."
                    className="input-field text-xs py-2.5 font-script text-sm leading-relaxed"
                  />
                  <div className="text-[11px] text-espresso-400 mt-1 flex justify-between">
                    <span>Includes complimentary satin ribbon envelope</span>
                    <span>{cardMessage.length} characters</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2 text-xs font-semibold text-espresso-500 hover:text-burgundy-900"
                  >
                    ← Back to Add-ons
                  </button>
                  <button
                    onClick={handleAddHamperToCart}
                    className="btn-primary py-3.5 px-8 text-sm font-semibold flex items-center gap-2 shadow-soft cursor-pointer"
                  >
                    <Gift size={16} />
                    <span>Add Hamper to Cart — {formatPrice(totalHamperPrice)}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Live Virtual Hamper Visualizer (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-blush-200 shadow-2xl space-y-6 lg:sticky lg:top-24">
              <div className="flex items-center justify-between border-b border-blush-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-ribbon-500" />
                  <span className="font-display font-bold text-lg text-burgundy-900">
                    Live Hamper Preview
                  </span>
                </div>
                <span className="text-xs font-bold text-ribbon-600 bg-blush-100 px-2.5 py-0.5 rounded-full border border-blush-200">
                  {selectedRibbon.name} Ribbon
                </span>
              </div>

              {/* Virtual Hamper Box Card */}
              <div className="relative rounded-3xl p-5 bg-gradient-to-br from-cream-100 via-blush-50 to-pink-50 border-2 border-blush-300 shadow-inner space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-burgundy-900">
                  <span>{selectedBox.name}</span>
                  <span>{formatPrice(boxPrice)}</span>
                </div>

                {/* Main Keepsake in Box */}
                <div className="p-3 rounded-2xl bg-white/95 border border-blush-200 flex items-center gap-3 shadow-xs">
                  <img
                    src={assetUrl(keepsakePhoto)}
                    alt="Keepsake"
                    className="w-12 h-12 rounded-xl object-cover border border-blush-100"
                  />
                  <div className="min-w-0 flex-1 text-xs">
                    <div className="font-bold text-burgundy-900 truncate">{selectedKeepsake.name}</div>
                    <div className="text-[10px] text-espresso-400 italic truncate">
                      "{keepsakeCaption}"
                    </div>
                  </div>
                  <span className="font-bold text-xs text-burgundy-900">{formatPrice(keepsakePrice)}</span>
                </div>

                {/* Selected Addons in Box */}
                {selectedAddons.length > 0 && (
                  <div className="space-y-1.5">
                    {selectedAddons.map((add) => (
                      <div
                        key={add.id}
                        className="p-2 rounded-xl bg-white/80 border border-blush-100 flex items-center justify-between text-xs"
                      >
                        <span className="text-espresso-700 truncate max-w-[200px]">{add.name}</span>
                        <span className="font-medium text-burgundy-900">{formatPrice(add.price)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Greeting Card Preview */}
                <div className="p-2.5 rounded-xl bg-white/90 border border-blush-200 text-xs">
                  <div className="font-bold text-burgundy-900 text-[11px]">{cardTheme} Card</div>
                  <div className="text-[10px] text-espresso-400 italic line-clamp-2 mt-0.5">
                    "{cardMessage}"
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs text-espresso-600 border-t border-blush-100 pt-3">
                <div className="flex justify-between">
                  <span>Box & Packaging</span>
                  <span>{formatPrice(boxPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Primary Keepsake</span>
                  <span>{formatPrice(keepsakePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Curated Add-ons ({selectedAddons.length})</span>
                  <span>{formatPrice(addonsPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Greeting Card</span>
                  <span className="text-emerald-700 font-bold">FREE</span>
                </div>

                <div className="border-t border-blush-200 pt-3 flex justify-between font-display font-bold text-xl text-burgundy-900">
                  <span>Total Box Price</span>
                  <span className="text-ribbon-600 font-mono">{formatPrice(totalHamperPrice)}</span>
                </div>
              </div>

              <button
                onClick={handleAddHamperToCart}
                className="btn-primary w-full py-4 text-sm font-semibold justify-center flex items-center gap-2 shadow-soft cursor-pointer"
              >
                <Gift size={16} />
                <span>Add Hamper to Cart</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-espresso-400">
                <Truck size={14} className="text-ribbon-500" />
                <span>Qualifies for FREE Express Shipping</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
