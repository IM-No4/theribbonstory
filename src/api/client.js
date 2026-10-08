import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// The login session is an httpOnly cookie set by the API, so it is sent
// automatically and never readable from JavaScript.
export const api = axios.create({ baseURL: API_URL, withCredentials: true });

let unauthorizedHandler = null;
/** Register a callback for when the API reports the session is missing or expired */
export const onUnauthorized = (handler) => {
  unauthorizedHandler = handler;
};

const AUTH_ATTEMPT_PATHS = ["/auth/login", "/auth/register", "/auth/google"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    if (error.response?.status === 401 && !AUTH_ATTEMPT_PATHS.some((p) => url.startsWith(p))) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);

/**
 * Resolve an image path for <img src>:
 * - "/uploads/..." files live on the API server
 * - site images ("/images/...") are served by the storefront itself
 * - older saved paths "/src/assets/images/<name>.jpeg" (products and
 *   collections created before images moved to /images) map to the WebP copy
 */
export const assetUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) return path;
  const legacy = /^\/src\/assets\/images\/([\w-]+)\.(?:jpe?g|png)$/.exec(path);
  if (legacy) return `/images/${legacy[1]}.webp`;
  if (path.startsWith("/uploads/")) return `${API_URL.replace(/\/api$/, "")}${path}`;
  return path;
};
