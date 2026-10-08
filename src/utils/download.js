import { api } from "../api/client";

/**
 * Download a file from the API with the session cookie (invoices, exports,
 * print files) and save it under the name the server gives it.
 * Resolves with the axios response so callers can read headers.
 */
export const downloadFromApi = async (path, { params, fallbackName = "download" } = {}) => {
  const res = await api.get(path, { params, responseType: "blob" });
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
  return res;
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

/** Download an order's GST invoice PDF */
export const downloadInvoice = (orderId) => downloadFromApi(`/orders/${orderId}/invoice`, { fallbackName: "invoice.pdf" });

/** Orders get an invoice once placed: cash on delivery, or paid online */
export const hasInvoice = (order) => Boolean(order) && !order.awaitingPayment && (order.paymentMethod === "cod" || order.isPaid);
