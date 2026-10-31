import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Truck,
  Star,
  Sparkles,
  Check,
  Box,
  MessageSquare,
  Camera,
  X,
  Award,
  ArrowRight,
  Trash2,
  Minus,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { api, assetUrl } from "../api/client";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useLocationStore } from "../store/locationStore";
import ProductCard from "../components/ProductCard";
import ProductCustomizerModal from "../components/ProductCustomizerModal";
import QuickViewModal from "../components/QuickViewModal";
import VirtualUnboxingModal from "../components/VirtualUnboxingModal";
import ShareProduct from "../components/ShareProduct";
import { useSeo, absoluteUrl, SITE_NAME, SITE_URL } from "../utils/seo";

const formatPrice = (n) => `₹${n.toLocaleString("en-IN")}`;

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const { user } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const mobileScrollRef = useRef(null);

  const handleMobileScroll = (e) => {
    const el = e.currentTarget;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const width = el.offsetWidth || 1;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== selectedImage && newIndex >= 0 && newIndex < galleryImages.length) {
      setSelectedImage(newIndex);
    }
  };

  // Dynamic Options selection
  const [selectedOptions, setSelectedOptions] = useState({});

  // Reviews Data
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    totalReviews: 0,
    averageRating: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewPhoto, setReviewPhoto] = useState("");
  const [uploadingReviewPhoto, setUploadingReviewPhoto] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Customizer modal
  const [customizerModalOpen, setCustomizerModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [unboxingModalOpen, setUnboxingModalOpen] = useState(false);

  // Pincode ETA Checker with cross-app persistence
  const [pincode, setPincode] = useState(() => {
    try {
      return (
        localStorage.getItem("ribbon_delivery_pincode") ||
        useLocationStore.getState().location?.pincode ||
        ""
      );
    } catch {
      return "";
    }
  });
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [checkingPincode, setCheckingPincode] = useState(false);

  const fetchReviews = async (productId) => {
    try {
      const { data } = await api.get(`/reviews/product/${productId}`);
      setReviewsData({
        reviews: data?.reviews || [],
        totalReviews: data?.totalReviews || data?.reviews?.length || 0,
        averageRating: data?.averageRating || 0,
        distribution: data?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
    } catch (err) {
      console.error(err);
      setReviewsData({
        reviews: [],
        totalReviews: 0,
        averageRating: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
    }
  };

  const checkPincodeServiceability = async (pinToCheck, showToast = true) => {
    const clean = String(pinToCheck || "").trim().replace(/\D/g, "");
    if (!clean || clean.length !== 6 || isNaN(clean)) {
      if (showToast) toast.error("Please enter a valid 6-digit Indian pincode");
      return;
    }

    setCheckingPincode(true);
    try {
      const isCustom3D = Boolean(
        product?.isCustomizable ||
        product?.category === "3d-printed-keepsakes" ||
        product?.slug?.includes("3d") ||
        product?.slug?.includes("keepsake")
      );
      const { data } = await api.post("/shipping/check-serviceability", {
        pincode: clean,
        quantity,
        isCustom3D,
      });

      if (data?.serviceable) {
        const standardInfo = data.standard || {};
        setPincodeStatus({
          pincode: clean,
          dateFormatted: standardInfo.formattedEDD || data.formattedEDD,
          courier: standardInfo.courierName || data.recommendedCourier?.courier_name || "BlueDart Express",
          rate: standardInfo.fee || 99,
          message: `Estimated delivery by ${standardInfo.formattedEDD || data.formattedEDD} (${standardInfo.breakdown || "includes 3D printing & transit"})`,
          availableCouriers: data.availableCouriers || [],
          isMetro: Boolean(data.isMetro || data.express?.serviceable),
        });

        // Persist consistently across app
        try {
          localStorage.setItem("ribbon_delivery_pincode", clean);
          useLocationStore.getState().setPincode(clean, {
            expressAvailable: Boolean(data.express?.serviceable ?? true),
          });
        } catch {}

        if (showToast) {
          toast.success(`Delivery timeline calculated for PIN ${clean}!`);
        }
      } else {
        if (showToast) {
          toast.error("Pincode currently not serviceable");
        }
      }
    } catch {
      if (showToast) {
        toast.error("Could not check delivery serviceability");
      }
    } finally {
      setCheckingPincode(false);
    }
  };

  const handleCheckPincode = (e) => {
    e?.preventDefault();
    checkPincodeServiceability(pincode, true);
  };

  // If a pincode was already saved, automatically calculate ETA once product details are ready
  useEffect(() => {
    const savedPin =
      localStorage.getItem("ribbon_delivery_pincode") ||
      useLocationStore.getState().location?.pincode ||
      "";
    if (savedPin && /^\d{6}$/.test(savedPin) && product) {
      setPincode(savedPin);
      checkPincodeServiceability(savedPin, false);
    }
  }, [product?.slug]);

  useEffect(() => {
    setLoading(true);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: "instant" });

    api
      .get(`/products/${slug}`)
      .then(({ data }) => {
        setProduct(data.product);

        // Set default options
        const defaults = {};
        (data.product.optionGroups || []).forEach((group) => {
          if (group.values?.length > 0) {
            defaults[group.name] = group.values[0];
          }
        });
        setSelectedOptions(defaults);

        fetchReviews(data.product._id);
        const currentCategory = data.product.category;
        return api.get("/products").then(({ data: prodRes }) => {
          const all = prodRes?.products || [];
          const inCategory = all.filter((p) => p.slug !== slug && p.category === currentCategory);
          const outside = all.filter((p) => p.slug !== slug && p.category !== currentCategory);
          setRelated([...inCategory, ...outside].slice(0, 5));
        });
      })
      .catch(() => toast.error("Couldn't load this keepsake"))
      .finally(() => setLoading(false));
  }, [slug]);

  useSeo({
    title: product ? `${product.name} — ${formatPrice(product.price)}` : undefined,
    description: product?.tagline || product?.description,
    path: `/product/${slug}`,
    image: product?.images?.[0],
    type: product ? "product" : "website",
    jsonLd: product
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description || product.tagline || undefined,
          image: (product.images || []).filter(Boolean).map(absoluteUrl),
          sku: product.slug,
          brand: { "@type": "Brand", name: SITE_NAME },
          offers: {
            "@type": "Offer",
            url: `${SITE_URL}/product/${product.slug}`,
            priceCurrency: "INR",
            price: product.price,
            availability:
              typeof product.stock === "number" && product.stock <= 0
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
          },
          // Only real reviews: Google penalises made-up ratings
          ...(reviewsData.totalReviews > 0
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: reviewsData.averageRating,
                  reviewCount: reviewsData.totalReviews,
                },
              }
            : {}),
        }
      : null,
  });

  // "Leave a review" links (delivered email) open the review form directly
  const wantsReview = searchParams.get("review") === "1";
  useEffect(() => {
    if (!wantsReview || !product) return;
    setReviewModalOpen(true);
    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
    setSearchParams({}, { replace: true });
  }, [wantsReview, product, setSearchParams]);

  if (loading) {
    return (
      <div className="container-page py-24 text-center">
        <p className="font-display text-lg text-espresso-400">Loading keepsake details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page py-24 text-center space-y-4">
        <p className="font-display text-2xl text-burgundy-900">Keepsake not found</p>
        <Link to="/shop" className="btn-primary">
          Back to Shop
        </Link>
      </div>
    );
  }

  // Calculate unit price with selected options
  const optionsDelta = Object.values(selectedOptions).reduce(
    (sum, opt) => sum + (Number(opt?.priceDelta) || 0),
    0
  );
  const unitPrice = product.price + optionsDelta;

  const galleryImages = (Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : product.image
    ? [product.image]
    : ["/images/photo-magnet.webp"];

  const hasReviews =
    (reviewsData.totalReviews > 0 || (reviewsData.reviews && reviewsData.reviews.length > 0)) &&
    reviewsData.averageRating > 0;

  const productId = product?._id || product?.slug;
  const cartItem = (items || []).find(
    (i) => i.productId === productId && !i.customization?.photoUrl && !i.customization?.cuteImageUrl
  );
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const handleOptionChange = (groupName, val) => {
    setSelectedOptions((prev) => ({ ...prev, [groupName]: val }));
  };

  const handleAddToCart = () => {
    if (product.isCustomizable) {
      setCustomizerModalOpen(true);
      return;
    }

    if (typeof product.stock === "number" && product.stock <= 0) {
      toast.error(`Sorry, "${product.name}" is out of stock`);
      return;
    }

    const chosenOptionsList = Object.entries(selectedOptions).map(([name, opt]) => ({
      name,
      value: opt.label,
      priceDelta: opt.priceDelta || 0,
    }));

    const added = addItem(
      {
        productId: product._id || product.slug,
        name: product.name,
        image: product.images?.[0] || product.image || "/images/photo-magnet.webp",
        price: product.price,
        quantity: 1,
        stock: typeof product.stock === "number" ? product.stock : undefined,
        selectedOptions: chosenOptionsList,
        customization: {},
      },
      false
    );
    if (added !== false) {
      toast.success(`Added "${product.name}" to cart!`, { icon: "🛍️" });
    }
  };

  const handleReviewPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("photo", file);

    setUploadingReviewPhoto(true);
    try {
      const { data } = await api.post("/upload", form);
      setReviewPhoto(data.url);
      toast.success("Photo attached!");
    } catch {
      toast.error("Photo upload failed");
    } finally {
      setUploadingReviewPhoto(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to write a review");
      navigate("/login", { state: { from: `/product/${slug}?review=1` } });
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post("/reviews", {
        productId: product._id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        photos: reviewPhoto ? [reviewPhoto] : [],
      });
      toast.success("Review published! Thank you for sharing your experience.");
      setReviewModalOpen(false);
      setReviewComment("");
      setReviewTitle("");
      setReviewPhoto("");
      fetchReviews(product._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="bg-white min-h-screen py-5 sm:py-8">
      <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Breadcrumbs */}
        <nav className="text-[11px] text-stone-400 mb-4 flex items-center gap-1.5">
          <Link to="/" className="hover:text-rose-900 transition">Home</Link>
          <span className="text-stone-300">/</span>
          <Link to="/shop" className="hover:text-rose-900 transition">Shop</Link>
          <span className="text-stone-300">/</span>
          <span className="text-stone-800 font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Layout - Natural spacing and clean gap between gallery and details */}
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-10 xl:gap-12">
          {/* Images Gallery */}
          <div className="w-full lg:w-auto lg:shrink-0 lg:sticky lg:top-24">
            {/* Mobile View (< sm): Swipeable Carousel, Auto-scroll disabled, No Thumbnails */}
            <div className="sm:hidden w-full relative">
              <div
                ref={mobileScrollRef}
                onScroll={handleMobileScroll}
                className="w-full flex overflow-x-auto snap-x snap-mandatory rounded-2xl no-scrollbar aspect-square bg-stone-50 border border-stone-200/90 shadow-sm"
              >
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="w-full min-w-full shrink-0 snap-center aspect-square relative flex items-center justify-center">
                    <img
                      src={assetUrl(img)}
                      alt={`${product.name} - ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/photo-magnet.webp";
                      }}
                    />
                  </div>
                ))}
              </div>

              {product.isBestseller && (
                <span className="absolute top-3 left-3 bg-rose-600 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs pointer-events-none z-10">
                  Bestseller
                </span>
              )}

              {/* Dots indicator for mobile carousel when multiple images */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 pointer-events-none z-10">
                  {galleryImages.map((_, idx) => (
                    <span
                      key={idx}
                      className={`transition-all duration-300 rounded-full shadow-xs ${
                        selectedImage === idx
                          ? "w-5 h-1.5 bg-rose-600"
                          : "w-1.5 h-1.5 bg-white/80 backdrop-blur-xs"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop / Tablet View (>= sm): Thumbnails on the left + Active Image on the right */}
            <div className="hidden sm:flex flex-row gap-3 items-start">
              {/* Thumbnails on the left */}
              {galleryImages.length > 1 && (
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[440px] no-scrollbar shrink-0">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(idx)}
                      onMouseEnter={() => setSelectedImage(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0 cursor-pointer bg-white ${
                        selectedImage === idx
                          ? "border-rose-600 ring-2 ring-rose-500/20 shadow-xs"
                          : "border-stone-200 opacity-70 hover:opacity-100 hover:border-stone-400"
                      }`}
                    >
                      <img
                        src={assetUrl(img)}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/images/photo-magnet.webp";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Active Image */}
              <div className="sm:w-[380px] md:w-[420px] lg:w-[440px] aspect-square rounded-2xl overflow-hidden bg-stone-50 border border-stone-200/90 shadow-sm relative group flex items-center justify-center">
                <img
                  key={selectedImage}
                  src={assetUrl(galleryImages[selectedImage] || galleryImages[0])}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/images/photo-magnet.webp";
                  }}
                />
                {product.isBestseller && (
                  <span className="absolute top-3 left-3 bg-rose-600 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    Bestseller
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details & Customization Options - Natural width with breathing room */}
          <div className="w-full max-w-xl space-y-3.5">
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200/70 text-[9.5px] font-bold text-rose-700 tracking-wider uppercase mb-1">
                <Sparkles size={10} className="text-rose-500" />
                <span>{product.category?.replace("-", " ") || "Personalized 3D"}</span>
              </div>

              <h1 className="font-display text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {product.tagline && (
                <p className="text-xs text-stone-500 mt-0.5 leading-normal">
                  {product.tagline}
                </p>
              )}

              {/* Rating header - only show if real reviews exist */}
              {hasReviews && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                  <div className="flex items-center text-amber-500">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="font-bold ml-1 text-stone-900 text-[11px]">{reviewsData.averageRating}</span>
                  </div>
                  <span className="text-stone-300">•</span>
                  <span
                    onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}
                    className="text-stone-500 hover:text-stone-800 underline underline-offset-2 cursor-pointer text-[11px]"
                  >
                    {reviewsData.totalReviews} verified customer reviews
                  </span>
                </div>
              )}
            </div>

            {/* Price Box & Stock Indicator - Sleek & Compact */}
            <div className="flex items-center justify-between py-1 border-b border-stone-100">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-extrabold text-stone-900">
                  {formatPrice(unitPrice)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-xs text-stone-400 line-through font-mono">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              {typeof product.stock === "number" && (
                product.stock <= 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                    Out of Stock
                  </span>
                ) : product.stock <= 5 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200 animate-pulse">
                    Only {product.stock} left in stock!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    In Stock ({product.stock})
                  </span>
                )
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="text-xs text-stone-600 leading-relaxed">
                <p className={!isDescExpanded ? "line-clamp-2 sm:line-clamp-none" : ""}>
                  {product.description}
                </p>
                {product.description.length > 80 && (
                  <button
                    type="button"
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="sm:hidden mt-0.5 text-[11px] font-bold text-rose-600 hover:text-rose-800 transition cursor-pointer"
                  >
                    {isDescExpanded ? "less" : "... more"}
                  </button>
                )}
              </div>
            )}

            {/* Dynamic Option Groups */}
            {(product.optionGroups || []).map((group) => (
              <div key={group.name} className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-900">
                  Choose {group.name}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {group.values?.map((val) => {
                    const isSelected = selectedOptions[group.name]?.label === val.label;
                    return (
                      <button
                        key={val.label}
                        type="button"
                        onClick={() => handleOptionChange(group.name, val)}
                        className={`p-2 rounded-lg border text-left text-xs transition cursor-pointer ${
                          isSelected
                            ? "border-stone-900 bg-stone-900 text-white shadow-xs font-semibold"
                            : "border-stone-200 bg-white text-stone-700 hover:border-rose-300"
                        }`}
                      >
                        <div className="truncate font-medium text-[11px]">{val.label}</div>
                        {val.priceDelta > 0 && (
                          <div className={`text-[9.5px] ${isSelected ? "text-rose-200" : "text-rose-600 font-bold"}`}>
                            +₹{val.priceDelta}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Responsive product actions */}
            <div className="border-t border-stone-100 pt-3 sm:pt-4">
              <div className="flex w-full min-w-0 items-center gap-2 sm:gap-3">
                {product.isCustomizable ? (
                  <button
                    type="button"
                    onClick={() => setCustomizerModalOpen(true)}
                    className="btn-primary flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold uppercase tracking-wide shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 cursor-pointer"
                  >
                    <Sparkles size={15} className="shrink-0 text-amber-300" />
                    <span className="truncate">Personalize — {formatPrice(unitPrice)}</span>
                  </button>
                ) : cartQuantity > 0 ? (
                  <>
                    {/* Remove item: separate from quantity adjustment */}
                    <button
                      type="button"
                      onClick={() => {
                        removeItem(cartItem.id);
                        toast("Removed from cart", { icon: "🗑️" });
                      }}
                      aria-label="Remove from cart"
                      title="Remove from cart"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 active:scale-[0.97] cursor-pointer"
                    >
                      <Trash2 size={17} strokeWidth={1.8} />
                    </button>

                    {/* Standard, unified quantity stepper */}
                    <div
                      className="inline-flex h-11 shrink-0 items-center overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm"
                      aria-label={`Quantity: ${cartQuantity}`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (cartQuantity <= 1) {
                            removeItem(cartItem.id);
                            toast("Removed from cart", { icon: "🗑️" });
                          } else {
                            updateQuantity(cartItem.id, cartQuantity - 1);
                          }
                        }}
                        aria-label="Decrease quantity"
                        className="flex h-full w-9 items-center justify-center text-stone-600 transition hover:bg-stone-50 hover:text-stone-900 focus-visible:outline-none focus-visible:bg-stone-100 active:bg-stone-100 cursor-pointer"
                      >
                        <Minus size={15} strokeWidth={2.2} />
                      </button>
                      <span className="min-w-8 select-none px-1 text-center text-sm font-semibold tabular-nums text-stone-900">
                        {cartQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof product.stock === "number" && cartQuantity >= product.stock) {
                            toast.error(`Only ${product.stock} available in stock`);
                            return;
                          }
                          updateQuantity(cartItem.id, cartQuantity + 1);
                        }}
                        aria-label="Increase quantity"
                        className="flex h-full w-9 items-center justify-center text-stone-600 transition hover:bg-stone-50 hover:text-stone-900 focus-visible:outline-none focus-visible:bg-stone-100 active:bg-stone-100 cursor-pointer"
                      >
                        <Plus size={15} strokeWidth={2.2} />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={typeof product.stock === "number" && product.stock <= 0}
                    className={`flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold uppercase tracking-wide shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 ${
                      typeof product.stock === "number" && product.stock <= 0
                        ? "bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-200"
                        : "btn-primary hover:shadow-md cursor-pointer"
                    }`}
                  >
                    <Sparkles size={15} className={`shrink-0 ${typeof product.stock === "number" && product.stock <= 0 ? "text-stone-400" : "text-amber-300"}`} />
                    <span className="truncate">
                      {typeof product.stock === "number" && product.stock <= 0
                        ? "Out of Stock"
                        : `Add to Cart — ${formatPrice(unitPrice)}`}
                    </span>
                  </button>
                )}

                <ShareProduct product={product} />
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section - Only show when actual reviews exist */}
        {hasReviews && (
          <section id="reviews" className="scroll-mt-24 mt-12 pt-8 border-t border-stone-200/80 space-y-6">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-900">
                Customer Stories &amp; Verified Reviews
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Real keepsakes delivered to living rooms and desks across India.
              </p>
            </div>

            {/* Rating Summary Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs">
              <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-stone-100 pb-3 md:pb-0">
                <div className="font-display text-3xl sm:text-4xl font-extrabold text-stone-900">
                  {reviewsData.averageRating}
                </div>
                <div className="flex text-amber-400 my-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-stone-400">
                  Based on {reviewsData.totalReviews} verified customer reviews
                </span>
              </div>

              <div className="md:col-span-2 flex flex-col justify-center space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviewsData.distribution?.[star] || 0;
                  const percent = reviewsData.totalReviews > 0 ? (count / reviewsData.totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2.5 text-xs">
                      <span className="w-7 font-medium text-stone-600 text-[11px]">{star} ★</span>
                      <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-stone-400 text-[11px] font-mono">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewsData.reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-4 rounded-2xl bg-white border border-stone-200/80 space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blush-100 text-burgundy-900 font-bold text-xs flex items-center justify-center">
                        {rev.userName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-burgundy-900">{rev.userName}</div>
                        <div className="text-[10px] text-espresso-400">{rev.userCity}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Award size={11} /> Verified Buyer
                    </span>
                  </div>

                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={i < rev.rating ? "fill-amber-400" : "text-slate-200"}
                      />
                    ))}
                  </div>

                  {rev.title && <h4 className="font-bold text-xs text-burgundy-900">{rev.title}</h4>}
                  <p className="text-xs text-espresso-600 leading-relaxed italic">&quot;{rev.comment}&quot;</p>

                  {rev.photos?.length > 0 && (
                    <div className="flex gap-2 pt-1">
                      {rev.photos.map((ph, pIdx) => (
                        <img
                          key={pIdx}
                          src={assetUrl(ph)}
                          alt="Customer photo"
                          className="w-14 h-14 rounded-xl object-cover border border-blush-200"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* You Might Also Like */}
        {related.length > 0 && (
          <section className="mt-16 pt-12 pb-12 sm:pb-16 lg:pb-20 border-t border-stone-200/80">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ribbon-600 mb-1">
                  More to love
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                  You might also like
                </h2>
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-ribbon-600 hover:text-ribbon-700 transition"
              >
                View all keepsakes <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
              {related.slice(0, 5).map((p, i) => (
                <ProductCard
                  key={p._id || p.slug}
                  product={p}
                  index={i}
                  onQuickView={setQuickViewProduct}
                  onPersonalize={() => setCustomizerModalOpen(true)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Write a Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 border border-blush-200 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-blush-100">
              <h3 className="font-display text-lg font-bold text-burgundy-900">
                Write a Verified Review
              </h3>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="p-1 text-espresso-400 hover:text-burgundy-900 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-burgundy-900 mb-1">Your Rating</label>
                <div className="flex gap-1.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewRating(s)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        size={22}
                        className={s <= reviewRating ? "fill-amber-400" : "text-slate-300"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-burgundy-900 mb-1">Review Headline</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Stunning acrylic shine & fast shipping!"
                  className="input-field text-xs py-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-burgundy-900 mb-1">Your Experience & Feedback *</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about the keepsake quality, unboxing, and recipient reactions..."
                  className="input-field text-xs py-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-burgundy-900 mb-1">Attach Unboxing Photo (Optional)</label>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 border border-blush-200 text-espresso-700 text-xs font-semibold cursor-pointer flex items-center gap-1.5">
                    <Camera size={14} />
                    <span>{uploadingReviewPhoto ? "Uploading..." : reviewPhoto ? "Change Photo" : "Upload Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleReviewPhotoUpload}
                    />
                  </label>
                  {reviewPhoto && (
                    <img
                      src={assetUrl(reviewPhoto)}
                      alt="review preview"
                      className="w-10 h-10 rounded-lg object-cover border border-blush-200"
                    />
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-blush-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-espresso-500 hover:text-burgundy-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-primary py-2 px-6 text-xs font-semibold cursor-pointer"
                >
                  {submittingReview ? "Submitting..." : "Publish Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProductCustomizerModal
        product={product}
        isOpen={customizerModalOpen}
        onClose={() => setCustomizerModalOpen(false)}
      />
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onOpenCustomizer={() => setCustomizerModalOpen(true)}
      />
      <VirtualUnboxingModal
        isOpen={unboxingModalOpen}
        onClose={() => setUnboxingModalOpen(false)}
        product={product}
      />
    </div>
  );
}
