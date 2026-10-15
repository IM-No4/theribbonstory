import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Layers,
  Check,
  X,
  RotateCcw,
  Loader2,
  AlertCircle,
  Star,
  Eye,
  Info,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { createPortal } from "react-dom";
import { api, assetUrl } from "../../api/client";
import { useSeo } from "../../utils/seo";
import { useAdminThemeStore } from "../../store/adminThemeStore";

const PRESET_ICONS = ["👤", "💑", "👨‍👩‍👧", "👶", "🐾", "🎓", "🎉", "💍", "👵", "⭐"];

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function AdminKeepsakes() {
  useSeo({ title: "Keepsake Categories & Pricing — Admin", noindex: true });
  const { theme } = useAdminThemeStore();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tagline: "",
    icon: "👤",
    image: "",
    description: "",
    order: 0,
    isActive: true,
    pricingOptions: [],
    engravingSuggestions: [],
  });

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/keepsake-categories/admin");
      if (data?.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load keepsake categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      tagline: "",
      icon: "👤",
      image: "",
      description: "",
      order: (categories.length + 1) * 10,
      isActive: true,
      engravingSuggestions: [],
      pricingOptions: [
        {
          name: "Small Desk",
          dimensions: '3.5" (9 cm)',
          price: 699,
          compareAtPrice: 1199,
          description: "Compact desk & bedside display",
          isPopular: false,
          order: 1,
        },
        {
          name: "Classic Studio",
          dimensions: '5.5" (14 cm)',
          price: 1199,
          compareAtPrice: 1999,
          description: "Most loved • Detailed portrait with display base",
          isPopular: true,
          order: 2,
        },
        {
          name: "Grand Collector",
          dimensions: '7.5" (19 cm)',
          price: 1899,
          compareAtPrice: 2999,
          description: "Collector edition • Maximum detail & presence",
          isPopular: false,
          order: 3,
        },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || "",
      slug: cat.slug || "",
      tagline: cat.tagline || "",
      icon: cat.icon || "👤",
      image: cat.image || "",
      description: cat.description || "",
      order: cat.order ?? 0,
      isActive: cat.isActive !== false,
      engravingSuggestions: cat.engravingSuggestions || [],
      pricingOptions: (cat.pricingOptions || []).map((opt) => ({
        _id: opt._id,
        name: opt.name || "",
        dimensions: opt.dimensions || "",
        price: opt.price ?? 0,
        compareAtPrice: opt.compareAtPrice ?? 0,
        description: opt.description || "",
        isPopular: Boolean(opt.isPopular),
        order: opt.order ?? 0,
      })),
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("photo", file);

    try {
      setUploadingImage(true);
      const { data } = await api.post("/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data?.url) {
        setFormData((prev) => ({ ...prev, image: data.url }));
        toast.success("Thumbnail uploaded successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to upload thumbnail");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddPricingOption = () => {
    setFormData((prev) => ({
      ...prev,
      pricingOptions: [
        ...prev.pricingOptions,
        {
          name: "New Tier",
          dimensions: '6.0" (15 cm)',
          price: 1499,
          compareAtPrice: 2499,
          description: "Display pedestal included",
          isPopular: false,
          order: prev.pricingOptions.length + 1,
        },
      ],
    }));
  };

  const handleRemovePricingOption = (index) => {
    if (formData.pricingOptions.length <= 1) {
      toast.error("A category must have at least one pricing option");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      pricingOptions: prev.pricingOptions.filter((_, i) => i !== index),
    }));
  };

  const handlePricingOptionChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.pricingOptions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, pricingOptions: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    if (!formData.pricingOptions.length) {
      toast.error("Please define at least one pricing option");
      return;
    }

    // Validate that all options have names and valid prices
    for (const opt of formData.pricingOptions) {
      if (!opt.name?.trim()) {
        toast.error("Every pricing tier must have a name");
        return;
      }
      if (!opt.dimensions?.trim()) {
        toast.error(`Please provide dimensions for "${opt.name}"`);
        return;
      }
      if (isNaN(Number(opt.price)) || Number(opt.price) < 0) {
        toast.error(`Invalid selling price for "${opt.name}"`);
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        tagline: formData.tagline.trim(),
        icon: formData.icon.trim(),
        image: (formData.image || "").trim(),
        description: formData.description.trim(),
        order: Number(formData.order) || 0,
        isActive: formData.isActive,
        engravingSuggestions: formData.engravingSuggestions || [],
        pricingOptions: formData.pricingOptions.map((opt, i) => ({
          name: opt.name.trim(),
          dimensions: opt.dimensions.trim(),
          price: Number(opt.price),
          compareAtPrice: Number(opt.compareAtPrice || 0),
          description: (opt.description || "").trim(),
          isPopular: Boolean(opt.isPopular),
          order: i + 1,
        })),
      };

      if (editingCategory) {
        await api.put(`/keepsake-categories/${editingCategory._id}`, payload);
        toast.success(`Updated "${formData.name}" successfully!`);
      } else {
        await api.post("/keepsake-categories", payload);
        toast.success(`Created "${formData.name}" category!`);
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save keepsake category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete "${cat.name}" category?`)) return;

    try {
      await api.delete(`/keepsake-categories/${cat._id}`);
      toast.success(`Deleted category "${cat.name}"`);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete keepsake category");
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      await api.put(`/keepsake-categories/${cat._id}`, {
        isActive: !cat.isActive,
      });
      toast.success(`${cat.name} is now ${!cat.isActive ? "Visible" : "Hidden"} on storefront`);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle category visibility");
    }
  };

  const handleResetDefaults = async () => {
    if (
      !window.confirm(
        "Reset all keepsake categories to recommended defaults (Single, Couple, Family, Kid, Pet)? This replaces current configurations."
      )
    ) {
      return;
    }

    try {
      setResetting(true);
      await api.post("/keepsake-categories/reset-defaults");
      toast.success("Reset to recommended keepsake defaults!");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset defaults");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <Sparkles size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
              3D Keepsake Categories & Pricing
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Configure subject categories (Single, Couple, Family, Kid, Pet) and their dimension specifications & pricing tiers. Whatever you define here immediately updates the customer personalization screen.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleResetDefaults}
            disabled={resetting || loading}
            title="Restore default categories & tiers"
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <RotateCcw size={14} className={resetting ? "animate-spin" : ""} />
            <span>{resetting ? "Resetting…" : "Reset Defaults"}</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="btn-primary py-2 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Quick KPI stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center font-bold">
            <Layers size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Categories</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {categories.length} defined
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center font-bold">
            <Check size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active on Store</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {categories.filter((c) => c.isActive).length} active
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center font-bold">
            <Star size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Pricing Tiers</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {categories.reduce((acc, c) => acc + (c.pricingOptions?.length || 0), 0)} options
            </div>
          </div>
        </div>
      </div>

      {/* Main Categories List */}
      {loading ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Loader2 className="animate-spin text-rose-500 mx-auto mb-3" size={32} />
          <p className="text-xs text-slate-500">Loading keepsake categories…</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <AlertCircle size={40} className="text-amber-500 mx-auto" />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              No Keepsake Categories Found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Initialize with the recommended 3D Keepsake categories (Single, Couple, Family, Kid, Pet) or add your own custom ones.
            </p>
          </div>
          <button
            onClick={handleResetDefaults}
            className="btn-primary py-2 px-5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Load Recommended Categories</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className={`rounded-2xl border transition-all bg-white dark:bg-slate-900 p-5 flex flex-col justify-between ${
                cat.isActive
                  ? "border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-300 dark:hover:border-rose-700"
                  : "border-slate-200/60 dark:border-slate-800/60 opacity-65 bg-slate-50/50 dark:bg-slate-950/40"
              }`}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      {cat.image ? (
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs relative shrink-0">
                          <img
                            src={assetUrl(cat.image)}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0 right-0 text-[10px] px-1 py-0.5 rounded-tl-md bg-black/60 text-white leading-none">
                            {cat.icon || "👤"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800/50 shadow-2xs inline-block">
                          {cat.icon || "👤"}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                          {cat.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          /{cat.slug}
                        </span>
                      </div>
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-0.5">
                        {cat.tagline || "Custom 3D Keepsake"}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggleActive(cat)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition cursor-pointer ${
                        cat.isActive
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {cat.isActive ? "Active" : "Hidden"}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Edit Category & Pricing"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {cat.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
                    {cat.description}
                  </p>
                )}

                {/* Pricing Tiers Table / Cards */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Pricing & Dimension Tiers ({cat.pricingOptions?.length || 0})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(cat.pricingOptions || []).map((opt, idx) => (
                      <div
                        key={opt._id || idx}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              {opt.name}
                            </span>
                            {opt.isPopular && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500 text-white uppercase tracking-wider shadow-2xs">
                                Most Loved
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                            📐 {opt.dimensions}
                          </div>
                          {opt.description && (
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {opt.description}
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                            {formatPrice(opt.price)}
                          </div>
                          {opt.compareAtPrice > opt.price && (
                            <div className="text-[10px] text-slate-400 line-through">
                              {formatPrice(opt.compareAtPrice)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Display Order: #{cat.order}</span>
                <button
                  onClick={() => handleOpenEditModal(cat)}
                  className="font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 size={11} />
                  <span>Configure Tiers</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category & Pricing Options Modal — Portaled to document.body */}
      {isModalOpen && createPortal(
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 ${theme === "dark" ? "dark" : ""}`}>
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header — Fixed at Top */}
            <div className="p-4 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800/60">
                  {formData.icon || (editingCategory ? "✏️" : "✨")}
                </span>
                <div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {editingCategory ? `Edit "${editingCategory.name}" Keepsake Category` : "Add New Keepsake Category"}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Define category metadata on the left and dimension/pricing tiers on the right.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body — Scrollable 2-Column Grid */}
            <form onSubmit={handleSubmit} id="keepsake-category-form" className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                
                {/* LEFT COLUMN: Category Basics (5 of 12 cols on desktop) */}
                <div className="lg:col-span-5 space-y-4 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/60 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Category Information
                    </span>
                    <span className="text-[10.5px] font-mono text-rose-600 dark:text-rose-400 font-semibold">
                      Step 1
                    </span>
                  </div>

                  {/* Name and Slug */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Category Name * <span className="font-normal text-slate-400">(e.g. Single, Couple, Family, Pet)</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Couple"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Slug / URL Key <span className="font-normal text-slate-400">(auto-derived if blank)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="e.g. couple"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Emoji / Icon Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Category Icon / Emoji
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="w-14 text-center text-lg py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                      />
                      <div className="flex items-center gap-1 overflow-x-auto py-1 flex-1">
                        {PRESET_ICONS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setFormData({ ...formData, icon: emoji })}
                            className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition cursor-pointer shrink-0 ${
                              formData.icon === emoji
                                ? "bg-rose-500 text-white shadow-xs"
                                : "bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Image Upload */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Category Thumbnail Image
                      </label>
                      {formData.image && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                          className="text-[10.5px] text-red-500 hover:text-red-600 font-semibold cursor-pointer"
                        >
                          Clear image
                        </button>
                      )}
                    </div>

                    <div className="flex items-start gap-3">
                      {/* Preview Box */}
                      <div className="relative w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                        {formData.image ? (
                          <img
                            src={assetUrl(formData.image)}
                            alt="Category Thumbnail Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-2 text-slate-400">
                            <ImageIcon size={20} className="mx-auto mb-1 opacity-50" />
                            <span className="text-[9px] block leading-tight">No image</span>
                          </div>
                        )}
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                            <Loader2 size={18} className="animate-spin text-white" />
                          </div>
                        )}
                      </div>

                      {/* Upload Controls */}
                      <div className="flex-1 space-y-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-rose-300 hover:text-rose-600 transition shadow-2xs cursor-pointer">
                          <Upload size={13} />
                          <span>{uploadingImage ? "Uploading..." : "Upload Thumbnail"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingImage}
                            onChange={handleImageUpload}
                          />
                        </label>
                        <input
                          type="text"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          placeholder="Or paste image URL (e.g. /images/...)"
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-[11px] font-mono focus:ring-1 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                        />
                        <p className="text-[10px] text-slate-400 leading-tight">
                          Appears on the homepage Keepsake Atelier cards and customer selector.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tagline */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Customer Tagline
                    </label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="e.g. Anniversaries & couples"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Description & Guidance
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g. Two figures sculpted together in harmony on an elegant display base."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none resize-none"
                    />
                  </div>

                  {/* Visibility & Display Order */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                      />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Visible on Storefront
                      </span>
                    </label>

                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-500 text-[11px]">Order:</span>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                        className="w-14 px-2 py-1 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Dimension Specs & Pricing Tiers (7 of 12 cols on desktop) */}
                <div className="lg:col-span-7 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                          Dimension Specs & Pricing Tiers
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
                          {formData.pricingOptions.length} Tiers
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Define 2, 3 or more sizes & prices for {formData.name || "this category"}.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddPricingOption}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Add Tier</span>
                    </button>
                  </div>

                  {/* Pricing Tiers Cards */}
                  <div className="space-y-3">
                    {formData.pricingOptions.map((opt, index) => (
                      <div
                        key={index}
                        className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/60 shadow-xs space-y-2.5 hover:border-slate-300 dark:hover:border-slate-600 transition"
                      >
                        {/* Tier Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold font-mono">
                              {index + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {opt.name || `Tier #${index + 1}`}
                            </span>
                            {opt.dimensions && (
                              <span className="text-[10.5px] font-semibold text-rose-600 dark:text-rose-400">
                                ({opt.dimensions})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={Boolean(opt.isPopular)}
                                onChange={(e) =>
                                  handlePricingOptionChange(index, "isPopular", e.target.checked)
                                }
                                className="w-3.5 h-3.5 text-rose-600 rounded"
                              />
                              <span className="font-medium">⭐ Most Loved</span>
                            </label>

                            {formData.pricingOptions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePricingOption(index)}
                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg p-1 transition cursor-pointer"
                                title="Remove Tier"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Fields Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                              Tier Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Classic Studio"
                              value={opt.name}
                              onChange={(e) =>
                                handlePricingOptionChange(index, "name", e.target.value)
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                            />
                          </div>

                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                              Dimensions Specs *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder='e.g. 5.5" (14 cm)'
                              value={opt.dimensions}
                              onChange={(e) =>
                                handlePricingOptionChange(index, "dimensions", e.target.value)
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                              Selling Price (₹) *
                            </label>
                            <input
                              type="number"
                              required
                              min="0"
                              placeholder="e.g. 1199"
                              value={opt.price}
                              onChange={(e) =>
                                handlePricingOptionChange(index, "price", e.target.value)
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                              Compare / MRP (₹)
                            </label>
                            <input
                              type="number"
                              min="0"
                              placeholder="e.g. 1999"
                              value={opt.compareAtPrice}
                              onChange={(e) =>
                                handlePricingOptionChange(index, "compareAtPrice", e.target.value)
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                            Tier Details & Specs Note (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Most loved • Living room & display shelf"
                            value={opt.description}
                            onChange={(e) =>
                              handlePricingOptionChange(index, "description", e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </form>

            {/* Modal Footer — Fixed at Bottom with Summary */}
            <div className="p-3.5 sm:px-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/90 dark:bg-slate-950/70">
              <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                <span>Category: </span>
                <strong className="text-slate-800 dark:text-slate-200">
                  {formData.name ? `${formData.icon || ""} ${formData.name}` : "Untitled"}
                </strong>
                <span className="mx-1.5">•</span>
                <span>{formData.pricingOptions.length} pricing option{formData.pricingOptions.length !== 1 ? "s" : ""} configured</span>
              </div>

              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="keepsake-category-form"
                  disabled={submitting}
                  className="btn-primary py-2 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingCategory ? "Save Changes" : "Create Category"}</span>
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
