import { NOTE_MAX } from "../hooks/useKeepsakePreview";

/** Optional note the AI uses for the customer's next 3D design */
export default function DesignNoteField({ preview, className = "", inputClassName = "" }) {
  const id = "design-note";
  const hasDesign = preview.status === "ready";
  return (
    <div className={className}>
      <label htmlFor={id} className="flex items-baseline justify-between text-xs font-bold text-slate-700 mb-1">
        <span>Anything to add to your design?</span>
        <span className="text-[10px] font-normal text-slate-400">Optional</span>
      </label>
      <input
        id={id}
        type="text"
        value={preview.note}
        maxLength={NOTE_MAX}
        onChange={(e) => preview.setNote(e.target.value)}
        disabled={preview.busy}
        placeholder="e.g. add a little crown, make the dog's collar red"
        className={`input-field text-xs py-2 ${inputClassName}`}
      />
      <p className="mt-1 text-[10px] text-slate-400">
        {hasDesign ? "Change it and tap “Try another design” to use it." : "Used when we create your 3D design."}
        {preview.note.length > NOTE_MAX - 40 && ` ${NOTE_MAX - preview.note.length} characters left.`}
      </p>
    </div>
  );
}
