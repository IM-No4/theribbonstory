import { Sparkles } from "lucide-react";

/**
 * What a customer personalised on an order item: the 3D design they approved
 * (the item image is that design), the inscription and their note.
 */
export default function OrderItemPersonalization({ item, className = "" }) {
  const c = item?.customization || {};
  const inscription = [c.customName, c.customDate].filter(Boolean).join(" · ");
  const note = c.note && c.note !== c.customName ? c.note : "";
  if (!c.reference3D?.approvedPreview && !inscription && !note) return null;

  return (
    <div className={`mt-1 space-y-0.5 ${className}`}>
      {c.reference3D?.approvedPreview && (
        <p className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
          <Sparkles size={10} />
          Your approved 3D design
        </p>
      )}
      {inscription && (
        <p className="text-[11px] text-espresso-500">
          Inscription: <span className="font-semibold text-burgundy-900">{inscription}</span>
        </p>
      )}
      {note && <p className="text-[11px] italic text-espresso-400 line-clamp-2">&ldquo;{note}&rdquo;</p>}
    </div>
  );
}
