import { useState } from "react";
import { RefreshCw, Sparkles, CheckCircle2, AlertCircle, Eye, Image as ImageIcon } from "lucide-react";
import { assetUrl } from "../api/client";

/**
 * Modern luxury preview card displaying the generated 3D Chibi keepsake,
 * with instant toggle between the Cute 3D model preview and customer original photo.
 */
export default function KeepsakeDesignPreview({ preview, onZoom, className = "" }) {
  const { status, approvedPreview, originalUrl, attempts, selected, attemptsLeft, regenerating, error, localPhoto } = preview;
  const [activeTab, setActiveTab] = useState("cute"); // "cute" | "original"

  if (status === "idle") return null;

  const displayOriginal = localPhoto || (originalUrl ? assetUrl(originalUrl) : null);
  const displayCute = approvedPreview ? assetUrl(approvedPreview) : null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* View Toggle Tabs if Cute preview is available */}
      {status === "ready" && displayCute && (
        <div className="flex items-center justify-center p-1 rounded-2xl bg-rose-50/80 border border-rose-100 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab("cute")}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "cute"
                ? "bg-white text-burgundy-900 shadow-xs border border-rose-200/60"
                : "text-espresso-400 hover:text-burgundy-900"
            }`}
          >
            <Sparkles size={13} className="text-ribbon-500" />
            <span>Cute 3D Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("original")}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "original"
                ? "bg-white text-burgundy-900 shadow-xs border border-rose-200/60"
                : "text-espresso-400 hover:text-burgundy-900"
            }`}
          >
            <ImageIcon size={13} />
            <span>Original Photo</span>
          </button>
        </div>
      )}

      {/* Main Preview Frame */}
      <div className="relative aspect-square w-full max-w-sm mx-auto rounded-3xl overflow-hidden bg-gradient-to-b from-white to-rose-50/30 border-2 border-rose-200/80 shadow-lg shadow-rose-950/5 flex items-center justify-center group">
        {status === "generating" ? (
          <>
            {displayOriginal && (
              <img
                src={displayOriginal}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm scale-105"
              />
            )}
            <div className="relative text-center p-6 space-y-3 z-10" role="status">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-ribbon-600 flex items-center justify-center shadow-inner animate-pulse">
                <Sparkles className="animate-spin text-ribbon-500" size={28} />
              </div>
              <div>
                <p className="font-display font-bold text-sm sm:text-base text-burgundy-900">
                  Sculpting Your 3D Keepsake…
                </p>
                <p className="text-[11px] text-espresso-400 mt-1 max-w-[200px] mx-auto">
                  Sculpting your cute 3D figurine calibrated for precision printing.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-rose-200 text-[10px] font-semibold text-ribbon-600">
                <span className="w-1.5 h-1.5 rounded-full bg-ribbon-500 animate-ping" />
                <span>Takes ~10–20 seconds</span>
              </div>
            </div>
          </>
        ) : status === "ready" ? (
          <>
            {activeTab === "cute" ? (
              <>
                <img
                  src={displayCute}
                  alt="Your cute 3D figurine design"
                  className={`w-full h-full object-contain p-2 transition duration-300 ${
                    regenerating ? "opacity-30 blur-2xs" : "hover:scale-105 cursor-pointer"
                  }`}
                  onClick={() => onZoom && onZoom(displayCute, "Your 3D Keepsake Preview")}
                />
                <button
                  type="button"
                  onClick={() => onZoom && onZoom(displayCute, "Your 3D Keepsake Preview")}
                  className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/90 hover:bg-white text-burgundy-900 border border-rose-200 shadow-sm opacity-90 hover:opacity-100 transition flex items-center gap-1.5 text-[11px] font-bold cursor-pointer"
                >
                  <Eye size={13} />
                  <span>Zoom</span>
                </button>
              </>
            ) : (
              <>
                <img
                  src={displayOriginal}
                  alt="Your original photo"
                  className="w-full h-full object-cover cursor-pointer transition hover:scale-105"
                  onClick={() => onZoom && onZoom(displayOriginal, "Customer Uploaded Photo")}
                />
                <button
                  type="button"
                  onClick={() => onZoom && onZoom(displayOriginal, "Customer Uploaded Photo")}
                  className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/90 hover:bg-white text-burgundy-900 border border-rose-200 shadow-sm opacity-90 hover:opacity-100 transition flex items-center gap-1.5 text-[11px] font-bold cursor-pointer"
                >
                  <Eye size={13} />
                  <span>Zoom Photo</span>
                </button>
              </>
            )}

            {regenerating && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20" role="status">
                <span className="px-4 py-2 rounded-2xl bg-white text-xs font-bold text-burgundy-900 flex items-center gap-2 shadow-md border border-rose-100">
                  <RefreshCw size={14} className="animate-spin text-ribbon-500" />
                  <span>Generating new variation…</span>
                </span>
              </div>
            )}
          </>
        ) : (
          displayOriginal && <img src={displayOriginal} alt="Your photo" className="w-full h-full object-cover" />
        )}
      </div>

      {status === "ready" && (
        <div className="space-y-3">
          {/* Multiple Variations Strip (if regenerated) */}
          {attempts.length > 1 && (
            <div className="space-y-1.5">
              <span className="block text-center text-[10px] font-bold uppercase tracking-wider text-espresso-400">
                Choose Preferred 3D Variation ({attempts.length})
              </span>
              <div className="flex items-center justify-center gap-2" role="radiogroup" aria-label="Choose your design">
                {attempts.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    role="radio"
                    aria-checked={i === selected}
                    aria-label={`Design variation ${i + 1}`}
                    onClick={() => {
                      preview.select(i);
                      setActiveTab("cute");
                    }}
                    disabled={regenerating}
                    className={`w-14 h-14 rounded-2xl overflow-hidden border-2 bg-white transition duration-200 p-1 cursor-pointer ${
                      i === selected
                        ? "border-ribbon-500 ring-3 ring-ribbon-500/20 shadow-xs scale-105"
                        : "border-rose-100 hover:border-rose-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={assetUrl(url)} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Guarantee Pill */}
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-[11px] text-emerald-900 shadow-2xs">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">This exact cute design will be saved with your order!</p>
              <p className="text-emerald-700 mt-0.5 text-[10.5px]">
                Our 3D studio will use this image to sculpt your precise 3D model and print it on precision multi-color 3D printers.
              </p>
            </div>
          </div>

          {/* Variation Retry CTA */}
          <button
            type="button"
            onClick={preview.regenerate}
            disabled={regenerating || attemptsLeft <= 0}
            className="w-full py-2.5 rounded-2xl border border-rose-200 bg-white hover:bg-rose-50 text-xs font-bold text-ribbon-600 transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={13} className={regenerating ? "animate-spin" : ""} />
            <span>
              {attemptsLeft > 0
                ? `Generate Another Variation (${attemptsLeft} remaining)`
                : "Maximum variations reached for this photo"}
            </span>
          </button>
        </div>
      )}

      {status === "unavailable" && (
        <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-burgundy-900">
          <CheckCircle2 size={16} className="text-ribbon-500 shrink-0 mt-0.5" />
          <span>
            Your photo is securely stored. Our studio craftsmen will sculpt and calibrate your keepsake directly from your photograph!
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700" role="alert">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
