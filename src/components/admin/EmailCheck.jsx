import { useState } from "react";
import { Mail, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { api } from "../../api/client";

/** Sends a test email to the signed-in admin to confirm the mail settings work */
export default function EmailCheck() {
  const [state, setState] = useState({ busy: false, result: null });

  const send = async () => {
    setState({ busy: true, result: null });
    try {
      const { data } = await api.post("/admin/test-email");
      setState({ busy: false, result: data });
    } catch (err) {
      setState({
        busy: false,
        result: { ok: false, message: err.response?.data?.message || "Couldn't reach the server. Please try again." },
      });
    }
  };

  const { busy, result } = state;
  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
      <div className="flex items-center gap-2">
        <Mail size={16} className="text-rose-400" />
        <div className="text-xs font-semibold text-white">Customer emails</div>
      </div>
      <p className="text-[11px] text-slate-400">
        Order confirmations, shipping updates and studio alerts go out through your mail server. Send yourself a test to check it works.
      </p>
      <button
        type="button"
        onClick={send}
        disabled={busy}
        className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-60 border border-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-2 transition cursor-pointer"
      >
        {busy ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
        <span>{busy ? "Sending…" : "Send test email"}</span>
      </button>
      {result && (
        <p role="status" className={`text-[11px] flex items-start gap-1.5 ${result.ok ? "text-emerald-400" : "text-amber-300"}`}>
          {result.ok ? <CheckCircle2 size={13} className="shrink-0 mt-px" /> : <AlertTriangle size={13} className="shrink-0 mt-px" />}
          <span>{result.message}</span>
        </p>
      )}
    </div>
  );
}
