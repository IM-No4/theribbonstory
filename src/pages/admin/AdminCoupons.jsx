import { useState, useEffect } from "react";
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Percent,
  DollarSign,
  Calendar,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "../../api/client";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "fixed",
    discountAmount: "",
    minOrderAmount: "",
    maxDiscount: "",
    usageLimit: 1000,
    validUntil: "",
    isActive: true,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/coupons/admin/all");
      setCoupons(data.coupons || []);
    } catch (err) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      description: "",
      discountType: "fixed",
      discountAmount: "",
      minOrderAmount: "499",
      maxDiscount: "",
      usageLimit: 1000,
      validUntil: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType || "fixed",
      discountAmount: coupon.discountAmount,
      minOrderAmount: coupon.minOrderAmount || "",
      maxDiscount: coupon.maxDiscount || "",
      usageLimit: coupon.usageLimit || 1000,
      validUntil: coupon.validUntil ? coupon.validUntil.split("T")[0] : "",
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || formData.discountAmount === "") {
      toast.error("Code and discount amount are required.");
      return;
    }

    setSubmitting(true);
    const payload = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      discountAmount: Number(formData.discountAmount),
      minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : 0,
      usageLimit: Number(formData.usageLimit) || 1000,
    };

    try {
      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, payload);
        toast.success("Coupon updated successfully!");
      } else {
        await api.post("/coupons", payload);
        toast.success("Coupon created successfully!");
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return;
    try {
      await api.delete(`/coupons/${coupon._id}`);
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (err) {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Promotions & Coupons
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create discount codes, set percentage or flat savings, and manage usage thresholds.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-ribbon-700 hover:from-rose-500 hover:to-ribbon-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 transition cursor-pointer"
        >
          <Plus size={16} />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-900/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Tag size={36} className="mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-white">No promotional coupons created</p>
            <button
              onClick={openAddModal}
              className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold inline-flex items-center gap-2"
            >
              <Plus size={14} /> Add Coupon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount Value</th>
                  <th className="py-3.5 px-4">Condition / Min Spend</th>
                  <th className="py-3.5 px-4">Usage Stats</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white text-sm tracking-wider flex items-center gap-2">
                        <Tag size={14} className="text-rose-400" />
                        <span>{c.code}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{c.description || "No description"}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-300">
                      {c.discountType === "percentage" ? `${c.discountAmount}% OFF` : `₹${c.discountAmount} Flat OFF`}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {c.minOrderAmount > 0 ? `Min spend ₹${c.minOrderAmount}` : "No min spend"}
                      {c.maxDiscount > 0 && ` (Cap ₹${c.maxDiscount})`}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {c.usedCount || 0} / {c.usageLimit || "∞"} used
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.isActive
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {c.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-2 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 hover:text-rose-300 border border-rose-900/40 transition cursor-pointer"
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

      {/* Add / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg flex flex-col shadow-2xl shadow-black/80 my-8">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-white">
                  {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create Promotional Coupon"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set discount rules, minimum order values, and code names.
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
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. RIBBON100"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono font-bold placeholder-slate-500 focus:outline-hidden focus:border-rose-500 text-xs uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-rose-500 text-xs"
                  >
                    <option value="fixed">Flat ₹ Amount OFF</option>
                    <option value="percentage">% Percentage OFF</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Discount Value ({formData.discountType === "percentage" ? "%" : "₹"}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                    placeholder="e.g. 100"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold focus:outline-hidden focus:border-rose-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    placeholder="e.g. 499"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-rose-500 text-xs"
                  />
                </div>
              </div>

              {formData.discountType === "percentage" && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Max Discount Cap (₹) (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="e.g. 300 (0 for no limit)"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-rose-500 text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Flat ₹100 discount on keepsakes above ₹499"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 text-xs"
                />
              </div>

              <div className="flex flex-wrap gap-6 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded-md border-slate-700 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Active for Customers at Checkout</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
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
                      <span>{editingCoupon ? "Save Changes" : "Create Coupon"}</span>
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
