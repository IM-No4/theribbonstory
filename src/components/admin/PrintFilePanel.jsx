import { useRef, useState } from "react";
import { Box, Download, Trash2, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "../../api/client";
import { PRINT_FILE_ACCEPT, blobErrorMessage, downloadPrintFile, formatBytes } from "../../utils/printFiles";

/**
 * Admin-only production print file (STL/3MF/OBJ) for a product.
 * Stored privately on the server and never shown to customers.
 */
export default function PrintFilePanel({ productId, printFile, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);

  if (!productId) {
    return (
      <p className="text-[11px] text-slate-500">
        Save the product first, then edit it to attach its 3D print file.
      </p>
    );
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    setBusy(true);
    setProgress(0);
    try {
      const { data } = await api.post(`/products/${productId}/print-file`, form, {
        onUploadProgress: (p) => p.total && setProgress(Math.round((p.loaded / p.total) * 100)),
      });
      onChange?.(data.printFile);
      toast.success("Print file attached");
    } catch (err) {
      toast.error(err.response?.data?.message || "Print file upload failed");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const handleDownload = async () => {
    setBusy(true);
    try {
      await downloadPrintFile(productId, printFile?.originalName);
    } catch (err) {
      toast.error(await blobErrorMessage(err, "Could not download print file"));
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Remove this product's print file?")) return;
    setBusy(true);
    try {
      await api.delete(`/products/${productId}/print-file`);
      onChange?.(null);
      toast.success("Print file removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove print file");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 space-y-2">
      {printFile ? (
        <div className="flex items-center gap-2 text-slate-200">
          <Box size={14} className="text-emerald-400 shrink-0" />
          <span className="font-mono truncate">{printFile.originalName}</span>
          <span className="text-slate-500 shrink-0">{formatBytes(printFile.size)}</span>
        </div>
      ) : (
        <p className="text-slate-500">No print file attached yet.</p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          <Upload size={13} />
          <span>{progress !== null ? `Uploading ${progress}%` : printFile ? "Replace" : "Upload STL / 3MF / OBJ"}</span>
        </button>
        {printFile && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-900/40 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Download size={13} />
              <span>Download</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleRemove}
              className="px-3 py-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-900/40 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Remove</span>
            </button>
          </>
        )}
        <input ref={inputRef} type="file" accept={PRINT_FILE_ACCEPT} className="hidden" onChange={handleUpload} />
      </div>
      <p className="text-[10px] text-slate-500">
        Private to the studio team — never shown to customers. Max 200 MB.
      </p>
    </div>
  );
}
