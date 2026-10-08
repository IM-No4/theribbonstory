import { api } from "../api/client";

export const PRINT_FILE_ACCEPT = ".stl,.3mf,.obj";

export const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Download a product's private print file (admin session cookie authorises it) */
export const downloadPrintFile = async (productId, fallbackName = "model.stl") => {
  const res = await api.get(`/products/${productId}/print-file`, { responseType: "blob" });
  const disposition = res.headers["content-disposition"] || "";
  const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition);
  const name = match ? decodeURIComponent(match[1] || match[2]) : fallbackName;

  const url = URL.createObjectURL(res.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** Error message from a failed blob request (the JSON body arrives as a Blob) */
export const blobErrorMessage = async (err, fallback) => {
  try {
    const data = err.response?.data;
    if (data instanceof Blob) return JSON.parse(await data.text()).message || fallback;
    return data?.message || fallback;
  } catch {
    return fallback;
  }
};
