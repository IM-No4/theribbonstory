import { create } from "zustand";
import { api } from "../api/client";

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("trs_user") || "null"),
  token: localStorage.getItem("trs_token") || null,
  loading: false,

  isAuthenticated: () => !!get().token,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("trs_token", data.token);
      localStorage.setItem("trs_user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data.user;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      localStorage.setItem("trs_token", data.token);
      localStorage.setItem("trs_user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data.user;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("trs_token");
    localStorage.removeItem("trs_user");
    set({ user: null, token: null });
  },
}));
