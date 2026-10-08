import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
  Check,
  Package,
  Download,
} from "lucide-react";
import PrintFilePanel from "../../components/admin/PrintFilePanel";
import { blobErrorMessage, downloadPrintFile } from "../../utils/printFiles";
import { toast } from "react-hot-toast";
import { api, assetUrl } from "../../api/client";

const OCCASIONS_LIST = [
  "birthday",
  "anniversary",
  "wedding",
  "valentines-day",
  "couples",
  "pets",
  "family",
  "friendship",
  "housewarming",
  "thank-you",
  "just-because",
];

export default function AdminProducts() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    tagline: "",
    description: "",
    price: "",
    compareAtPrice: "",
    images: [""],
    isCustomizable: true,
    customizationPrompt: "Upload your favourite photo",
    optionGroups: [],
    occasions: [],
    tags: "",
    stock: 100,
    isFeatured: false,
    isBestseller: false,
    isActive: true,
  });

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get("/categories");
      setCategories(data.categories || []);
      if (data.categories?.length > 0) {
        // Default the form's category only if none is chosen yet
        setFormData((prev) => (prev.category ? prev : { ...prev, category: data.categories[0].slug }));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products/admin/all", {
        params: {
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          search: search || undefined,
        },
      });
      setProducts(data.products || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openAddModal = useCallback(() => {
    setEditingProduct(null);
    setFormData({
      name: "",
      slug: "",
      category: categories[0]?.slug || "photo-magnets",
      tagline: "",
      description: "",
      price: "",
      compareAtPrice: "",
      images: ["/src/assets/images/photo-magnet.jpeg"],
      isCustomizable: true,
      customizationPrompt: "Upload your favourite photo and add custom note",
      optionGroups: [
        {
          name: "Size",
          values: [
            { label: "3 x 3 in (Standard)", priceDelta: 0 },
            { label: "4 x 4 in (Large)", priceDelta: 100 },
          ],
        },
      ],
      occasions: ["birthday", "anniversary"],
      tags: "personalized, keepsake",
      stock: 100,
      isFeatured: false,
      isBestseller: false,
      isActive: true,
    });
    setIsModalOpen(true);
  }, [categories]);

  useEffect(() => {
    if (params.get("action") === "new") {
      openAddModal();
      setParams({});
    }
  }, [params, setParams, openAddModal]);

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      category: product.category,
      tagline: product.tagline || "",
      description: product.description || "",
      price: product.price,
      compareAtPrice: product.compareAtPrice || "",
      images: product.images?.length > 0 ? product.images : [""],
      isCustomizable: Boolean(product.isCustomizable),
      customizationPrompt: product.customizationPrompt || "Upload your favourite photo",
      optionGroups: product.optionGroups || [],
      occasions: product.occasions || [],
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
      stock: product.stock !== undefined ? product.stock : 100,
      isFeatured: Boolean(product.isFeatured),
      isBestseller: Boolean(product.isBestseller),
      isActive: product.isActive !== undefined ? product.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleSlugGenerate = () => {
    if (!formData.name) return;
    const generated = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData((prev) => ({ ...prev, slug: generated }));
  };

  const handleImageUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("image", file);

    setUploadingImage(true);
    try {
      const { data } = await api.post("/upload", form);
      const updated = [...formData.images];
      updated[index] = data.url;
      setFormData((prev) => ({ ...prev, images: updated }));
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const handleRemoveImageField = (idx) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  // Option Groups Builder
  const handleAddOptionGroup = () => {
    setFormData((prev) => ({
      ...prev,
      optionGroups: [
        ...prev.optionGroups,
        { name: "Option Group", values: [{ label: "Standard", priceDelta: 0 }] },
      ],
    }));
  };

  const handleRemoveOptionGroup = (groupIndex) => {
    setFormData((prev) => ({
      ...prev,
      optionGroups: prev.optionGroups.filter((_, i) => i !== groupIndex),
    }));
  };

  const handleOptionGroupNameChange = (groupIndex, name) => {
    const updated = [...formData.optionGroups];
    updated[groupIndex].name = name;
    setFormData((prev) => ({ ...prev, optionGroups: updated }));
  };

  const handleAddOptionValue = (groupIndex) => {
    const updated = [...formData.optionGroups];
    updated[groupIndex].values.push({ label: "New Option", priceDelta: 0 });
    setFormData((prev) => ({ ...prev, optionGroups: updated }));
  };

  const handleRemoveOptionValue = (groupIndex, valIndex) => {
    const updated = [...formData.optionGroups];
    updated[groupIndex].values = updated[groupIndex].values.filter((_, i) => i !== valIndex);
    setFormData((prev) => ({ ...prev, optionGroups: updated }));
  };

  const handleOptionValueChange = (groupIndex, valIndex, field, value) => {
    const updated = [...formData.optionGroups];
    updated[groupIndex].values[valIndex][field] = field === "priceDelta" ? Number(value) : value;
    setFormData((prev) => ({ ...prev, optionGroups: updated }));
  };

  const toggleOccasion = (occ) => {
    const exists = formData.occasions.includes(occ);
    setFormData((prev) => ({
      ...prev,
      occasions: exists ? prev.occasions.filter((o) => o !== occ) : [...prev.occasions, occ],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      toast.error("Please fill in Product Name, Price, and Category.");
      return;
    }

    setSubmitting(true);
    const payload = {
      ...formData,
      price: Number(formData.price),
      compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
      stock: Number(formData.stock),
      tags: formData.tags
        ? formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      images: formData.images.filter((img) => img && img.trim().length > 0),
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        toast.success("Product updated successfully!");
      } else {
        await api.post("/products", payload);
        toast.success("Product created successfully!");
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    try {
      await api.delete(`/products/${product._id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Products & Pricing
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Add new products, adjust real-time pricing, configure option add-ons & stock.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-ribbon-700 hover:from-rose-500 hover:to-ribbon-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 transition cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search by title, slug, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 whitespace-nowrap">Filter Collection:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-hidden focus:border-rose-500 w-full sm:w-auto"
          >
            <option value="all">All Collections ({products.length})</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-900/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Package size={36} className="mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-white">No products found</p>
            <p className="text-xs mt-1">Try adjusting search query or add a new product.</p>
            <button
              onClick={openAddModal}
              className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold inline-flex items-center gap-2"
            >
              <Plus size={14} /> Add Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Collection</th>
                  <th className="py-3.5 px-4">Selling Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Badges</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {products.map((prod) => {
                  const cat = categories.find((c) => c.slug === prod.category);
                  const img = prod.images?.[0] || "/src/assets/images/photo-magnet.jpeg";
                  return (
                    <tr key={prod._id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={assetUrl(img)}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-900 shrink-0"
                            onError={(e) => {
                              e.target.src = "/src/assets/images/photo-magnet.jpeg";
                            }}
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-white truncate max-w-xs">{prod.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs">
                              /product/{prod.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-rose-300 font-medium text-[11px]">
                          {cat?.name || prod.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-sm">₹{prod.price}</div>
                        {prod.compareAtPrice && (
                          <div className="text-[11px] text-slate-500 line-through">
                            ₹{prod.compareAtPrice}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold ${
                            prod.stock <= 10 ? "text-rose-400" : "text-slate-300"
                          }`}
                        >
                          {prod.stock} in stock
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {prod.isFeatured && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800/40 uppercase">
                              Featured
                            </span>
                          )}
                          {prod.isBestseller && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-950 text-rose-300 border border-rose-800/40 uppercase">
                              Bestseller
                            </span>
                          )}
                          {prod.isCustomizable && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-800/40 uppercase">
                              Customizable
                            </span>
                          )}
                          {prod.printFile && (
                            <span
                              className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/40 uppercase"
                              title={prod.printFile.originalName}
                            >
                              STL attached
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {prod.printFile && (
                            <button
                              onClick={() =>
                                downloadPrintFile(prod._id, prod.printFile.originalName).catch(async (err) =>
                                  toast.error(await blobErrorMessage(err, "Could not download print file"))
                                )
                              }
                              className="p-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-900/40 transition cursor-pointer"
                              title={`Download print file (${prod.printFile.originalName})`}
                            >
                              <Download size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
                            title="Edit Product & Pricing"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(prod)}
                            className="p-2 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 hover:text-rose-300 border border-rose-900/40 transition cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl shadow-black/80 my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-950 z-10 rounded-t-3xl">
              <div>
                <h3 className="font-display font-bold text-xl text-white">
                  {editingProduct ? `Edit: ${editingProduct.name}` : "Create New Dynamic Product"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure real-time pricing, image gallery, customization prompts & collections.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onBlur={handleSlugGenerate}
                    placeholder="e.g. 3D Couple Miniature Keepsake"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. 3d-couple-keepsake"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-hidden focus:border-rose-500 text-xs"
                  />
                </div>
              </div>

              {/* Category & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Collection / Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-rose-500 text-xs"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.slug}>
                        {cat.name} ({cat.slug})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Tagline / Short Summary
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="e.g. Turn your love story into a physical 3D sculpt"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 text-xs"
                  />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 599"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Compare-at Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    placeholder="e.g. 799"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-400 line-through text-sm focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="100"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed product story, craftsmanship, dimensions, and unboxing details..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 text-xs"
                />
              </div>

              {/* Image Manager */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
                      Product Images Gallery
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Upload photos directly or enter image paths/URLs
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImageField}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus size={13} /> Add Photo
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                        {img ? (
                          <img
                            src={assetUrl(img)}
                            alt="preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "/src/assets/images/photo-magnet.jpeg";
                            }}
                          />
                        ) : (
                          <ImageIcon size={16} className="text-slate-600" />
                        )}
                      </div>

                      <input
                        type="text"
                        value={img}
                        onChange={(e) => {
                          const updated = [...formData.images];
                          updated[idx] = e.target.value;
                          setFormData({ ...formData, images: updated });
                        }}
                        placeholder="Image URL or uploaded path..."
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-rose-500 font-mono"
                      />

                      <label className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer flex items-center gap-1 shrink-0">
                        <Upload size={13} />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, idx)}
                        />
                      </label>

                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImageField(idx)}
                          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Customization Settings */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
                    Customer Photo & Text Customization
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isCustomizable}
                      onChange={(e) =>
                        setFormData({ ...formData, isCustomizable: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>

                {formData.isCustomizable && (
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">
                      Customization Instructions Prompt
                    </label>
                    <input
                      type="text"
                      value={formData.customizationPrompt}
                      onChange={(e) =>
                        setFormData({ ...formData, customizationPrompt: e.target.value })
                      }
                      placeholder="e.g. Upload your favourite couple photo and pick sculpting finish"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Option Groups & Variants Price Deltas */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
                      Product Options & Price Add-ons
                    </span>
                    <p className="text-[11px] text-slate-400">
                      e.g., Size (Large +₹100), 3D Sculpt Style (Chibi +₹50)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddOptionGroup}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus size={13} /> Add Option Group
                  </button>
                </div>

                {formData.optionGroups.map((group, gIdx) => (
                  <div key={gIdx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={group.name}
                        onChange={(e) => handleOptionGroupNameChange(gIdx, e.target.value)}
                        placeholder="Option Name (e.g. Size)"
                        className="font-bold text-white bg-transparent border-b border-slate-700 focus:border-rose-500 px-1 py-0.5 text-xs focus:outline-hidden"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddOptionValue(gIdx)}
                          className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
                        >
                          + Add Choice
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionGroup(gIdx)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 pl-2 border-l-2 border-slate-800">
                      {group.values.map((val, vIdx) => (
                        <div key={vIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={val.label}
                            onChange={(e) =>
                              handleOptionValueChange(gIdx, vIdx, "label", e.target.value)
                            }
                            placeholder="Choice Label (e.g. 4 x 4 in Large)"
                            className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                          />
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 text-xs">+₹</span>
                            <input
                              type="number"
                              value={val.priceDelta}
                              onChange={(e) =>
                                handleOptionValueChange(gIdx, vIdx, "priceDelta", e.target.value)
                              }
                              placeholder="0"
                              className="w-20 px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs"
                            />
                          </div>
                          {group.values.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOptionValue(gIdx, vIdx)}
                              className="text-slate-500 hover:text-rose-400"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Occasions & Tags */}
              <div className="space-y-3">
                <label className="block text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                  Target Occasions
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {OCCASIONS_LIST.map((occ) => {
                    const active = formData.occasions.includes(occ);
                    return (
                      <button
                        type="button"
                        key={occ}
                        onClick={() => toggleOccasion(occ)}
                        className={`px-3 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
                          active
                            ? "bg-rose-600 text-white font-semibold"
                            : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                        }`}
                      >
                        {occ}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g. bestseller, acrylic, gift, express"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs"
                  />
                </div>
              </div>

              {/* Badges / Status Toggles */}
              <div className="flex flex-wrap gap-6 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded-md border-slate-700 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Show as Featured Item</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isBestseller}
                    onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                    className="rounded-md border-slate-700 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Bestseller Tag</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded-md border-slate-700 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Active & Listed in Store</span>
                </label>
              </div>

              {/* Production print file (admin only) */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                  3D Print File (STL)
                </label>
                <PrintFilePanel
                  productId={editingProduct?._id}
                  printFile={editingProduct?.printFile}
                  onChange={(printFile) => {
                    setEditingProduct((prev) => (prev ? { ...prev, printFile } : prev));
                    setProducts((prev) =>
                      prev.map((p) => (p._id === editingProduct?._id ? { ...p, printFile } : p))
                    );
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-950 py-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-ribbon-700 hover:from-rose-500 hover:to-ribbon-600 text-white font-semibold flex items-center gap-2 shadow-lg shadow-rose-950/50 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check size={16} />
                      <span>{editingProduct ? "Save Changes" : "Create Product"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
