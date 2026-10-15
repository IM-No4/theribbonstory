import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  Upload,
  X,
  Check,
  Image as ImageIcon,
  Package,
  Search,
  MinusCircle,
  PlusCircle,
  ShoppingBag,
  Loader2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api, assetUrl } from "../../api/client";

export default function AdminCollections() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit / Add Collection Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State for Collection
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    badge: "",
    order: 0,
    isFeatured: true,
    isActive: true,
  });

  // Manage Products Modal / Drawer State
  const [managingCategory, setManagingCategory] = useState(null);
  const [collectionProducts, setCollectionProducts] = useState([]);
  const [allCatalogProducts, setAllCatalogProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productTab, setProductTab] = useState("assigned"); // "assigned" | "add_existing" | "create_new"
  const [assignedSearch, setAssignedSearch] = useState("");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState("all");
  const [selectedCatalogIds, setSelectedCatalogIds] = useState([]);
  const [selectedAssignedIds, setSelectedAssignedIds] = useState([]);
  const [reassignTargetCategory, setReassignTargetCategory] = useState("general");
  const [submittingAction, setSubmittingAction] = useState(false);

  // Quick Create Product Form State
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    price: "",
    compareAtPrice: "",
    stock: 100,
    tagline: "",
    description: "",
    image: "/images/photo-magnet.webp",
    isCustomizable: false,
    isActive: true,
  });
  const [uploadingNewProdImage, setUploadingNewProdImage] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/categories/admin/all");
      setCategories(data.categories || []);
    } catch {
      toast.error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = useCallback(() => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "/images/photo-magnet.webp",
      badge: "Trending",
      order: categories.length + 1,
      isFeatured: true,
      isActive: true,
    });
    setIsModalOpen(true);
  }, [categories.length]);

  useEffect(() => {
    if (params.get("action") === "new") {
      openAddModal();
      setParams({});
    }
  }, [params, setParams, openAddModal]);

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || "",
      badge: cat.badge || "",
      order: cat.order || 0,
      isFeatured: Boolean(cat.isFeatured),
      isActive: cat.isActive !== undefined ? cat.isActive : true,
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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("image", file);

    setUploadingImage(true);
    try {
      const { data } = await api.post("/upload", form);
      setFormData((prev) => ({ ...prev, image: data.url }));
      toast.success("Collection banner uploaded successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Collection name is required");
      return;
    }

    setSubmitting(true);
    const payload = {
      ...formData,
      order: Number(formData.order) || 0,
    };

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, payload);
        toast.success("Collection updated successfully!");
      } else {
        await api.post("/categories", payload);
        toast.success("Collection created successfully!");
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save collection");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (
      !window.confirm(
        `Are you sure you want to delete collection "${cat.name}"? (${cat.productCount || 0} products currently belong to this collection)`
      )
    )
      return;

    try {
      await api.delete(`/categories/${cat._id}`);
      toast.success("Collection deleted");
      fetchCategories();
    } catch {
      toast.error("Failed to delete collection");
    }
  };

  // ---------------------------------------------------------------------------
  // MANAGE PRODUCTS IN COLLECTION LOGIC
  // ---------------------------------------------------------------------------
  const openManageProducts = async (cat) => {
    setManagingCategory(cat);
    setProductTab("assigned");
    setSelectedCatalogIds([]);
    setSelectedAssignedIds([]);
    setAssignedSearch("");
    setCatalogSearch("");
    setLoadingProducts(true);

    try {
      // 1. Fetch products assigned to this collection
      const [colRes, catalogRes] = await Promise.all([
        api.get(`/categories/${cat._id}/products`),
        api.get("/products/admin/all"),
      ]);

      setCollectionProducts(colRes.data.products || []);
      setAllCatalogProducts(catalogRes.data.products || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load collection products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const refreshManagingProducts = async (catId) => {
    try {
      const [colRes, catalogRes] = await Promise.all([
        api.get(`/categories/${catId}/products`),
        api.get("/products/admin/all"),
      ]);
      const updatedProducts = colRes.data.products || [];
      setCollectionProducts(updatedProducts);
      setAllCatalogProducts(catalogRes.data.products || []);

      // Also update the category's product count in the main table list
      setCategories((prev) =>
        prev.map((c) =>
          c._id === catId ? { ...c, productCount: updatedProducts.length } : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignProducts = async (productIds) => {
    if (!productIds || productIds.length === 0) return;
    setSubmittingAction(true);
    try {
      const { data } = await api.post(`/categories/${managingCategory._id}/products/assign`, {
        productIds,
      });
      toast.success(data.message || "Product(s) added to collection!");
      setSelectedCatalogIds([]);
      await refreshManagingProducts(managingCategory._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign products");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRemoveProducts = async (productIds) => {
    if (!productIds || productIds.length === 0) return;
    setSubmittingAction(true);
    try {
      const { data } = await api.post(`/categories/${managingCategory._id}/products/remove`, {
        productIds,
        targetCategory: reassignTargetCategory,
      });
      toast.success(data.message || "Product(s) removed from collection!");
      setSelectedAssignedIds([]);
      await refreshManagingProducts(managingCategory._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove products");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleQuickCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.price) {
      toast.error("Product name and price are required");
      return;
    }

    setSubmittingAction(true);
    try {
      const payload = {
        name: newProductForm.name,
        category: managingCategory.slug,
        price: Number(newProductForm.price),
        compareAtPrice: newProductForm.compareAtPrice ? Number(newProductForm.compareAtPrice) : undefined,
        stock: Number(newProductForm.stock) || 100,
        tagline: newProductForm.tagline || "",
        description: newProductForm.description || "",
        images: [newProductForm.image || "/images/photo-magnet.webp"],
        isCustomizable: Boolean(newProductForm.isCustomizable),
        isActive: Boolean(newProductForm.isActive),
      };

      await api.post("/products", payload);
      toast.success(`Created "${newProductForm.name}" directly in this collection!`);

      // Reset form
      setNewProductForm({
        name: "",
        price: "",
        compareAtPrice: "",
        stock: 100,
        tagline: "",
        description: "",
        image: "/images/photo-magnet.webp",
        isCustomizable: false,
        isActive: true,
      });

      // Switch to assigned tab & refresh
      setProductTab("assigned");
      await refreshManagingProducts(managingCategory._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create product");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleQuickUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("image", file);

    setUploadingNewProdImage(true);
    try {
      const { data } = await api.post("/upload", form);
      setNewProductForm((prev) => ({ ...prev, image: data.url }));
      toast.success("Product image uploaded successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploadingNewProdImage(false);
    }
  };

  // Filtered lists for manager modal
  const filteredAssignedProducts = collectionProducts.filter((p) => {
    if (!assignedSearch) return true;
    const q = assignedSearch.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q) ||
      p.tagline?.toLowerCase().includes(q)
    );
  });

  const availableCatalogProducts = allCatalogProducts.filter((p) => {
    // Only products not already in this collection
    if (p.category === managingCategory?.slug) return false;
    if (catalogCategoryFilter !== "all" && p.category !== catalogCategoryFilter) return false;
    if (!catalogSearch) return true;
    const q = catalogSearch.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Dynamic Collections
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create, reorder, and directly assign products to custom collections displayed throughout the store.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-ribbon-700 hover:from-rose-500 hover:to-ribbon-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 transition cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Collection</span>
        </button>
      </div>

      {/* Collections Grid */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-900/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Layers size={36} className="mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-white">No collections found</p>
            <button
              onClick={openAddModal}
              className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold inline-flex items-center gap-2"
            >
              <Plus size={14} /> Add Collection
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Collection</th>
                  <th className="py-3.5 px-4">Slug Identifier</th>
                  <th className="py-3.5 px-4">Products</th>
                  <th className="py-3.5 px-4">Badge / Highlight</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-rose-400">
                      #{cat.order || 0}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={assetUrl(cat.image || "/images/photo-magnet.webp")}
                          alt={cat.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-900 shrink-0"
                          onError={(e) => {
                            e.target.src = "/images/photo-magnet.webp";
                          }}
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate max-w-xs">{cat.name}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {cat.description || "No description set"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{cat.slug}</td>
                    <td className="py-3 px-4">
                      {/* Clickable pill to manage products directly */}
                      <button
                        onClick={() => openManageProducts(cat)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-500/40 text-rose-300 hover:text-rose-200 font-semibold text-[11px] inline-flex items-center gap-1.5 transition cursor-pointer group"
                        title="Click to manage products in this collection"
                      >
                        <Package size={13} className="text-rose-400 group-hover:scale-110 transition-transform" />
                        <span>{cat.productCount || 0} products</span>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      {cat.badge ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800/40 uppercase tracking-wider">
                          {cat.badge}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          cat.isActive !== false
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {cat.isActive !== false ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
                          title="Edit Collection Settings"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-2 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 hover:text-rose-300 border border-rose-900/40 transition cursor-pointer"
                          title="Delete Collection"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          MANAGE PRODUCTS MODAL / DRAWER
         ========================================================================= */}
      {managingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-4xl flex flex-col shadow-2xl shadow-black/90 my-auto max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start sm:items-center justify-between gap-4 bg-slate-900/40">
              <div className="flex items-center gap-3.5">
                <img
                  src={assetUrl(managingCategory.image || "/images/photo-magnet.webp")}
                  alt={managingCategory.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-900 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-lg sm:text-xl text-white">
                      {managingCategory.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {managingCategory.slug}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage which products appear in this collection. Add existing products, remove items, or create new ones directly.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setManagingCategory(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 border-b border-slate-800 flex items-center gap-2 bg-slate-900/20 text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setProductTab("assigned")}
                className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  productTab === "assigned"
                    ? "border-rose-500 text-white font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Package size={15} />
                <span>In This Collection</span>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] bg-rose-950 text-rose-300 border border-rose-800/40">
                  {collectionProducts.length}
                </span>
              </button>

              <button
                onClick={() => setProductTab("add_existing")}
                className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  productTab === "add_existing"
                    ? "border-rose-500 text-white font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <PlusCircle size={15} />
                <span>+ Add Existing Products</span>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] bg-slate-800 text-slate-300">
                  {availableCatalogProducts.length}
                </span>
              </button>

              <button
                onClick={() => setProductTab("create_new")}
                className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  productTab === "create_new"
                    ? "border-rose-500 text-white font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Plus size={15} />
                <span>+ Create New Product</span>
              </button>
            </div>

            {/* Modal Body / Tab Content */}
            <div className="p-6 overflow-y-auto flex-1 min-h-[350px]">
              {loadingProducts ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                  <Loader2 size={32} className="animate-spin text-rose-500" />
                  <p className="text-xs">Loading collection products...</p>
                </div>
              ) : (
                <>
                  {/* =========================================================
                      TAB 1: ASSIGNED PRODUCTS
                     ========================================================= */}
                  {productTab === "assigned" && (
                    <div className="space-y-4">
                      {/* Search & Bulk Bar */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2">
                        <div className="relative flex-1 max-w-sm">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Filter products in this collection..."
                            value={assignedSearch}
                            onChange={(e) => setAssignedSearch(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500"
                          />
                        </div>

                        {/* Bulk Action Controls */}
                        {selectedAssignedIds.length > 0 && (
                          <div className="flex items-center gap-2 bg-rose-950/30 border border-rose-900/40 p-1.5 px-3 rounded-xl text-xs">
                            <span className="font-semibold text-rose-300">
                              {selectedAssignedIds.length} selected
                            </span>
                            <span className="text-slate-600">|</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-400">Move to:</span>
                              <select
                                value={reassignTargetCategory}
                                onChange={(e) => setReassignTargetCategory(e.target.value)}
                                className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200"
                              >
                                <option value="general">General (Uncategorized)</option>
                                {categories
                                  .filter((c) => c.slug !== managingCategory.slug)
                                  .map((c) => (
                                    <option key={c._id} value={c.slug}>
                                      {c.name}
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <button
                              onClick={() => handleRemoveProducts(selectedAssignedIds)}
                              disabled={submittingAction}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                            >
                              <MinusCircle size={12} />
                              <span>Remove</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Products Table */}
                      {filteredAssignedProducts.length === 0 ? (
                        <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl text-slate-400 space-y-3">
                          <Package size={36} className="mx-auto text-slate-600" />
                          <div>
                            <p className="font-semibold text-white">No products currently in this collection</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {assignedSearch
                                ? "No products match your filter search."
                                : "Add existing products from your store catalog or create new ones below."}
                            </p>
                          </div>
                          {!assignedSearch && (
                            <button
                              onClick={() => setProductTab("add_existing")}
                              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition cursor-pointer"
                            >
                              <PlusCircle size={14} />
                              <span>Browse Store Catalog to Add</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="border border-slate-800 rounded-xl overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                              <tr>
                                <th className="py-2.5 px-3 w-8">
                                  <input
                                    type="checkbox"
                                    checked={
                                      selectedAssignedIds.length === filteredAssignedProducts.length &&
                                      filteredAssignedProducts.length > 0
                                    }
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedAssignedIds(filteredAssignedProducts.map((p) => p._id));
                                      } else {
                                        setSelectedAssignedIds([]);
                                      }
                                    }}
                                    className="rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                                  />
                                </th>
                                <th className="py-2.5 px-3">Product</th>
                                <th className="py-2.5 px-3">Price</th>
                                <th className="py-2.5 px-3">Stock</th>
                                <th className="py-2.5 px-3">Status</th>
                                <th className="py-2.5 px-3 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-slate-300">
                              {filteredAssignedProducts.map((prod) => {
                                const isChecked = selectedAssignedIds.includes(prod._id);
                                return (
                                  <tr
                                    key={prod._id}
                                    className={`hover:bg-slate-900/50 transition ${
                                      isChecked ? "bg-rose-950/20" : ""
                                    }`}
                                  >
                                    <td className="py-2.5 px-3">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedAssignedIds((prev) => [...prev, prod._id]);
                                          } else {
                                            setSelectedAssignedIds((prev) => prev.filter((id) => id !== prod._id));
                                          }
                                        }}
                                        className="rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                                      />
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={assetUrl(prod.images?.[0] || "/images/photo-magnet.webp")}
                                          alt={prod.name}
                                          className="w-10 h-10 rounded-lg object-cover border border-slate-800 bg-slate-900 shrink-0"
                                        />
                                        <div className="min-w-0">
                                          <div className="font-semibold text-white truncate max-w-xs">
                                            {prod.name}
                                          </div>
                                          <div className="text-[10.5px] text-slate-400 font-mono truncate">
                                            /{prod.slug}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3 font-semibold text-white">
                                      ₹{prod.price}
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <span
                                        className={`font-mono text-[11px] ${
                                          prod.stock <= 5 ? "text-amber-400 font-bold" : "text-slate-400"
                                        }`}
                                      >
                                        {prod.stock || 0} in stock
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase ${
                                          prod.isActive !== false
                                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                                            : "bg-slate-800 text-slate-400"
                                        }`}
                                      >
                                        {prod.isActive !== false ? "Active" : "Hidden"}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      <button
                                        onClick={() => handleRemoveProducts([prod._id])}
                                        disabled={submittingAction}
                                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-800/50 transition cursor-pointer text-[11px] font-semibold inline-flex items-center gap-1"
                                        title="Remove from this collection"
                                      >
                                        <MinusCircle size={12} className="text-rose-400" />
                                        <span>Remove</span>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* =========================================================
                      TAB 2: ADD EXISTING PRODUCTS FROM CATALOG
                     ========================================================= */}
                  {productTab === "add_existing" && (
                    <div className="space-y-4">
                      {/* Search & Category Filter */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-1">
                        <div className="flex flex-1 items-center gap-2">
                          <div className="relative flex-1 max-w-sm">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search catalog products..."
                              value={catalogSearch}
                              onChange={(e) => setCatalogSearch(e.target.value)}
                              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500"
                            />
                          </div>

                          <select
                            value={catalogCategoryFilter}
                            onChange={(e) => setCatalogCategoryFilter(e.target.value)}
                            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300"
                          >
                            <option value="all">All Other Collections</option>
                            {categories
                              .filter((c) => c.slug !== managingCategory.slug)
                              .map((c) => (
                                <option key={c._id} value={c.slug}>
                                  From: {c.name}
                                </option>
                              ))}
                          </select>
                        </div>

                        {/* Bulk Add Button */}
                        {selectedCatalogIds.length > 0 && (
                          <button
                            onClick={() => handleAssignProducts(selectedCatalogIds)}
                            disabled={submittingAction}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-ribbon-700 hover:from-rose-500 hover:to-ribbon-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition cursor-pointer shrink-0"
                          >
                            <PlusCircle size={14} />
                            <span>Add Selected ({selectedCatalogIds.length}) to Collection</span>
                          </button>
                        )}
                      </div>

                      {/* Available Catalog Products Table */}
                      {availableCatalogProducts.length === 0 ? (
                        <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl text-slate-400 space-y-2">
                          <AlertCircle size={32} className="mx-auto text-slate-600" />
                          <p className="font-semibold text-white">No available products found</p>
                          <p className="text-xs text-slate-500">
                            {catalogSearch || catalogCategoryFilter !== "all"
                              ? "Try adjusting your search query or collection filter."
                              : "All catalog products are already assigned to this collection!"}
                          </p>
                        </div>
                      ) : (
                        <div className="border border-slate-800 rounded-xl overflow-hidden max-h-[460px] overflow-y-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold sticky top-0 z-10 backdrop-blur-md">
                              <tr>
                                <th className="py-2.5 px-3 w-8">
                                  <input
                                    type="checkbox"
                                    checked={
                                      selectedCatalogIds.length === availableCatalogProducts.length &&
                                      availableCatalogProducts.length > 0
                                    }
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedCatalogIds(availableCatalogProducts.map((p) => p._id));
                                      } else {
                                        setSelectedCatalogIds([]);
                                      }
                                    }}
                                    className="rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                                  />
                                </th>
                                <th className="py-2.5 px-3">Product</th>
                                <th className="py-2.5 px-3">Current Collection</th>
                                <th className="py-2.5 px-3">Price</th>
                                <th className="py-2.5 px-3 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-slate-300">
                              {availableCatalogProducts.map((prod) => {
                                const isChecked = selectedCatalogIds.includes(prod._id);
                                return (
                                  <tr
                                    key={prod._id}
                                    className={`hover:bg-slate-900/50 transition ${
                                      isChecked ? "bg-rose-950/20" : ""
                                    }`}
                                  >
                                    <td className="py-2.5 px-3">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedCatalogIds((prev) => [...prev, prod._id]);
                                          } else {
                                            setSelectedCatalogIds((prev) =>
                                              prev.filter((id) => id !== prod._id)
                                            );
                                          }
                                        }}
                                        className="rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                                      />
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={assetUrl(prod.images?.[0] || "/images/photo-magnet.webp")}
                                          alt={prod.name}
                                          className="w-10 h-10 rounded-lg object-cover border border-slate-800 bg-slate-900 shrink-0"
                                        />
                                        <div className="min-w-0">
                                          <div className="font-semibold text-white truncate max-w-xs">
                                            {prod.name}
                                          </div>
                                          <div className="text-[10.5px] text-slate-400 font-mono truncate">
                                            /{prod.slug}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <span className="px-2 py-0.5 rounded-md text-[10.5px] bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                                        {prod.category || "uncategorized"}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 font-semibold text-white">
                                      ₹{prod.price}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      <button
                                        onClick={() => handleAssignProducts([prod._id])}
                                        disabled={submittingAction}
                                        className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] transition cursor-pointer inline-flex items-center gap-1 shadow-xs"
                                        title={`Add "${prod.name}" to ${managingCategory.name}`}
                                      >
                                        <Plus size={12} />
                                        <span>Add</span>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* =========================================================
                      TAB 3: QUICK CREATE PRODUCT DIRECTLY IN THIS COLLECTION
                     ========================================================= */}
                  {productTab === "create_new" && (
                    <form onSubmit={handleQuickCreateProduct} className="space-y-4 max-w-2xl mx-auto py-2">
                      <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-xs text-rose-200 flex items-start gap-2.5">
                        <Package size={16} className="text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-white">
                            Creating Product Directly in "{managingCategory.name}"
                          </p>
                          <p className="text-[11px] text-rose-300/80 mt-0.5">
                            This product will be instantly created and automatically assigned to the collection slug:{" "}
                            <span className="font-mono font-bold text-white">{managingCategory.slug}</span>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                            Product Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Personalized Chibi Figurine"
                            value={newProductForm.name}
                            onChange={(e) =>
                              setNewProductForm({ ...newProductForm, name: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                            Tagline / Subtitle
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Handcrafted from your favorite photo"
                            value={newProductForm.tagline}
                            onChange={(e) =>
                              setNewProductForm({ ...newProductForm, tagline: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                            Price (₹) *
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            placeholder="1299"
                            value={newProductForm.price}
                            onChange={(e) =>
                              setNewProductForm({ ...newProductForm, price: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-rose-500 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                            Compare At Price (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="1999"
                            value={newProductForm.compareAtPrice}
                            onChange={(e) =>
                              setNewProductForm({ ...newProductForm, compareAtPrice: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-rose-500 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                            Initial Stock
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="100"
                            value={newProductForm.stock}
                            onChange={(e) =>
                              setNewProductForm({ ...newProductForm, stock: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-rose-500 text-xs"
                          />
                        </div>
                      </div>

                      {/* Product Image */}
                      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                        <label className="block text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                          Product Image
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                            {newProductForm.image ? (
                              <img
                                src={assetUrl(newProductForm.image)}
                                alt="preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = "/images/photo-magnet.webp";
                                }}
                              />
                            ) : (
                              <ImageIcon size={20} className="text-slate-600" />
                            )}
                          </div>

                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={newProductForm.image}
                              onChange={(e) =>
                                setNewProductForm({ ...newProductForm, image: e.target.value })
                              }
                              placeholder="Image URL or upload local image..."
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-rose-500 font-mono"
                            />
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer">
                              <Upload size={13} />
                              <span>{uploadingNewProdImage ? "Uploading..." : "Upload Image"}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleQuickUploadImage}
                                disabled={uploadingNewProdImage}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                          Description (Optional)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Brief product description..."
                          value={newProductForm.description}
                          onChange={(e) =>
                            setNewProductForm({ ...newProductForm, description: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 text-xs"
                        />
                      </div>

                      <div className="flex flex-wrap gap-6 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={newProductForm.isCustomizable}
                            onChange={(e) =>
                              setNewProductForm({
                                ...newProductForm,
                                isCustomizable: e.target.checked,
                              })
                            }
                            className="rounded-md border-slate-700 text-rose-600 focus:ring-rose-500"
                          />
                          <span>Allow Photo / 3D Personalization</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={newProductForm.isActive}
                            onChange={(e) =>
                              setNewProductForm({ ...newProductForm, isActive: e.target.checked })
                            }
                            className="rounded-md border-slate-700 text-rose-600 focus:ring-rose-500"
                          />
                          <span>Active in Store</span>
                        </label>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={submittingAction}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-ribbon-700 hover:from-rose-500 hover:to-ribbon-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-rose-950/50 cursor-pointer disabled:opacity-50"
                        >
                          {submittingAction ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <>
                              <Plus size={16} />
                              <span>Create &amp; Add to Collection</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-900/40">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{collectionProducts.length}</span>
                <span>products currently live in this collection</span>
              </div>
              <button
                type="button"
                onClick={() => setManagingCategory(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD / EDIT COLLECTION MODAL
         ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-xl flex flex-col shadow-2xl shadow-black/80 my-8">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-white">
                  {editingCategory ? `Edit: ${editingCategory.name}` : "Create Dynamic Collection"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure category details, display priorities, and story chips.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Collection Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onBlur={handleSlugGenerate}
                    placeholder="e.g. 3D Keepsakes"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Slug Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. 3d-keepsakes"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-hidden focus:border-rose-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short tagline or overview of this collection..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 text-xs"
                />
              </div>

              {/* Banner / Image */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <label className="block text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                  Collection Thumbnail / Story Image
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.image ? (
                      <img
                        src={assetUrl(formData.image)}
                        alt="preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/images/photo-magnet.webp";
                        }}
                      />
                    ) : (
                      <ImageIcon size={20} className="text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Image URL or uploaded path..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-rose-500 font-mono"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer">
                      <Upload size={13} />
                      <span>{uploadingImage ? "Uploading..." : "Upload Local Image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Badges & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Chip Badge Label
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. Hot, Trending, Best Value"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    placeholder="1"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-rose-500 text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded-md border-slate-700 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Feature in Navigation &amp; Top Bar</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded-md border-slate-700 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Active &amp; Visible in Store</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 font-semibold cursor-pointer"
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
                      <span>{editingCategory ? "Save Changes" : "Create Collection"}</span>
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
