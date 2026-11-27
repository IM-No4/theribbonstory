import { useState, useEffect, useCallback } from "react";
import { Loader2, Mail, RefreshCw, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { api, assetUrl } from "../../api/client";
import { useSeo } from "../../utils/seo";

const rupees = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;
const ago = (date) => {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date)) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} h ago`;
  return `${Math.floor(minutes / 1440)} d ago`;
};

/** Why a reminder can't be sent right now, or null if it can */
const blockedReason = (cart, rules) => {
  if (cart.optedOut) return "Unsubscribed";
  if (Date.now() - new Date(cart.changedAt) < rules.minIdleMinutes * 60000) return "May still be shopping";
  if (cart.lastReminderAt && Date.now() - new Date(cart.lastReminderAt) < rules.cooldownHours * 3600000) {
    return "Reminded recently";
  }
  return null;
};

export default function AdminAbandonedCarts() {
  useSeo({ title: "Abandoned Carts — Admin", noindex: true });
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState([]);
  const [composing, setComposing] = useState(null); // the carts being emailed
  const [form, setForm] = useState({ subject: "", message: "", couponCode: "" });
  const [coupons, setCoupons] = useState([]);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      const res = await api.get("/admin/abandoned-carts");
      setData(res.data);
      setSelected([]);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    load();
    api
      .get("/coupons/admin/all")
      .then(({ data: res }) => setCoupons((res.coupons || []).filter((c) => c.isActive)))
      .catch(() => {});
  }, [load]);

  const carts = data?.carts || [];
  const sendable = data ? carts.filter((c) => !blockedReason(c, data.rules)) : [];
  const chosen = sendable.filter((c) => selected.includes(c.userId));

  const compose = (list) => {
    setForm({ subject: data.defaults.subject, message: data.defaults.message, couponCode: "" });
    setComposing(list);
  };

  const send = async () => {
    setSending(true);
    let sent = 0;
    const problems = [];
    // One at a time, so one failure doesn't stop the rest and the mail server isn't flooded
    for (const cart of composing) {
      try {
        await api.post(`/admin/abandoned-carts/${cart.userId}/remind`, form);
        sent += 1;
      } catch (err) {
        problems.push(err.response?.data?.message || `Could not email ${cart.email}`);
      }
    }
    setSending(false);
    setComposing(null);
    if (sent) toast.success(`${sent} reminder${sent === 1 ? "" : "s"} sent`);
    problems.slice(0, 3).forEach((p) => toast.error(p, { duration: 6000 }));
    load();
  };

  const field = "w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-rose-500";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Abandoned Carts</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Signed-in customers with items in their cart and no order since. Reminders can be sent after an hour, at most once a day.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} aria-label="Refresh" className="p-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white">
            <RefreshCw size={15} />
          </button>
          <button
            type="button"
            disabled={!chosen.length}
            onClick={() => compose(chosen)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Mail size={15} /> Email selected{chosen.length ? ` (${chosen.length})` : ""}
          </button>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        {failed ? (
          <p className="p-10 text-center text-sm text-slate-400">Could not load carts. Use refresh to try again.</p>
        ) : !data ? (
          <div className="p-12 flex justify-center text-slate-500"><Loader2 className="animate-spin" /></div>
        ) : carts.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-400">No abandoned carts right now.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4 w-8">
                    <input
                      type="checkbox"
                      aria-label="Select all that can be emailed"
                      checked={sendable.length > 0 && chosen.length === sendable.length}
                      onChange={(e) => setSelected(e.target.checked ? sendable.map((c) => c.userId) : [])}
                    />
                  </th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">In the cart</th>
                  <th className="py-3.5 px-4">Value</th>
                  <th className="py-3.5 px-4">Left</th>
                  <th className="py-3.5 px-4">Last reminder</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {carts.map((cart) => {
                  const blocked = blockedReason(cart, data.rules);
                  return (
                    <tr key={cart.userId} className="align-top hover:bg-slate-900/40">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          aria-label={`Select ${cart.name}`}
                          disabled={Boolean(blocked)}
                          checked={!blocked && selected.includes(cart.userId)}
                          onChange={(e) =>
                            setSelected((ids) => (e.target.checked ? [...ids, cart.userId] : ids.filter((id) => id !== cart.userId)))
                          }
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{cart.name}</div>
                        <div className="text-[11px] text-slate-400">{cart.email}</div>
                      </td>
                      <td className="py-3 px-4 min-w-56">
                        <ul className="space-y-1.5">
                          {cart.items.map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                              {item.image && <img src={assetUrl(item.image)} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-800" />}
                              <span>
                                {item.name} <span className="text-slate-500">× {item.quantity}{item.options.length ? ` · ${item.options.join(", ")}` : ""}</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="py-3 px-4 font-bold text-white whitespace-nowrap">{rupees(cart.total)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{ago(cart.changedAt)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{cart.lastReminderAt ? ago(cart.lastReminderAt) : "Never"}</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {blocked ? (
                          <span className="text-[11px] text-slate-500">{blocked}</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => compose([cart])}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-rose-300 hover:text-white font-semibold"
                          >
                            Send reminder
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {composing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto">
          <div role="dialog" aria-modal="true" aria-label="Write reminder email" className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 my-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display font-bold text-xl text-white">Cart reminder</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  To {composing.length === 1 ? composing[0].email : `${composing.length} customers`}. Their cart items, a button back to the cart and an unsubscribe link are added automatically.
                </p>
              </div>
              <button type="button" onClick={() => setComposing(null)} disabled={sending} aria-label="Close" className="p-1.5 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <label className="block space-y-1">
              <span className="text-[11px] font-semibold text-slate-300">Subject</span>
              <input className={field} maxLength={120} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-semibold text-slate-300">Message (the greeting with their first name is added for you)</span>
              <textarea rows={4} className={field} maxLength={1000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-semibold text-slate-300">Include a coupon (optional)</span>
              <select className={field} value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value })}>
                <option value="">No coupon</option>
                {coupons.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}{c.minOrderAmount ? ` (orders of ₹${c.minOrderAmount}+)` : ""}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setComposing(null)} disabled={sending} className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold">
                Cancel
              </button>
              <button type="button" onClick={send} disabled={sending} className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-60">
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                {sending ? "Sending…" : `Send ${composing.length === 1 ? "email" : `${composing.length} emails`}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
