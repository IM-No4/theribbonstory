import { useState, useEffect } from "react";
import {
  Mail,
  Plus,
  Trash2,
  Save,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Package,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../api/client";
import { useSeo } from "../../utils/seo";
import { useAdminThemeStore } from "../../store/adminThemeStore";

export default function AdminNotifications() {
  useSeo({ title: "Order Notification Emails — Admin", noindex: true });
  const { theme } = useAdminThemeStore();

  const [emails, setEmails] = useState([]);
  const [fallbackRecipients, setFallbackRecipients] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/notification-settings");
      if (data?.success) {
        setEmails(data.emails || []);
        setFallbackRecipients(data.fallbackRecipients || []);
      }
    } catch (err) {
      console.error("Failed to load notification settings:", err);
      toast.error(err.response?.data?.message || "Could not load notification settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleAddEmail = (e) => {
    e?.preventDefault();
    const clean = newEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!clean) return;
    if (!emailRegex.test(clean)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (emails.includes(clean)) {
      toast.error("This email is already in the recipient list");
      return;
    }

    setEmails([...emails, clean]);
    setNewEmail("");
  };

  const handleRemoveEmail = (index) => {
    setEmails(emails.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/admin/notification-settings", { emails });
      if (data?.success) {
        setEmails(data.emails);
        toast.success("Order notification emails saved successfully!");
      }
    } catch (err) {
      console.error("Failed to save notification settings:", err);
      toast.error(err.response?.data?.message || "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    setTesting(true);
    try {
      const { data } = await api.post("/admin/notification-settings/test", { emails });
      if (data?.success) {
        toast.success(data.message || "Test order alert sent successfully!");
      }
    } catch (err) {
      console.error("Failed to send test alert:", err);
      toast.error(err.response?.data?.message || "Failed to send test email");
    } finally {
      setTesting(false);
    }
  };

  const isDark = theme === "dark";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-rose-500 to-ribbon-600 text-white shadow-md shadow-rose-900/20">
              <Mail size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Order Notification Emails
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Configure which email ID(s) receive real-time alerts whenever a customer places an order.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSendTest}
            disabled={testing || loading}
            className={`btn-outline py-2.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              isDark ? "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700" : "bg-white"
            }`}
            title="Send a sample test notification email to the configured recipients"
          >
            {testing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            <span>Send Test Alert</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="btn-primary py-2.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-rose-900/20"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Email Configuration Card */}
        <div className="lg:col-span-7 space-y-6">
          <div
            className={`p-6 rounded-3xl border shadow-sm space-y-5 ${
              isDark ? "bg-slate-800/80 border-slate-700" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-burgundy-900 dark:text-rose-300">
                  Team Recipient Inboxes
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Whenever an order is confirmed (Cash on Delivery or Paid Online), an email will be dispatched to each of these addresses.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                {emails.length} {emails.length === 1 ? "Recipient" : "Recipients"}
              </span>
            </div>

            {/* Add New Email Form */}
            <form onSubmit={handleAddEmail} className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter team email address (e.g. orders@theribbonstory.com)"
                className={`input-field text-xs py-3 flex-1 ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
              <button
                type="submit"
                className="btn-primary py-3 px-4 text-xs font-bold uppercase flex items-center gap-1.5 shrink-0"
              >
                <Plus size={15} />
                <span>Add</span>
              </button>
            </form>

            {/* List of Configured Emails */}
            {loading ? (
              <div className="py-10 flex flex-col items-center justify-center gap-2">
                <Loader2 size={24} className="animate-spin text-rose-500" />
                <span className="text-xs text-slate-400">Loading notification settings...</span>
              </div>
            ) : emails.length === 0 ? (
              <div
                className={`p-5 rounded-2xl border text-center space-y-2 ${
                  isDark ? "bg-slate-900/50 border-slate-700" : "bg-amber-50/60 border-amber-200/80"
                }`}
              >
                <div className="flex justify-center text-amber-600 dark:text-amber-400">
                  <AlertCircle size={24} />
                </div>
                <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  No Custom Email IDs Configured
                </div>
                <p className="text-[11px] text-amber-700/90 dark:text-amber-300/80 max-w-md mx-auto leading-relaxed">
                  When this list is empty, notifications are automatically routed to your default fallback address:{" "}
                  <strong className="font-mono">{fallbackRecipients.join(", ") || "contact@theribbonstory.com"}</strong>.
                  Add your primary emails above to customize who receives notifications.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {emails.map((email, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                      isDark
                        ? "bg-slate-900/80 border-slate-700 hover:border-slate-600"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                        <Mail size={16} />
                      </div>
                      <span className="font-mono text-xs sm:text-sm font-semibold truncate text-slate-800 dark:text-slate-100">
                        {email}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition shrink-0"
                      title="Remove this email"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Emails are saved in the studio database and persist across server updates.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Notification Preview & Info Card */}
        <div className="lg:col-span-5 space-y-6">
          {/* Notification Info Card */}
          <div
            className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
              isDark ? "bg-slate-800/80 border-slate-700" : "bg-white border-slate-200"
            }`}
          >
            <h2 className="text-sm font-bold uppercase tracking-wider text-burgundy-900 dark:text-rose-300">
              What Is Included in New Order Alerts?
            </h2>
            <ul className="text-xs space-y-2.5 text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Full Customer Profile:</strong> Name, verified contact phone, and exact shipping destination.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Keepsake Specifications:</strong> Selected tier size, figurine style, custom engraving notes, and uploaded photos.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Payment Verification:</strong> Flags whether the order is Cash on Delivery (COD) or Paid Online with transaction ID.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>1-Click Studio Access:</strong> Instant link opening the order directly inside the Admin Center for immediate production.
                </span>
              </li>
            </ul>
          </div>

          {/* Email Sample Visual Preview */}
          <div
            className={`p-5 rounded-3xl border shadow-sm space-y-3 ${
              isDark ? "bg-slate-900/90 border-slate-700" : "bg-gradient-to-br from-cream-100/70 to-rose-50/50 border-rose-200/70"
            }`}
          >
            <div className="flex items-center justify-between text-xs pb-2 border-b border-rose-200/50">
              <span className="font-bold text-burgundy-900 dark:text-rose-300">Sample Alert Preview</span>
              <span className="text-[10px] font-mono uppercase bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-full text-rose-700 dark:text-rose-300">
                HTML Email
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-rose-100 dark:border-slate-700 space-y-1.5 shadow-xs">
                <div className="font-mono text-[11px] text-slate-400">Subject:</div>
                <div className="font-bold text-burgundy-900 dark:text-rose-200">
                  🛍️ New order #71B0E7 · ₹673 · COD
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700">
                  <strong>Customer:</strong> Amrit Patel · +91 9799527504
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  <strong>Item:</strong> Custom 3D Keepsake (Single - Small Desk 3.5&quot;)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
