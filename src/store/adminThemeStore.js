import { create } from "zustand";

const STORAGE_KEY = "trs_admin_theme";

// Default to 'light' or check saved preference
const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  // If user has system preference or default to light for ease of eye
  return "light";
};

export const useAdminThemeStore = create((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      console.warn("Could not save admin theme to localStorage", e);
    }
    set({ theme });
  },
  toggleTheme: () => {
    set((state) => {
      const next = state.theme === "light" ? "dark" : "light";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {
        console.warn("Could not save admin theme to localStorage", e);
      }
      return { theme: next };
    });
  },
}));
