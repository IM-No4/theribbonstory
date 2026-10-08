import { downloadFromApi, blobErrorMessage } from "./download";

export const PRINT_FILE_ACCEPT = ".stl,.3mf,.obj";

export const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Download a product's private print file (admin session cookie authorises it) */
export const downloadPrintFile = (productId, fallbackName = "model.stl") =>
  downloadFromApi(`/products/${productId}/print-file`, { fallbackName });

export { blobErrorMessage };
