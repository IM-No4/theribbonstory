import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { downloadInvoice, blobErrorMessage, hasInvoice } from "../utils/download";


/** "Invoice" button that downloads the order's GST invoice PDF */
export default function InvoiceButton({ order, className = "", label = "Invoice" }) {
  const [busy, setBusy] = useState(false);
  if (!hasInvoice(order)) return null;

  const download = async () => {
    setBusy(true);
    try {
      await downloadInvoice(order._id);
    } catch (err) {
      toast.error(await blobErrorMessage(err, "Couldn't download the invoice. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" onClick={download} disabled={busy} className={`inline-flex items-center gap-1.5 disabled:opacity-60 ${className}`}>
      {busy ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
      <span>{label}</span>
    </button>
  );
}
