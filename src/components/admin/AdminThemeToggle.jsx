import { Sun, Moon } from "lucide-react";
import { useAdminThemeStore } from "../../store/adminThemeStore";

export default function AdminThemeToggle({ variant = "segmented" }) {
  const { theme, toggleTheme, setTheme } = useAdminThemeStore();
  const isLight = theme === "light";

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
        aria-label={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
        className={`relative p-2 rounded-xl transition-all duration-200 border flex items-center justify-center cursor-pointer shadow-xs ${
          isLight
            ? "bg-slate-100 hover:bg-slate-200/80 border-slate-300 text-slate-700 hover:text-slate-900"
            : "bg-slate-900/80 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white"
        }`}
      >
        {isLight ? (
          <Sun size={17} className="text-amber-500 transition-transform duration-300 hover:rotate-45" />
        ) : (
          <Moon size={17} className="text-indigo-400 transition-transform duration-300 hover:-rotate-12" />
        )}
      </button>
    );
  }

  // Segmented Pill Control (Sidebar & Settings)
  return (
    <div
      role="radiogroup"
      aria-label="Admin Theme Selector"
      className={`p-1 rounded-xl border flex items-center gap-1 transition-colors ${
        isLight ? "bg-slate-100 border-slate-200" : "bg-slate-900/90 border-slate-800"
      }`}
    >
      <button
        type="button"
        role="radio"
        aria-checked={!isLight}
        onClick={() => setTheme("dark")}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
          !isLight
            ? "bg-slate-800 text-white shadow-sm border border-slate-700/80"
            : isLight
            ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
        }`}
      >
        <Moon size={13} className={!isLight ? "text-indigo-400" : "text-slate-500"} />
        <span>Dark</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={isLight}
        onClick={() => setTheme("light")}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
          isLight
            ? "bg-white text-slate-900 shadow-sm border border-slate-300 font-bold"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
        }`}
      >
        <Sun size={13} className={isLight ? "text-amber-500" : "text-slate-400"} />
        <span>Light</span>
      </button>
    </div>
  );
}
