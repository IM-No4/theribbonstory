import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api/client";
import SectionHeading from "../components/SectionHeading";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
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
    <div className="container-page py-14 sm:py-20">
      <SectionHeading eyebrow="Say hello" title="We'd love to hear from you" subtitle="Questions about an order, a custom request, or just want to say hi? Reach out." />

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10">
        <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-5">
          <div className="card rounded-2xl p-6 flex items-start gap-4">
            <Mail size={20} className="text-ribbon-500 mt-0.5" />
            <div>
              <p className="font-medium text-espresso-600">Email</p>
              <p className="text-sm text-espresso-400">hello@theribbonstory.com</p>
            </div>
          </div>
          <div className="card rounded-2xl p-6 flex items-start gap-4">
            <Phone size={20} className="text-ribbon-500 mt-0.5" />
            <div>
              <p className="font-medium text-espresso-600">Phone</p>
              <p className="text-sm text-espresso-400">+91 98765 43210</p>
            </div>
          </div>
          <div className="card rounded-2xl p-6 flex items-start gap-4">
            <MapPin size={20} className="text-ribbon-500 mt-0.5" />
            <div>
              <p className="font-medium text-espresso-600">Studio</p>
              <p className="text-sm text-espresso-400">Shipping pan-India, made with love in our studio.</p>
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          onSubmit={submit}
          className="card rounded-2xl p-7 space-y-4"
        >
          <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          <input required type="email" placeholder="Your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
          <textarea required rows={5} placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field resize-none" />
          <button type="submit" disabled={sending} className="btn-primary w-full justify-center">
            {sending ? <Loader2 size={16} className="animate-spin" /> : <>Send Message <Send size={15} /></>}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
