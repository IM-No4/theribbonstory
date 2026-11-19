import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, Upload, Trash2, ExternalLink, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { api, assetUrl } from "../../api/client";
import { useSeo } from "../../utils/seo";
import { useConfigStore } from "../../store/configStore";
import { HERO_PRESETS } from "../../data/heroPresets";

const EMPTY = {
  enabled: false,
  preset: "custom",
  badge: "",
  headline: "",
  highlight: "",
  subtext: "",
  overlayText: "",
  ctaText: "",
  ctaLink: "/shop",
  bannerText: "",
  images: [],
  mobileImages: [],
  pageBackground: "",
  collectionSlug: "",
};

const FIELDS = [
  { key: "badge", label: "Small badge above the headline", max: 60 },
  { key: "headline", label: "Headline (first line)", max: 60 },
  { key: "highlight", label: "Headline (coloured second line)", max: 60 },
  { key: "subtext", label: "Short description", max: 240, multiline: true },
  { key: "overlayText", label: "Text on the hero image", max: 90 },
  { key: "ctaText", label: "Button text", max: 40 },
  { key: "ctaLink", label: "Button link (e.g. /shop)", max: 200 },
  { key: "bannerText", label: "Top announcement strip (optional)", max: 140 },
];

const inputClass =
  "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-rose-400";

export default function AdminHeroTheme() {
  useSeo({ title: "Hero Theme — Admin", noindex: true });

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Each theme keeps its own images and text; switching themes loads that theme's saved details.
  const [drafts, setDrafts] = useState({});
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    api
      .get("/admin/hero-theme")
      .then(({ data }) => {
        setForm({ ...EMPTY, ...data.heroTheme });
        setDrafts(data.drafts || {});
      })
      .catch(() => toast.error("Could not load hero theme"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCollections(data?.categories || [])).catch(() => {});
  }, []);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const themeFields = (f) => {
    const { enabled, preset, ...fields } = f;
    return fields;
  };

  const applyPreset = (key) => {
    if (key === form.preset) return;
    const nextDrafts = { ...drafts, [form.preset]: themeFields(form) };
    setDrafts(nextDrafts);
    const saved = nextDrafts[key];
    const base = { ...themeFields(EMPTY), ...(HERO_PRESETS[key].text || {}) };
    setForm((prev) => ({ enabled: prev.enabled, preset: key, ...(saved ? { ...themeFields(EMPTY), ...saved } : base) }));
  };

  const handleUpload = async (e, field = "images") => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files.slice(0, 5 - form[field].length)) {
        const body = new FormData();
        body.append("photo", file);
        const { data } = await api.post("/upload", body, { headers: { "Content-Type": "multipart/form-data" } });
        if (data?.url) urls.push(data.url);
      }
      setForm((prev) => ({ ...prev, [field]: [...prev[field], ...urls].slice(0, 5) }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleBackgroundUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("photo", file);
      const { data } = await api.post("/upload", body, { headers: { "Content-Type": "multipart/form-data" } });
      if (data?.url) set("pageBackground", data.url);
    } catch (err) {
      toast.error(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/admin/hero-theme", { ...form, drafts: { ...drafts, [form.preset]: themeFields(form) } });
      setForm({ ...EMPTY, ...data.heroTheme });
      setDrafts(data.drafts || {});
      const { enabled, ...theme } = data.heroTheme;
      useConfigStore.setState((state) => ({
        config: { ...state.config, heroTheme: enabled ? theme : null },
      }));
      toast.success(enabled ? "Hero theme is live on the home page" : "Saved. Standard hero is showing");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save hero theme");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-400">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">Seasonal Hero Theme</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Change the home page hero for a season, like Christmas. Pick a theme, add your images, and turn it on. Turn it off to go back to the standard hero.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.enabled}
          onClick={() => set("enabled", !form.enabled)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${form.enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}
        >
          <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${form.enabled ? "left-[22px]" : "left-0.5"}`} />
        </button>
      </div>

      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">1. Pick a theme</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Each theme keeps its own images and text. Switch between themes to edit them, then press Save to publish the one that is selected.</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(HERO_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${
                form.preset === key
                  ? "border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                  : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
              }`}
            >
              {preset.emoji} {preset.label}
            </button>
          ))}
        </div>
      </section>

      {[
        {
          field: "images",
          title: "2. Desktop hero images",
          hint: "Up to 5. With more than one, they rotate automatically. Landscape (about 5:4, e.g. 1600×1280 px) works best.",
          ratio: "h-24 w-32",
        },
        {
          field: "mobileImages",
          title: "3. Mobile hero images (optional)",
          hint: "Shown on phones instead of the desktop images. Portrait (about 4:5, e.g. 1200×1500 px) works best. Leave empty to reuse the desktop images.",
          ratio: "h-32 w-24",
        },
      ].map(({ field, title, hint, ratio }) => (
        <section key={field} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
          <div className="flex flex-wrap gap-3">
            {form[field].map((url) => (
              <div key={url} className={`relative ${ratio} overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700`}>
                <img src={assetUrl(url)} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => set(field, form[field].filter((u) => u !== url))}
                  className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-red-600"
                  aria-label="Remove image"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {form[field].length < 5 && (
              <label className={`flex ${ratio} cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500 hover:border-rose-400`}>
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                <span>{uploading ? "Uploading…" : "Add image"}</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(e, field)} disabled={uploading} />
              </label>
            )}
          </div>
        </section>
      ))}

      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">4. Page background (optional)</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          A repeating pattern behind the home page sections below the hero, like a red Christmas pattern. Headings switch to white; product cards stay light. Use a darker image so white text stays readable.
        </p>
        <div className="flex flex-wrap gap-3">
          {form.pageBackground ? (
            <div className="relative h-32 w-24 overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700">
              <img src={assetUrl(form.pageBackground)} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => set("pageBackground", "")}
                className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-red-600"
                aria-label="Remove background"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ) : (
            <label className="flex h-32 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500 hover:border-rose-400">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              <span>{uploading ? "Uploading…" : "Add image"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundUpload} disabled={uploading} />
            </label>
          )}
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">5. Theme collection</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Products from this collection are shown right below the hero. Leave empty to skip.
        </p>
        <select value={form.collectionSlug} onChange={(e) => set("collectionSlug", e.target.value)} className={inputClass}>
          <option value="">None</option>
          {collections.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </section>

      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">6. Text</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <label key={f.key} className={`block space-y-1 ${f.multiline ? "sm:col-span-2" : ""}`}>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{f.label}</span>
              {f.multiline ? (
                <textarea rows={3} maxLength={f.max} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} className={inputClass} />
              ) : (
                <input type="text" maxLength={f.max} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} className={inputClass} />
              )}
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save changes
        </button>
        <Link to="/" target="_blank" className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1">
          View home page <ExternalLink size={12} />
        </Link>
        <span className="text-xs text-slate-500">
          {form.enabled ? "Theme is ON: saving updates the live site." : "Theme is OFF: the standard hero is showing."}
        </span>
      </div>
    </div>
  );
}
