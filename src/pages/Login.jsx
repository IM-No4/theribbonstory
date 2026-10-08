import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { LogoMark } from "../components/Logo";
import AuthShowcase from "../components/AuthShowcase";
import { triggerGoogleSignIn } from "../utils/googleAuth";
import { useSeo } from "../utils/seo";

export default function Login() {
  useSeo({ title: "Sign In", noindex: true });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const login = useAuthStore((s) => s.login);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/account";

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter your email and password");
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    triggerGoogleSignIn({
      onSuccess: async (payload) => {
        try {
          const res = await loginWithGoogle(payload);
          toast.success(res.message || "Signed in with Google!");
          navigate(from, { replace: true });
        } catch (err) {
          toast.error(err.response?.data?.message || "Google sign-in failed");
        } finally {
          setGoogleLoading(false);
        }
      },
      onError: (err) => {
        setGoogleLoading(false);
        toast.error(err?.message || "Google authentication was cancelled or unavailable.");
      },
    });
  };

  return (
    <div className="h-screen max-h-screen w-full bg-white grid grid-cols-1 lg:grid-cols-2 font-body antialiased overflow-hidden selection:bg-rose-100 selection:text-rose-800">
      {/* LEFT COLUMN: Clean Minimal Form Locked within 100vh */}
      <div className="flex flex-col justify-between p-4 sm:p-6 lg:p-8 xl:p-12 bg-white relative z-20 h-full max-h-screen overflow-y-auto lg:overflow-hidden">
        {/* Top Return link */}
        <div className="flex items-center justify-between w-full">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition py-1 px-2.5 rounded-full hover:bg-slate-50"
          >
            <ArrowLeft size={14} />
            <span>Storefront</span>
          </Link>
        </div>

        {/* Center Content Box */}
        <div className="my-auto py-2 max-w-sm mx-auto w-full">
          {/* Brand Logo Header */}
          <div className="flex flex-col items-center justify-center mb-4">
            <LogoMark to="/" size="compact" className="mb-2 max-h-12" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Login
            </h1>
          </div>

          {/* Real Google Sign In Button */}
          <button
            type="button"
            disabled={googleLoading || submitting}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 size={16} className="animate-spin text-slate-600" />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <span className="relative bg-white px-3 text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Or sign in with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-3">
            {/* Email Input */}
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

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-[#F4F5F8] border border-transparent pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-ribbon-500 focus:ring-2 focus:ring-rose-100 focus:outline-hidden transition-all duration-200"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="inline-flex items-center gap-1.5 text-slate-600 cursor-pointer select-none text-[11px] sm:text-xs">
                <input
                  type="checkbox"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-ribbon-500 border-slate-300 focus:ring-ribbon-500 cursor-pointer accent-ribbon-500"
                />
                <span>Keep me logged in</span>
              </label>

              <Link
                to="/forgot-password"
                className="font-medium text-ribbon-600 hover:text-ribbon-700 hover:underline text-[11px] sm:text-xs"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || googleLoading}
              className="w-full rounded-xl bg-ribbon-500 hover:bg-ribbon-600 active:scale-[0.99] text-white font-bold text-xs sm:text-sm tracking-wide py-3 px-4 shadow-md shadow-rose-500/20 hover:shadow-rose-500/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-1"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin text-white" />
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Switch to Sign Up */}
          <p className="mt-4 text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-ribbon-600 font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Minimal Footer */}
        <div className="text-center text-[10px] sm:text-[11px] text-slate-400 pt-2">
          © 2026 The Ribbon Story. All rights reserved.
        </div>
      </div>

      {/* RIGHT COLUMN: Full-Screen Abstract Geometric Pastel Art Locked to Viewport */}
      <div className="hidden lg:flex w-full h-full max-h-screen bg-white relative overflow-hidden border-l border-slate-100/80">
        <AuthShowcase />
      </div>
    </div>
  );
}
