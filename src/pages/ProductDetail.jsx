import { useEffect, useState } from "react";
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
  MapPin,
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
  const addItem = useCartStore((s) => s.addItem);
  const { user } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Dynamic Options selection
  const [selectedOptions, setSelectedOptions] = useState({});

  // Reviews Data
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    totalReviews: 0,
    averageRating: 4.9,
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
      setReviewsData(data);
    } catch (err) {
      console.error(err);
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
        return api.get("/products", { params: { category: data.product.category } });
      })
      .then(({ data }) => setRelated((data.products || []).filter((p) => p.slug !== slug).slice(0, 3)))
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

  const handleOptionChange = (groupName, val) => {
    setSelectedOptions((prev) => ({ ...prev, [groupName]: val }));
  };

  const handleAddToCart = () => {
    if (product.isCustomizable) {
      setCustomizerModalOpen(true);
      return;
    }

    const chosenOptionsList = Object.entries(selectedOptions).map(([name, opt]) => ({
      name,
      value: opt.label,
      priceDelta: opt.priceDelta || 0,
    }));

    addItem({
      productId: product._id || product.slug,
      name: product.name,
      image: product.images?.[0] || "/images/photo-magnet.webp",
      price: product.price, // option deltas are added by the cart subtotal
      quantity,
      selectedOptions: chosenOptionsList,
      customization: {},
    });
    toast.success(`${product.name} added to your cart!`);
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
    <div className="bg-[#FAF8F5] min-h-screen py-5 sm:py-8">
      <div className="max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6">
        {/* Breadcrumbs */}
        <nav className="text-[11px] text-stone-400 mb-4 flex items-center gap-1.5">
          <Link to="/" className="hover:text-rose-900 transition">Home</Link>
          <span className="text-stone-300">/</span>
          <Link to="/shop" className="hover:text-rose-900 transition">Shop</Link>
          <span className="text-stone-300">/</span>
          <span className="text-stone-800 font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Grid - Compact & Perfectly Proportioned */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Images Gallery - Proportionate & Sticky */}
          <div className="md:col-span-5 space-y-2.5 md:sticky md:top-20">
            <div className="aspect-square max-h-[380px] sm:max-h-[400px] w-full rounded-2xl overflow-hidden bg-white border border-stone-200/90 shadow-sm relative group flex items-center justify-center">
              <img
                src={assetUrl(product.images?.[selectedImage] || product.images?.[0])}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                onError={(e) => {
                  e.target.src = "/images/photo-magnet.webp";
                }}
              />
              {product.isBestseller && (
                <span className="absolute top-3 left-3 bg-rose-600 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  Bestseller
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-0.5 max-w-[380px]">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                      selectedImage === idx
                        ? "border-rose-600 ring-1 ring-rose-500/20 shadow-xs"
                        : "border-stone-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={assetUrl(img)} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Customization Options - Balanced & Compact */}
          <div className="md:col-span-7 space-y-3">
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

              {/* Rating header */}
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
                  {reviewsData.totalReviews || product.reviewCount || 1} verified customer reviews
                </span>
              </div>
            </div>

            {/* Price Box - Sleek & Compact */}
            <div className="flex items-baseline gap-2 py-1 border-b border-stone-100">
              <span className="font-display text-2xl font-extrabold text-stone-900">
                {formatPrice(unitPrice)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-stone-400 line-through font-mono">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-stone-600 leading-relaxed">
              {product.description}
            </p>

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

            {/* Quantity and Actions */}
            <div className="pt-2.5 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50/70 h-9.5 shadow-2xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2.5 h-full text-stone-600 hover:text-stone-900 font-bold transition cursor-pointer flex items-center justify-center select-none text-xs"
                    title="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="px-2.5 text-xs font-bold text-stone-900 font-mono min-w-[20px] text-center select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-2.5 h-full text-stone-600 hover:text-stone-900 font-bold transition cursor-pointer flex items-center justify-center select-none text-xs"
                    title="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="btn-primary flex-1 h-9.5 text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs hover:shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Sparkles size={13} className="text-amber-300" />
                  <span>
                    {product.isCustomizable
                      ? `Personalize & Add — ${formatPrice(unitPrice * quantity)}`
                      : `Add to Cart — ${formatPrice(unitPrice * quantity)}`}
                  </span>
                </button>

                <ShareProduct product={product} />
              </div>
            </div>

            {/* Delivery Pincode - Ultra-Compact Inline Row */}
            <div className="pt-2 border-t border-stone-100 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin size={13} className="text-rose-600 shrink-0" />
                  <span className="text-[11px] text-stone-600 font-medium whitespace-nowrap">Deliver to:</span>
                  <form onSubmit={handleCheckPincode} className="inline-flex items-center gap-1">
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPincode(val);
                        if (val.length === 6) {
                          checkPincodeServiceability(val, true);
                        }
                      }}
                      placeholder="PIN code"
                      className="w-16 px-1 py-0.5 text-[11px] font-mono border-b border-stone-300 focus:border-rose-600 bg-transparent outline-none text-stone-900 font-semibold transition"
                    />
                    <button
                      type="submit"
                      disabled={checkingPincode}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-800 transition cursor-pointer disabled:opacity-50"
                    >
                      {checkingPincode ? "..." : "Check"}
                    </button>
                  </form>
                </div>

                {pincodeStatus ? (
                  <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-1 shrink-0">
                    <Check size={11} className="stroke-[3]" />
                    <span>{pincodeStatus.dateFormatted ? `By ${pincodeStatus.dateFormatted}` : "Serviceable"}</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-400">PAN-India Delivery</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section - Refined & Compact */}
        <section id="reviews" className="scroll-mt-24 mt-12 pt-8 border-t border-stone-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-900">
                Customer Stories & Verified Reviews
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Real keepsakes delivered to living rooms and desks across India.
              </p>
            </div>
            <button
              onClick={() => setReviewModalOpen(true)}
              className="btn-outline !py-2 !px-4 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 rounded-xl"
            >
              <MessageSquare size={13} />
              <span>Write a Review</span>
            </button>
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
                Based on {reviewsData.totalReviews || 1} verified customer reviews
              </span>
            </div>

            <div className="md:col-span-2 flex flex-col justify-center space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviewsData.distribution?.[star] || (star === 5 ? reviewsData.totalReviews || 1 : 0);
                const percent = reviewsData.totalReviews > 0 ? (count / reviewsData.totalReviews) * 100 : star === 5 ? 100 : 0;
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
            {reviewsData.reviews?.length === 0 ? (
              <div className="col-span-2 p-6 text-center bg-white rounded-2xl border border-stone-200/80 text-stone-400 text-xs">
                No reviews yet. Be the first to share your keepsake story!
              </div>
            ) : (
              reviewsData.reviews.map((rev) => (
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
              ))
            )}
          </div>
        </section>

        {/* You Might Also Like */}
        {related.length > 0 && (
          <section className="mt-16 pt-12 border-t border-blush-200">
            <h2 className="font-display text-2xl font-bold text-burgundy-900 mb-8">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p, i) => (
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
