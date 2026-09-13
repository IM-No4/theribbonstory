import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { LogoMark } from "../components/Logo";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(name, email, password);
      toast.success("Account created — welcome to The Ribbon Story!");
      navigate("/account");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
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
          <h1 className="font-display text-2xl text-center">Create your account</h1>
          <p className="mt-1 text-sm text-espresso-400 text-center">Join us to customize gifts and track orders.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-espresso-500">Full name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field mt-1.5" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="text-xs font-medium text-espresso-500">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field mt-1.5" placeholder="you@email.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-espresso-500">Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field mt-1.5" placeholder="At least 6 characters" />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-espresso-400">
            Already have an account? <Link to="/login" className="text-ribbon-600 font-medium">Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
