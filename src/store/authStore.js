import { create } from "zustand";
import { api } from "../api/client";

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("trs_user");
    if (!raw || raw === "undefined" || raw === "null") return null;
    return JSON.parse(raw);
  } catch (e) {
    localStorage.removeItem("trs_user");
    return null;
  }
};

export const useAuthStore = create((set, get) => ({
  user: getStoredUser(),
  token: localStorage.getItem("trs_token") && localStorage.getItem("trs_token") !== "undefined" ? localStorage.getItem("trs_token") : null,
  loading: false,

  isAuthenticated: () => !!get().token,

  setAuth: (user, token) => {
    if (token) {
      localStorage.setItem("trs_token", token);
    } else {
      localStorage.removeItem("trs_token");
    }
    if (user) {
      localStorage.setItem("trs_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("trs_user");
    }
    set({ user: user || null, token: token || null });
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data.token) localStorage.setItem("trs_token", data.token);
      if (data.user) localStorage.setItem("trs_user", JSON.stringify(data.user));
      set({ user: data.user || null, token: data.token || null, loading: false });
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
      if (data.token) localStorage.setItem("trs_token", data.token);
      if (data.user) localStorage.setItem("trs_user", JSON.stringify(data.user));
      set({ user: data.user || null, token: data.token || null, loading: false });
      return data.user;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  loginWithGoogle: async (googlePayload) => {
    set({ loading: true });
    try {
      const { data } = await api.post("/auth/google", googlePayload);
      if (data.token) localStorage.setItem("trs_token", data.token);
      if (data.user) localStorage.setItem("trs_user", JSON.stringify(data.user));
      set({ user: data.user || null, token: data.token || null, loading: false });
      return data;
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
