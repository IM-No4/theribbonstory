import { useState } from "react";
import { Link, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { LogoMark } from "../components/Logo";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const routeParams = useParams();
  const token = params.get("token") || routeParams.token || "";
  const mode = params.get("mode") || "reset"; // 'reset' or 'set'

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
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      toast.success(data.message || "Password updated successfully!");
      if (data.token && data.user) {
        setAuth(data.user, data.token);
      }
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
    <div className="container-page py-16 sm:py-20 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <LogoMark to="/" size="compact" />
        </div>

        <div className="card rounded-2xl p-8 space-y-6">
          {!success ? (
            <>
              <div className="text-center space-y-1">
                <h1 className="font-display text-2xl font-bold text-burgundy-900">
                  {mode === "set" ? "Set Your Password" : "Create New Password"}
                </h1>
                <p className="text-xs text-espresso-400">
                  {mode === "set"
                    ? "Welcome to The Ribbon Story! Choose a secure password for your account."
                    : "Please enter and confirm your new password below."}
                </p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-espresso-600 block mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-10 pr-10"
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-espresso-400 hover:text-burgundy-900 transition"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-espresso-600 block mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field pl-10 pr-10"
                      placeholder="Re-enter password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full justify-center py-3 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : mode === "set" ? (
                    "Save & Log In"
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 size={30} />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-burgundy-900">
                  Password Updated!
                </h2>
                <p className="text-xs text-espresso-500 mt-1">
                  Your password has been successfully updated. Redirecting you to your account...
                </p>
              </div>
              <Link to="/account" className="btn-primary inline-flex justify-center text-xs">
                Go to Account
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
