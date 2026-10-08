import { useEffect } from "react";
import { assetUrl } from "../api/client";

export const SITE_NAME = "The Ribbon Story";
export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://theribbonstory.com").replace(/\/$/, "");
const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");
const DEFAULT_DESCRIPTION =
  "Turn your favorite moments into beautiful physical keepsakes. Personalized photo magnets, 3D keepsakes and bespoke gift hampers, handcrafted in India.";
const DEFAULT_IMAGE = "/images/og-default.jpg";

/** Shareable link for a product: the API page that carries its preview tags */
export const productShareUrl = (slug) => `${API_ORIGIN}/share/product/${encodeURIComponent(slug)}`;

export const absoluteUrl = (url) => {
  const resolved = assetUrl(url || DEFAULT_IMAGE);
  return /^https?:\/\//.test(resolved) ? resolved : `${SITE_URL}${resolved}`;
};

const setMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setCanonical = (href) => {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const setJsonLd = (data) => {
  let el = document.head.querySelector('script[data-seo="jsonld"]');
  if (!data) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.dataset.seo = "jsonld";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
};

/**
 * Per-page title, description, canonical URL, social tags and optional
 * structured data. Google renders JavaScript and reads these; chat apps
 * that don't run JavaScript see the defaults in index.html (products are
 * shared through productShareUrl instead).
 */
export function useSeo({ title, description, path, image, type = "website", noindex = false, jsonLd = null }) {
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : "";
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Personalised Photo & 3D Keepsakes`;
    const desc = String(description || DEFAULT_DESCRIPTION).replace(/\s+/g, " ").trim().slice(0, 160);
    const url = `${SITE_URL}${path ?? window.location.pathname}`;
    const img = absoluteUrl(image);

    document.title = fullTitle;
    setMeta("name", "description", desc);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    setCanonical(url);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", type);
    setMeta("property", "og:image", img);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", img);
    setJsonLd(jsonLdKey ? JSON.parse(jsonLdKey) : null);
  }, [title, description, path, image, type, noindex, jsonLdKey]);
}
