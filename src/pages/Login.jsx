import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { LogoMark } from "../components/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/account";

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page py-16 sm:py-20 flex justify-center">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <LogoMark to="/" size="compact" />
        </div>
        <div className="card rounded-2xl p-8">
          <h1 className="font-display text-2xl text-center">Welcome back</h1>
          <p className="mt-1 text-sm text-espresso-400 text-center">Log in to track orders and save your details.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-espresso-500">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field mt-1.5" placeholder="you@email.com" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-espresso-500">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-ribbon-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field mt-1.5" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : "Log In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-espresso-400">
            New here? <Link to="/register" className="text-ribbon-600 font-medium">Create an account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
