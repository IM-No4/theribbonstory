import { useState } from "react";
import { Send } from "lucide-react";
import toast from "react-hot-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("You're on the list! Watch your inbox for a welcome gift.");
    setEmail("");
  };

  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[2rem] bg-ribbon-gradient px-6 py-14 sm:px-16 sm:py-16 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.12),transparent_40%)]" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cream-200">Join our circle</p>
            <h2 className="mt-3 text-3xl sm:text-4xl text-cream-50">Get 10% off your first story</h2>
            <p className="mt-3 text-cream-100/85 text-sm max-w-md mx-auto">
              Sign up for early access to new collections, gifting ideas, and seasonal offers.
            </p>
            <form onSubmit={submit} className="mt-7 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 rounded-full border border-cream-50/30 bg-cream-50/10 px-5 py-3 text-sm text-cream-50 placeholder:text-cream-100/60 focus:outline-none focus:ring-2 focus:ring-cream-50/40"
              />
              <button type="submit" className="btn-gold justify-center">
                Subscribe <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
