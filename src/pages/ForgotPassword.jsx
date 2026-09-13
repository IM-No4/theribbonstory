import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { LogoMark } from "../components/Logo";

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
      toast.success(data.message || "Reset link sent!");
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to dispatch reset email");
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
          {!submitted ? (
            <>
              <div className="text-center space-y-1">
                <h1 className="font-display text-2xl font-bold text-burgundy-900">
                  Forgot Password?
                </h1>
                <p className="text-xs text-espresso-400">
                  No worries! Enter your account email and we'll send you a secure link to reset your password.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-espresso-600 block mb-1.5">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="you@email.com"
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
                  ) : (
                    "Send Password Reset Link"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 size={30} />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-burgundy-900">
                  Check Your Inbox
                </h2>
                <p className="text-xs text-espresso-500 mt-1 leading-relaxed">
                  We've sent a password reset link to <strong>{email}</strong>. Please click the link within 1 hour to set a new password.
                </p>
              </div>

              <div className="p-3 bg-cream-50 rounded-xl border border-blush-200 text-[11px] text-espresso-400">
                Didn't see it? Please check your spam/promotions folder or click below to retry.
              </div>

              <button
                onClick={() => setSubmitted(false)}
                className="text-xs font-semibold text-ribbon-600 hover:underline cursor-pointer"
              >
                Send to a different email address
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-blush-100 flex items-center justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-espresso-500 hover:text-burgundy-900 transition"
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
