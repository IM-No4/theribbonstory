import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { LogoMark } from "../components/Logo";
import AuthShowcase from "../components/AuthShowcase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your registered email address");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email: email.trim() });
      toast.success(data?.message || "Reset link sent!");
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to dispatch reset email");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen max-h-screen w-full bg-white grid grid-cols-1 lg:grid-cols-2 font-body antialiased overflow-hidden selection:bg-rose-100 selection:text-rose-800">
      {/* LEFT COLUMN */}
      <div className="flex flex-col justify-between p-4 sm:p-6 lg:p-8 xl:p-12 bg-white relative z-20 h-full max-h-screen overflow-y-auto lg:overflow-hidden">
        <div className="flex items-center justify-between w-full">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition py-1 px-2.5 rounded-full hover:bg-slate-50"
          >
            <ArrowLeft size={14} />
            <span>Storefront</span>
          </Link>
        </div>

        <div className="my-auto py-2 max-w-sm mx-auto w-full">
          <div className="flex flex-col items-center justify-center mb-6">
            <LogoMark to="/" size="compact" className="mb-2 max-h-12" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Reset Password
            </h1>
            <p className="text-xs text-slate-400 mt-1 text-center">
              Enter your email to receive a recovery link
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={submit} className="space-y-3">
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-[#F4F5F8] border border-transparent px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-ribbon-500 focus:ring-2 focus:ring-rose-100 focus:outline-hidden transition-all duration-200"
                  placeholder="Email"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-ribbon-500 hover:bg-ribbon-600 active:scale-[0.99] text-white font-bold text-xs sm:text-sm tracking-wide py-3 px-4 shadow-md shadow-rose-500/20 hover:shadow-rose-500/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-1"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin text-white" />
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-2.5 py-2 text-center">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 size={22} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Check your inbox</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We&apos;ve sent a password reset link to <strong>{email}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-ribbon-600 hover:underline cursor-pointer"
              >
                Try another email
              </button>
            </div>
          )}

          <p className="mt-5 text-center text-xs text-slate-500">
            Remember your password?{" "}
            <Link to="/login" className="text-ribbon-600 font-bold hover:underline">
              Login
            </Link>
          </p>
        </div>

        <div className="text-center text-[10px] sm:text-[11px] text-slate-400 pt-2">
          © 2026 The Ribbon Story. All rights reserved.
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="hidden lg:flex w-full h-full max-h-screen bg-white relative overflow-hidden border-l border-slate-100/80">
        <AuthShowcase />
      </div>
    </div>
  );
}
