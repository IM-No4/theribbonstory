import { create } from "zustand";
import { api, onUnauthorized } from "../api/client";

const USER_KEY = "trs_user";

// Sessions used to be a token in localStorage; drop any leftover copy.
try {
  localStorage.removeItem("trs_token");
} catch {
  /* storage unavailable */
}

// The cached user is only a display hint until /auth/me confirms the session cookie.
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw || raw === "undefined" || raw === "null") return null;
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

const storeUser = (user) => {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* storage unavailable */
  }
};

export const useAuthStore = create((set, get) => ({
  user: getStoredUser(),
  loading: false,

  isAuthenticated: () => !!get().user,

  setAuth: (user) => {
    storeUser(user);
    set({ user: user || null });
  },

  /** Confirm the session cookie is still valid and refresh the user profile */
  restoreSession: async () => {
    try {
      const { data } = await api.get("/auth/me");
      get().setAuth(data.user);
    } catch (err) {
      if (err.response?.status === 401) get().setAuth(null);
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post("/auth/login", { email, password });
      get().setAuth(data.user);
      set({ loading: false });
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
      get().setAuth(data.user);
      set({ loading: false });
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
      get().setAuth(data.user);
      set({ loading: false });
      return data;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    get().setAuth(null);
    // Clear the httpOnly session cookie on the server
    api.post("/auth/logout").catch(() => {});
  },
}));

// Session expired or was revoked: forget the cached user
onUnauthorized(() => {
  if (useAuthStore.getState().user) useAuthStore.getState().setAuth(null);
});
