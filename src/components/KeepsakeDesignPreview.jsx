import { RefreshCw, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { assetUrl } from "../api/client";

/**
 * The customer's cute 3D design: the generated preview, earlier takes to pick
 * from, and a retry. Whatever is selected here is what gets 3D printed.
 */
export default function KeepsakeDesignPreview({ preview, className = "" }) {
  const { status, approvedPreview, attempts, selected, attemptsLeft, regenerating, error, localPhoto } = preview;

  if (status === "idle") return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative aspect-square w-full max-w-xs mx-auto rounded-2xl overflow-hidden bg-white border-2 border-rose-200 shadow-md flex items-center justify-center">
        {status === "generating" ? (
          <>
            {localPhoto && <img src={localPhoto} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 blur-xs" />}
            <div className="relative text-center p-4 space-y-2" role="status">
              <Sparkles className="animate-spin text-ribbon-500 mx-auto" size={28} />
              <p className="text-xs font-bold text-burgundy-900">Creating your cute 3D design…</p>
              <p className="text-[11px] text-espresso-400">This takes about 15–30 seconds</p>
            </div>
          </>
        ) : status === "ready" ? (
          <>
            <img src={assetUrl(approvedPreview)} alt="Your 3D keepsake design" className={`w-full h-full object-contain transition ${regenerating ? "opacity-40" : ""}`} />
            {regenerating && (
              <div className="absolute inset-0 flex items-center justify-center" role="status">
                <span className="px-3 py-1.5 rounded-full bg-white/90 text-xs font-bold text-burgundy-900 flex items-center gap-1.5 shadow">
                  <RefreshCw size={13} className="animate-spin" /> Creating another design…
                </span>
              </div>
            )}
          </>
        ) : (
          localPhoto && <img src={localPhoto} alt="Your photo" className="w-full h-full object-cover" />
        )}
      </div>

      {status === "ready" && (
        <>
          {attempts.length > 1 && (
            <div className="flex items-center justify-center gap-2" role="radiogroup" aria-label="Choose your design">
              {attempts.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  role="radio"
                  aria-checked={i === selected}
                  aria-label={`Design ${i + 1}`}
                  onClick={() => preview.select(i)}
                  disabled={regenerating}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 bg-white transition ${i === selected ? "border-ribbon-500 ring-2 ring-ribbon-500/30" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <img src={assetUrl(url)} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-px" />
            <span>
              <strong>This exact design is what we&apos;ll 3D print</strong> and hand-paint for you.
              {attempts.length > 1 && " Tap the one you like best."}
            </span>
          </div>

          <button
            type="button"
            onClick={preview.regenerate}
            disabled={regenerating || attemptsLeft <= 0}
            className="w-full py-2 rounded-xl border border-rose-200 bg-white text-xs font-bold text-ribbon-600 hover:bg-rose-50 transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={13} />
            {attemptsLeft > 0
              ? `Try another design (${attemptsLeft} left)`
              : "No more new designs for this photo — upload another photo to start again"}
          </button>
        </>
      )}

      {status === "unavailable" && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
          <AlertCircle size={15} className="text-amber-600 shrink-0 mt-px" />
          <span>
            Our design preview is taking a break right now. Your photo is saved: you can still order and our studio
            artists will sculpt your keepsake from it, or try uploading again in a few minutes.
          </span>
        </div>
      )}

      {error && (
        <p className="flex items-start gap-1.5 text-[11px] text-rose-700" role="alert">
          <AlertCircle size={13} className="shrink-0 mt-px" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
