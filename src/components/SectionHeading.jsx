import { motion } from "framer-motion";

export default function SectionHeading({ eyebrow, title, subtitle, align = "center" }) {
  const isCenter = align === "center";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={isCenter ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}
    >
      {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
      <h2 className="mt-2 text-3xl sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-espresso-400 text-[15px] leading-relaxed">{subtitle}</p>}
    </motion.div>
  );
}
