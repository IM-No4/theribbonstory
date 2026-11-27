// First-party storefront analytics, sent to our own API only.
// Visitors are random IDs stored in the browser; no names or emails are sent.
const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";
const VISITOR_KEY = "trs_visitor";
const SESSION_KEY = "trs_session";
const SKIP_KEY = "trs_no_track";
const SESSION_IDLE_MS = 30 * 60 * 1000; // a new visit starts after 30 quiet minutes

const inBrowser = typeof window !== "undefined" && typeof document !== "undefined";

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
};

const randomId = () =>
  window.crypto?.randomUUID?.() ||
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

const storedUser = () => {
  try {
    return JSON.parse(read("trs_user") || "null");
  } catch {
    return null;
  }
};

/** The team's own browsing is never counted: admin pages, and any device an admin has signed in on */
const isExcluded = () => {
  if (!inBrowser) return true;
  if (storedUser()?.role === "admin") write(SKIP_KEY, "1");
  return read(SKIP_KEY) === "1" || window.location.pathname.startsWith("/admin");
};

/** Where this visit came from: ad link tags first, then the referring website */
const readSource = () => {
  const params = new URLSearchParams(window.location.search);
  const utm = params.get("utm_source");
  if (utm) {
    return { source: utm, medium: params.get("utm_medium") || "unknown", campaign: params.get("utm_campaign") || "", tagged: true };
  }
  const campaign = params.get("utm_campaign") || "";
  if (params.get("gclid")) return { source: "google", medium: "cpc", campaign, tagged: true };
  if (params.get("fbclid")) return { source: "facebook", medium: "social", campaign, tagged: true };

  let host = "";
  try {
    host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
  } catch {
    host = "";
  }
  // Our own pages and the payment window are not traffic sources
  if (!host || host === window.location.hostname.replace(/^www\./, "") || host.includes("razorpay")) {
    return { source: "direct", medium: "none", campaign: "" };
  }
  if (/(^|\.)google\./.test(host)) return { source: "google", medium: "organic", campaign: "" };
  if (/instagram|facebook|youtube|pinterest|twitter|t\.co$|whatsapp|linkedin/.test(host)) {
    return { source: host, medium: "social", campaign: "" };
  }
  return { source: host, medium: "referral", campaign: "" };
};

let landingChecked = false;

const currentSession = () => {
  let session = null;
  try {
    session = JSON.parse(read(SESSION_KEY) || "null");
  } catch {
    session = null;
  }
  const now = Date.now();
  // The landing address and referrer only describe the first page of this page load
  const arrived = landingChecked ? null : readSource();
  landingChecked = true;
  const newAd =
    arrived?.tagged &&
    session &&
    (session.source !== arrived.source || session.campaign !== arrived.campaign);

  if (!session || now - session.last > SESSION_IDLE_MS || newAd) {
    const { tagged, ...from } = arrived || { source: "direct", medium: "none", campaign: "" };
    session = { id: randomId(), ...from };
  }
  session.last = now;
  write(SESSION_KEY, JSON.stringify(session));
  return session;
};

const visitorId = () => {
  let id = read(VISITOR_KEY);
  if (!id) {
    id = randomId();
    write(VISITOR_KEY, id);
  }
  return id;
};

let queue = [];
let envelope = null;
let timer = null;

const flush = () => {
  clearTimeout(timer);
  timer = null;
  if (!queue.length) return;
  const events = queue.splice(0, 25);
  // text/plain avoids a preflight; keepalive lets it finish while leaving the page
  fetch(`${API_URL}/insights/collect`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ ...envelope, events }),
    keepalive: true,
    credentials: "omit",
  }).catch(() => {});
  if (queue.length) flush();
};

export const track = (type, data = {}) => {
  try {
    if (isExcluded()) return;
    const session = currentSession();
    if (envelope && envelope.sessionId !== session.id) flush();
    envelope = {
      visitorId: visitorId(),
      sessionId: session.id,
      source: session.source,
      medium: session.medium,
      campaign: session.campaign,
    };
    queue.push({ path: window.location.pathname, ...data, type });
    if (type === "purchase" || queue.length >= 20) flush();
    else if (!timer) timer = setTimeout(flush, 2000);
  } catch {
    /* tracking must never break the store */
  }
};

export const trackProductView = (product) => {
  if (!product) return;
  track("product_view", {
    productId: product._id || product.id,
    productName: product.name,
    value: product.price,
  });
};

/** A cart line being added or removed, with the number of units involved */
export const trackCart = (type, line, quantity) => {
  const extras = (line.selectedOptions || []).reduce((sum, o) => sum + (Number(o.priceDelta) || 0), 0);
  track(type, {
    productId: String(line.productId || ""),
    productName: line.name,
    quantity,
    value: ((Number(line.price) || 0) + extras) * quantity,
  });
};

const clickText = (element) => {
  let label =
    element.getAttribute("data-track") ||
    element.getAttribute("aria-label") ||
    element.textContent ||
    element.getAttribute("title") ||
    element.querySelector("img")?.alt ||
    "";
  label = label.replace(/\s+/g, " ").trim();
  const name = storedUser()?.name;
  if (name) label = label.split(name).join("[name]");
  return label.slice(0, 60);
};

let listening = false;

/** Count clicks on links and buttons, and send anything pending when the page is hidden */
export const startTracking = () => {
  if (!inBrowser || listening) return;
  listening = true;
  document.addEventListener(
    "click",
    (event) => {
      const element = event.target.closest?.('a, button, [role="button"], [data-track]');
      if (!element) return;
      const label = clickText(element);
      if (label) track("click", { label });
    },
    true
  );
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("pagehide", flush);
};
