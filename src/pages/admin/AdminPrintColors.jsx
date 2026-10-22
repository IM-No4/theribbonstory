import { useState, useEffect } from "react";
import {
  Palette,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  Sparkles,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Printer,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "../../api/client";
import { useSeo } from "../../utils/seo";
import { useAdminThemeStore } from "../../store/adminThemeStore";

const RECOMMENDED_PRESETS = [
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#111111" },
  { name: "Beige / Skin", hex: "#F5D0B0" },
  { name: "Red", hex: "#E53E3E" },
  { name: "Blue", hex: "#3182CE" },
  { name: "Yellow", hex: "#D69E2E" },
  { name: "Green", hex: "#38A169" },
  { name: "Brown", hex: "#7B341E" },
  { name: "Grey", hex: "#718096" },
  { name: "Pink", hex: "#ED64A6" },
  { name: "Orange", hex: "#DD6B20" },
  { name: "Purple", hex: "#805AD5" },
];

export default function AdminPrintColors() {
  useSeo({ title: "3D Print Filament Colors — Admin", noindex: true });
  const { theme } = useAdminThemeStore();

  const [colors, setColors] = useState(() =>
    RECOMMENDED_PRESETS.map((p) => ({ ...p, isActive: true }))
  );
  const [maxColors, setMaxColors] = useState(4);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New color form state
  const [newName, setNewName] = useState("");
  const [newHex, setNewHex] = useState("#E53E3E");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/3d-studio/colors");
      if (data?.availableColors && Array.isArray(data.availableColors) && data.availableColors.length > 0) {
        setColors(data.availableColors);
        setMaxColors(data.maxColorsPerModel || 4);
      }
    } catch (err) {
      console.error("Error fetching print colors:", err);
      const errMsg = err.response?.data?.message || err.message;
      if (err.response?.status === 404) {
        toast.error("API route not recognized. Please restart the backend server.", { duration: 5000 });
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Admin access required. Please verify your session.", { duration: 4000 });
      } else {
        toast.error(errMsg ? `Failed to load: ${errMsg}` : "Failed to load 3D print colors");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleColor = (index) => {
    const updated = [...colors];
    updated[index].isActive = !updated[index].isActive;
    setColors(updated);
  };

  const handleDeleteColor = (index) => {
    const updated = colors.filter((_, i) => i !== index);
    setColors(updated);
  };

  const handleAddColor = (e) => {
    e.preventDefault();
    const cleanName = newName.trim();
    if (!cleanName) {
      toast.error("Please enter a color name");
      return;
    }

    // Check duplicate
    if (colors.some((c) => c.name.toLowerCase() === cleanName.toLowerCase())) {
      toast.error(`Color "${cleanName}" already exists`);
      return;
    }

    const updated = [
      ...colors,
      {
        name: cleanName,
        hex: newHex,
        isActive: true,
      },
    ];

    setColors(updated);
    setNewName("");
    toast.success(`Added "${cleanName}" to filament list`);
  };

  const handleResetToPresets = () => {
    if (!window.confirm("Reset filament colors to standard recommended 3D print palette?")) return;
    setColors(RECOMMENDED_PRESETS.map((p) => ({ ...p, isActive: true })));
    toast.success("Reset to standard recommended filament palette");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/3d-studio/colors", {
        availableColors: colors,
        maxColorsPerModel: maxColors,
      });
      toast.success("3D print filament colors saved successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const activeColorsCount = colors.filter((c) => c.isActive !== false).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Palette size={22} />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                3D Print Filament Colors & Palette
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Define the available filament colors in your 3D workshop. Models will be restricted to at most {maxColors} of these colors.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetToPresets}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw size={13} />
            <span>Load Standard Presets</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-ribbon-700 hover:from-rose-500 hover:to-ribbon-600 text-white text-xs font-bold shadow-lg shadow-rose-950/40 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={15} />
            )}
            <span>Save Color Palette</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Colors List + Add Color & Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Available Filaments List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl shadow-black/20 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Printer size={15} className="text-rose-400" />
                  Workshop Available Filaments
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {activeColorsCount} of {colors.length} filament colors active
                </p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                Max {maxColors} colors / figurine
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-16 bg-slate-900/60 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : colors.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-3">
                <Palette size={32} className="mx-auto text-slate-600" />
                <p className="text-sm font-semibold text-white">No filament colors configured</p>
                <button
                  type="button"
                  onClick={handleResetToPresets}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition"
                >
                  Load Recommended Colors
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {colors.map((color, index) => {
                  const isActive = color.isActive !== false;
                  return (
                    <div
                      key={color.name + index}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isActive
                          ? "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                          : "bg-slate-950/60 border-slate-900 opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Color Swatch Circle */}
                        <div
                          className="w-8 h-8 rounded-xl shrink-0 shadow-inner border border-white/20"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-white text-xs truncate">
                            {color.name}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400 uppercase">
                            {color.hex}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Active Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleColor(index)}
                          title={isActive ? "Disable this filament" : "Enable this filament"}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                            isActive
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900"
                              : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                          }`}
                        >
                          {isActive ? "In Stock" : "Inactive"}
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteColor(index)}
                          title="Remove color"
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Add Color & AI Rules */}
        <div className="space-y-6">
          {/* Add Color Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl shadow-black/20 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
              <Plus size={14} className="text-rose-400" />
              Add Workshop Filament
            </h3>

            <form onSubmit={handleAddColor} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px] uppercase tracking-wider">
                  Color / Filament Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Navy Blue, Peach Skin, Gold"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px] uppercase tracking-wider">
                  Hex Color Code & Swatch
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newHex}
                    onChange={(e) => setNewHex(e.target.value)}
                    className="w-10 h-9 rounded-xl border border-slate-700 bg-slate-900 cursor-pointer p-0.5 shrink-0"
                  />
                  <input
                    type="text"
                    value={newHex}
                    onChange={(e) => setNewHex(e.target.value)}
                    placeholder="#E53E3E"
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono uppercase text-xs focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center justify-center gap-2 border border-slate-800 transition cursor-pointer text-xs"
              >
                <Plus size={14} />
                <span>Add Color to List</span>
              </button>
            </form>
          </div>

          {/* Multi-Color Rules & Prompt Logic Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl shadow-black/20 space-y-3.5 text-xs">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
              <Sparkles size={14} className="text-amber-400" />
              Automated 3D Generation Rules
            </h3>

            <div className="space-y-2.5 text-slate-300 text-[11.5px] leading-relaxed">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="font-bold text-rose-300 block">
                  1. 4-Color Maximum Constraint
                </span>
                <p className="text-slate-400 text-[11px]">
                  Multi-material FDM 3D printers (like Bambu Lab AMS) support up to 4 spools per head. AI strictly picks at most 4 active filament colors for the entire model.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="font-bold text-sky-300 block">
                  2. Color Mapping & Quantization
                </span>
                <p className="text-slate-400 text-[11px]">
                  Complex shades in the photo are automatically snapped to the nearest workshop filament:
                  <br />• Maroon, burgundy, crimson → <strong>Red</strong>
                  <br />• Navy blue, teal, cyan → <strong>Blue</strong>
                  <br />• Cream, ivory, warm peach → <strong>Beige / Skin or White</strong>
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-300 block">
                  3. Pattern & Design Simplification
                </span>
                <p className="text-slate-400 text-[11px]">
                  Intricate patterns, checks, stripes, or embroideries on shirts, pants, skirts, or turbans are converted into clean 3D silhouettes filled with uniform basic solid colors for flawless physical printing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
