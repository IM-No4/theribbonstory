import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "../../api/client";
import { useSeo } from "../../utils/seo";
import { useConfigStore } from "../../store/configStore";

const FIELDS = [
  {
    key: "freeShippingThreshold",
    label: "Free delivery on orders of (₹) or more",
    hint: "Compared with the item total, before coupons. Enter 0 to give free delivery on every order.",
  },
  { key: "standardFee", label: "Standard delivery charge (₹)", hint: "Charged on orders below the free delivery amount." },
  { key: "expressFee", label: "Express priority extra charge (₹)", hint: "Added on top for express delivery." },
  { key: "midnightFee", label: "Midnight delivery extra charge (₹)", hint: "Added on top for midnight delivery." },
];

export default function AdminShipping() {
  useSeo({ title: "Delivery Charges — Admin", noindex: true });

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .get("/admin/shipping-settings")
      .then(({ data }) => setForm(data.shipping))
      .catch(() => setFailed(true));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/admin/shipping-settings", form);
      setForm(data.shipping);
      useConfigStore.setState((state) => ({ config: { ...state.config, shipping: data.shipping } }));
      toast.success("Delivery charges updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save delivery charges");
    } finally {
      setSaving(false);
    }
  };

  if (failed) {
    return <p className="py-20 text-center text-sm text-slate-500">Could not load delivery charges. Refresh to try again.</p>;
  }
  if (!form) {
    return (
      <div className="flex justify-center py-20 text-slate-400">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">Delivery Charges</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Used by the cart, checkout and order totals. Changes apply to new orders only.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        {FIELDS.map((f) => (
          <label key={f.key} className="block space-y-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{f.label}</span>
            <input
              type="number"
              min="0"
              max="100000"
              step="1"
              required
              value={form[f.key] ?? ""}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-rose-400"
            />
            <span className="block text-xs text-slate-500">{f.hint}</span>
          </label>
        ))}
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save charges
        </button>
      </form>
    </div>
  );
}
