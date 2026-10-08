import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import toast from "react-hot-toast";
import { api, assetUrl } from "../api/client";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useRecentlyViewedStore } from "../store/recentlyViewedStore";
import ProductCard from "../components/ProductCard";
import ProductCustomizerModal from "../components/ProductCustomizerModal";
import QuickViewModal from "../components/QuickViewModal";
import VirtualUnboxingModal from "../components/VirtualUnboxingModal";
import RecentlyViewed from "../components/RecentlyViewed";

const formatPrice = (n) => `₹${n.toLocaleString("en-IN")}`;

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
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

  // Pincode ETA Checker
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState(null);

  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addRecentlyViewed);

  const fetchReviews = async (productId) => {
    try {
      const { data } = await api.get(`/reviews/product/${productId}`);
      setReviewsData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckPincode = async (e) => {
    e.preventDefault();
    const clean = pincode.trim();
    if (!clean || clean.length !== 6 || isNaN(clean)) {
      toast.error("Please enter a valid 6-digit Indian pincode");
      return;
    }

    try {
      const { data } = await api.post("/shipping/check-serviceability", { pincode: clean });
      if (data.serviceable) {
        setPincodeStatus({
          pincode: clean,
          dateFormatted: data.formattedEDD,
          courier: data.recommendedCourier?.courier_name || "Express Air Courier",
          rate: data.recommendedCourier?.rate,
          message: `Delivery available by ${data.formattedEDD} via ${data.recommendedCourier?.courier_name || "Express Air Courier"}`,
          availableCouriers: data.availableCouriers || [],
        });
        toast.success(`Express Delivery available for PIN ${clean}!`);
      } else {
        toast.error("Pincode currently not serviceable");
      }
    } catch {
      toast.error("Could not check delivery serviceability");
    }
  };

  useEffect(() => {
    setLoading(true);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: "instant" });

    api
      .get(`/products/${slug}`)
      .then(({ data }) => {
        setProduct(data.product);
        addRecentlyViewed(data.product);

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
  }, [slug, addRecentlyViewed]);

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
      image: product.images?.[0] || "/src/assets/images/photo-magnet.jpeg",
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
      navigate("/login");
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
    <div className="bg-cream-50 min-h-screen py-10 sm:py-16">
      <div className="container-page">
        {/* Breadcrumbs */}
        <nav className="text-xs text-espresso-400 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-burgundy-900">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-burgundy-900">Shop</Link>
          <span>/</span>
          <span className="text-burgundy-900 font-semibold">{product.name}</span>
        </nav>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Images Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-blush-200 shadow-xl relative group">
              <img
                src={assetUrl(product.images?.[selectedImage] || product.images?.[0])}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                onError={(e) => {
                  e.target.src = "/src/assets/images/photo-magnet.jpeg";
                }}
              />
              {product.isBestseller && (
                <span className="absolute top-4 left-4 bg-rose-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  Bestseller
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                      selectedImage === idx ? "border-burgundy-900 shadow-md" : "border-blush-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={assetUrl(img)} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Customization Options */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-ribbon-600">
                {product.category?.replace("-", " ")}
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-burgundy-900 mt-1">
                {product.name}
              </h1>
              {product.tagline && (
                <p className="text-sm text-espresso-400 mt-1.5">{product.tagline}</p>
              )}

              {/* Rating header */}
              <div className="flex items-center gap-2 mt-3 text-xs">
                <div className="flex items-center text-amber-500">
                  <Star size={15} className="fill-amber-400" />
                  <span className="font-bold ml-1 text-burgundy-900">{reviewsData.averageRating}</span>
                </div>
                <span className="text-espresso-300">•</span>
                <span className="text-espresso-400 underline cursor-pointer">
                  {reviewsData.totalReviews || product.reviewCount || 1} verified customer reviews
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-white border border-blush-200 flex items-baseline gap-3">
              <span className="font-display text-3xl font-extrabold text-burgundy-900">
                {formatPrice(unitPrice)}
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-espresso-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Includes Gift Box
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-espresso-600 leading-relaxed">
              {product.description}
            </p>

            {/* Dynamic Option Groups */}
            {(product.optionGroups || []).map((group) => (
              <div key={group.name} className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-burgundy-900">
                  Choose {group.name}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {group.values?.map((val) => {
                    const isSelected = selectedOptions[group.name]?.label === val.label;
                    return (
                      <button
                        key={val.label}
                        type="button"
                        onClick={() => handleOptionChange(group.name, val)}
                        className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                          isSelected
                            ? "border-burgundy-900 bg-burgundy-900 text-white shadow-xs font-semibold"
                            : "border-espresso-200/60 bg-white text-espresso-600 hover:border-ribbon-300"
                        }`}
                      >
                        <div className="truncate font-medium">{val.label}</div>
                        {val.priceDelta > 0 && (
                          <div className={`text-[10px] ${isSelected ? "text-rose-200" : "text-ribbon-600 font-bold"}`}>
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
            <div className="pt-4 border-t border-blush-200 space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-2xl border border-espresso-200 bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-sm font-bold text-espresso-600 hover:text-burgundy-900 cursor-pointer"
                  >
                    −
                  </button>
                  <span className="px-3 text-sm font-bold text-burgundy-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 text-sm font-bold text-espresso-600 hover:text-burgundy-900 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="btn-primary flex-1 py-3.5 text-sm font-semibold shadow-soft flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={16} />
                  <span>
                    {product.isCustomizable
                      ? `Personalize & Add — ${formatPrice(unitPrice * quantity)}`
                      : `Add to Cart — ${formatPrice(unitPrice * quantity)}`}
                  </span>
                </button>
              </div>

              {/* Virtual Unboxing Interactive Preview Button */}
              <button
                type="button"
                onClick={() => setUnboxingModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-50 via-blush-50 to-rose-50 hover:from-rose-100 hover:to-blush-100 border border-rose-200/80 text-burgundy-900 text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs group"
              >
                <Box size={15} className="text-ribbon-500 group-hover:rotate-12 transition-transform" />
                <span>Experience 3D Virtual Ribbon Box Unboxing</span>
                <Sparkles size={13} className="text-amber-500" />
              </button>
            </div>

            {/* Pincode & Express Delivery Checker Widget */}
            <div className="p-4 rounded-2xl bg-white border border-blush-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-burgundy-900 flex items-center gap-1.5">
                  <Truck size={15} className="text-ribbon-500" />
                  <span>Check Delivery Date &amp; Pincode</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  PAN-India Express
                </span>
              </div>

              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit Pincode"
                  className="input-field text-xs py-2 font-mono flex-1"
                />
                <button
                  type="submit"
                  className="btn-primary !py-2 !px-4 text-xs font-bold uppercase tracking-wider"
                >
                  Check
                </button>
              </form>

              {pincodeStatus && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-800 space-y-1"
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-600" />
                    <span>{pincodeStatus.message}</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 flex items-center justify-between">
                    <span>Dispatched via {pincodeStatus.courier}</span>
                    {pincodeStatus.isMetro && (
                      <span className="font-bold text-rose-700">⚡ Express Priority</span>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-1 text-xs text-espresso-600">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-blush-100">
                <Truck size={16} className="text-ribbon-500" />
                <span>Express PAN-India Delivery</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-blush-100">
                <ShieldCheck size={16} className="text-ribbon-500" />
                <span>100% Damage-Proof Box</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="mt-20 pt-12 border-t border-blush-200 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-burgundy-900">
                Customer Stories & Verified Reviews
              </h2>
              <p className="text-xs text-espresso-400 mt-1">
                Real keepsakes delivered to living rooms and fridges across India.
              </p>
            </div>
            <button
              onClick={() => setReviewModalOpen(true)}
              className="btn-outline !py-2.5 !px-5 text-xs font-semibold flex items-center gap-2 cursor-pointer shrink-0"
            >
              <MessageSquare size={14} />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Rating Summary Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-3xl bg-white border border-blush-200">
            <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-blush-100 pb-4 md:pb-0">
              <div className="font-display text-5xl font-extrabold text-burgundy-900">
                {reviewsData.averageRating}
              </div>
              <div className="flex text-amber-400 my-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} className="fill-amber-400" />
                ))}
              </div>
              <span className="text-xs text-espresso-400">
                Based on {reviewsData.totalReviews || 1} verified customer reviews
              </span>
            </div>

            <div className="md:col-span-2 flex flex-col justify-center space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviewsData.distribution?.[star] || (star === 5 ? reviewsData.totalReviews || 1 : 0);
                const percent = reviewsData.totalReviews > 0 ? (count / reviewsData.totalReviews) * 100 : star === 5 ? 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <span className="w-8 font-medium text-espresso-600">{star} ★</span>
                    <div className="flex-1 h-2 rounded-full bg-cream-200 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-ribbon-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-espresso-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviewsData.reviews?.length === 0 ? (
              <div className="col-span-2 p-8 text-center bg-white rounded-3xl border border-blush-200 text-espresso-400 text-xs">
                No reviews yet. Be the first to share your keepsake story!
              </div>
            ) : (
              reviewsData.reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-6 rounded-3xl bg-white border border-blush-200 space-y-3 shadow-xs"
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

        {/* Recently Viewed Keepsakes */}
        <RecentlyViewed currentProductId={product._id || product.slug} />
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
