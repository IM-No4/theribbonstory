import { create } from "zustand";
import { api } from "../api/client";

export const useConfigStore = create((set, get) => ({
  config: {
    comingSoon: false,
    googleClientId: "",
    razorpayKeyId: "",
  },
  loaded: false,
  loading: false,

  fetchConfig: async () => {
    if (get().loading) return get().config;
    set({ loading: true });
    try {
      const { data } = await api.get("/config");
      set({ config: data, loaded: true, loading: false });
      return data;
    } catch (err) {
      console.warn("[ConfigStore] Could not load system config from backend:", err);
      set({ loaded: true, loading: false });
      return get().config;
    }
  },
}));
