import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Box, Layers } from "lucide-react";
import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import ProductCustomizerModal from "../components/ProductCustomizerModal";
import QuickViewModal from "../components/QuickViewModal";

export default function ThreeDKeepsakes() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [active3DModel, setActive3DModel] = useState("pet");

  useEffect(() => {
    let active = true;
    api
      .get("/products", { params: { category: "3d-keepsakes" } })
      .then(({ data }) => {
        if (active) setProducts(data.products || []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-cream-50 min-h-screen">
      {/* 3D Hero Banner */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-blush-100/60 via-cream-50 to-cream-50">
        <div className="container-page text-center max-w-3xl relative z-10">
          <span className="section-eyebrow">Signature Innovation</span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-display font-bold text-burgundy-900 leading-tight">
            Your memories, in 3D.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-espresso-500 leading-relaxed">
            A photo captures the moment. A keepsake lets you hold onto it. Meticulously sculpted and printed to bring your favorite faces and memories to physical life.
          </p>

          {/* Interactive 3D Model Visualizer Switcher */}
          <div className="mt-10 p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-blush-200 shadow-xl max-w-xl mx-auto">
            <div className="flex justify-center gap-2 mb-6">
              {[
                { id: "pet", label: "3D Pet Keepsake" },
                { id: "couple", label: "3D Couple Figurine" },
                { id: "family", label: "3D Family Sculpt" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActive3DModel(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                    active3DModel === tab.id
                      ? "bg-burgundy-900 text-white shadow-soft"
                      : "bg-blush-50 text-burgundy-900 hover:bg-blush-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Simulated 3D Rotating Preview Stage */}
            <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-cream-100 via-blush-50 to-peach-50 border border-blush-100 flex items-center justify-center overflow-hidden group">
              <motion.div
                key={active3DModel}
                initial={{ opacity: 0, scale: 0.9, rotateY: -20 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center"
              >
                {active3DModel === "pet" && (
                  <div className="text-center space-y-2">
                    <div className="h-32 w-32 mx-auto rounded-full bg-white p-2 shadow-lg border-2 border-ribbon-300 flex items-center justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80"
                        alt="3D Pet"
                        className="h-full w-full object-cover rounded-full"
                      />
                    </div>
                    <span className="font-display font-semibold text-burgundy-900 text-base block">
                      Bruno — Golden Retriever 3D Magnet
                    </span>
                    <span className="text-xs text-ribbon-500 font-medium">₹599 • Hand Sculpted</span>
                  </div>
                )}
                {active3DModel === "couple" && (
                  <div className="text-center space-y-2">
                    <div className="h-32 w-32 mx-auto rounded-full bg-white p-2 shadow-lg border-2 border-ribbon-300 flex items-center justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80"
                        alt="3D Couple"
                        className="h-full w-full object-cover rounded-full"
                      />
                    </div>
                    <span className="font-display font-semibold text-burgundy-900 text-base block">
                      Ananya &amp; Kabir — Couple Sculpt
                    </span>
                    <span className="text-xs text-ribbon-500 font-medium">₹699 • Anniversary Special</span>
                  </div>
                )}
                {active3DModel === "family" && (
                  <div className="text-center space-y-2">
                    <div className="h-32 w-32 mx-auto rounded-full bg-white p-2 shadow-lg border-2 border-ribbon-300 flex items-center justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=400&q=80"
                        alt="3D Family"
                        className="h-full w-full object-cover rounded-full"
                      />
                    </div>
                    <span className="font-display font-semibold text-burgundy-900 text-base block">
                      The Sharma Family — Portrait Sculpt
                    </span>
                    <span className="text-xs text-ribbon-500 font-medium">₹899 • Multi-figure</span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Products Grid */}
      <section className="py-16">
        <div className="container-page">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-display text-3xl font-bold text-burgundy-900">
              Explore 3D Keepsakes Collection
            </h2>
            <p className="text-sm text-espresso-400 mt-2">
              Each 3D keepsake is individually designed from your photo and finished by hand.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-blush-100 animate-pulse" />
                ))
              : products.map((p, i) => (
                  <ProductCard
                    key={p._id || p.slug}
                    product={p}
                    index={i}
                    onQuickView={setQuickViewProduct}
                    onPersonalize={setSelectedProduct}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship Banner */}
      <section className="py-16 bg-white border-y border-blush-200">
        <div className="container-page grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="h-14 w-14 rounded-full bg-blush-100 text-ribbon-600 mx-auto flex items-center justify-center mb-4">
              <Box size={24} />
            </div>
            <h3 className="font-display font-semibold text-lg text-burgundy-900">Precision 3D Sculpting</h3>
            <p className="text-xs text-espresso-400 mt-2 leading-relaxed">
              We convert your 2D photo into a high-definition 3D mesh model capturing distinct contours and features.
            </p>
          </div>

          <div className="p-6">
            <div className="h-14 w-14 rounded-full bg-blush-100 text-ribbon-600 mx-auto flex items-center justify-center mb-4">
              <Layers size={24} />
            </div>
            <h3 className="font-display font-semibold text-lg text-burgundy-900">Eco-Polymer Finish</h3>
            <p className="text-xs text-espresso-400 mt-2 leading-relaxed">
              Printed with durable, non-toxic bio-polymers and hand-sealed with a satin protective coating.
            </p>
          </div>

          <div className="p-6">
            <div className="h-14 w-14 rounded-full bg-blush-100 text-ribbon-600 mx-auto flex items-center justify-center mb-4">
              <Sparkles size={24} />
            </div>
            <h3 className="font-display font-semibold text-lg text-burgundy-900">Strong Neodymium Magnet</h3>
            <p className="text-xs text-espresso-400 mt-2 leading-relaxed">
              Embedded with rare-earth magnets that hold securely on any metallic fridge, locker, or display board.
            </p>
          </div>
        </div>
      </section>

      {/* Modals */}
      <ProductCustomizerModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onOpenCustomizer={setSelectedProduct}
      />
    </div>
  );
}
