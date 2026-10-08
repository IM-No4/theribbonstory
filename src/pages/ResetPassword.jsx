import { useState } from "react";
import { Link, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { Loader2, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { LogoMark } from "../components/Logo";
import AuthShowcase from "../components/AuthShowcase";
import { useSeo } from "../utils/seo";

export default function ResetPassword() {
  useSeo({ title: "Reset Password", noindex: true });
  const [params] = useSearchParams();
  const routeParams = useParams();
  const token = params.get("token") || routeParams.token || "";
  const mode = params.get("mode") || "reset";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing password reset token");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      toast.success(data?.message || "Password updated successfully!");
      // The server also signs the user in with a session cookie
      if (data?.user) setAuth(data.user);
      setSuccess(true);
      setTimeout(() => {
        navigate("/account");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password. Link may have expired.");
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
              {mode === "set" ? "Set Password" : "New Password"}
            </h1>
          </div>

          {!success ? (
            <form onSubmit={submit} className="space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-[#F4F5F8] border border-transparent pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-ribbon-500 focus:ring-2 focus:ring-rose-100 focus:outline-hidden transition-all duration-200"
                  placeholder="New Password (min 6 chars)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl bg-[#F4F5F8] border border-transparent px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-ribbon-500 focus:ring-2 focus:ring-rose-100 focus:outline-hidden transition-all duration-200"
                  placeholder="Confirm New Password"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-ribbon-500 hover:bg-ribbon-600 active:scale-[0.99] text-white font-bold text-xs sm:text-sm tracking-wide py-3 px-4 shadow-md shadow-rose-500/20 hover:shadow-rose-500/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-1"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin text-white" />
                ) : mode === "set" ? (
                  "Save & Login"
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-2.5 py-2 text-center">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 size={22} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Password Updated!</h3>
              <p className="text-xs text-slate-500">
                Redirecting to your account...
              </p>
              <Link
                to="/account"
                className="inline-flex rounded-xl bg-ribbon-500 hover:bg-ribbon-600 text-white px-4 py-2 text-xs font-bold"
              >
                Go to Account
              </Link>
            </div>
          )}

          <p className="mt-5 text-center text-xs text-slate-500">
            <Link to="/login" className="text-ribbon-600 font-bold hover:underline">
              Return to Login
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
