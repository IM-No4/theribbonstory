import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Loader2, Sparkles, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api/client";
import SectionHeading from "../components/SectionHeading";
import { useSeo } from "../utils/seo";

export default function Contact() {
  useSeo({
    title: "Contact Us | The Ribbon Story",
    description:
      "Questions about an order, custom 3D keepsakes, or bespoke gifting? Get in touch with The Ribbon Story studio team.",
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await api.post("/contact", form);
      toast.success(data.message || "Message sent — we'll reply within 24 hours.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container-page py-6 sm:py-12 lg:py-16">
      <SectionHeading
        eyebrow="Say hello"
        title="We'd love to hear from you"
        subtitle="Questions about an order, a custom keepsake, or want to say hi? Reach out anytime."
      />

      <div className="mt-6 sm:mt-8 lg:mt-10 grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-4 sm:gap-6 lg:gap-10 items-start max-w-5xl mx-auto">
        {/* Contact Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-2.5 sm:space-y-3"
        >
          {/* Email */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(60,40,30,0.02)] flex items-center gap-3.5 hover:border-rose-200 transition">
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Mail size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Email
              </p>
              <a
                href="mailto:hello@theribbonstory.com"
                className="text-xs sm:text-sm font-semibold text-stone-900 hover:text-rose-600 truncate block transition"
              >
                hello@theribbonstory.com
              </a>
            </div>
          </div>

          {/* Phone & WhatsApp */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(60,40,30,0.02)] flex items-center gap-3.5 hover:border-rose-200 transition">
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Phone size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Phone
              </p>
              <a
                href="tel:+917905275048"
                className="text-xs sm:text-sm font-semibold text-stone-900 hover:text-rose-600 block transition"
              >
                +91 79052 75048
              </a>
            </div>
          </div>

          {/* Studio Location */}
          <div className="rounded-2xl border border-stone-200/90 bg-white p-3.5 sm:p-4 shadow-[0_2px_10px_rgba(60,40,30,0.02)] flex items-center gap-3.5 hover:border-rose-200 transition">
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <MapPin size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Studio
              </p>
              <p className="text-xs sm:text-sm text-stone-600 leading-snug">
                Shipping pan-India, made with love in our studio.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={submit}
          className="rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-6 shadow-[0_2px_12px_rgba(60,40,30,0.025)] space-y-3 sm:space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <input
              required
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
            />
            <input
              required
              type="email"
              placeholder="Your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
            />
          </div>

          <textarea
            required
            rows={4}
            placeholder="How can we help?"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="input-field resize-none"
          />

          <button
            type="submit"
            disabled={sending}
            className="btn-primary w-full justify-center py-3 text-xs sm:text-sm font-bold cursor-pointer"
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span>Send Message</span>
                <Send size={14} />
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
