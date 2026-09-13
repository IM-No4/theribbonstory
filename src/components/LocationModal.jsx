import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Check, Search, Sparkles, Building2, ShieldCheck, Clock } from "lucide-react";
import { useLocationStore } from "../store/locationStore";

export default function LocationModal() {
  const { isOpen, closeModal, location, popularCities, setLocation } = useLocationStore();
  const [inputPincode, setInputPincode] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handlePincodeSubmit = (e) => {
    e.preventDefault();
    const pin = inputPincode.trim();
    if (!/^\d{6}$/.test(pin)) {
      setError("Please enter a valid 6-digit Indian PIN code");
      return;
    }
    setError("");
    setLocation({
      city: `Pincode ${pin}`,
      pincode: pin,
      state: "India",
      expressAvailable: true,
    });
  };

  const handleSelectCity = (city) => {
    setLocation(city);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="absolute inset-0 bg-espresso-700/60 backdrop-blur-xs"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-blush-200 z-10"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-burgundy-900 via-burgundy-800 to-ribbon-700 px-6 py-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-xs">
                <MapPin size={20} className="text-blush-200" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">Select Delivery Location</h3>
                <p className="text-xs text-blush-200">Get accurate delivery dates & express slots</p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Pincode Input */}
            <form onSubmit={handlePincodeSubmit} className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-espresso-500">
                Enter Pincode
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 560001 or 400001"
                    value={inputPincode}
                    onChange={(e) => {
                      setInputPincode(e.target.value.replace(/\D/g, ""));
                      setError("");
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-espresso-200 text-sm font-medium text-espresso-700 placeholder:text-espresso-300 focus:outline-none focus:border-ribbon-500 focus:ring-2 focus:ring-blush-200 tracking-wider"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-burgundy-900 hover:bg-burgundy-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  Apply
                </button>
              </div>
              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            </form>

            {/* Popular Cities */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-espresso-500">
                  Popular Delivery Cities
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <Clock size={12} /> Same Day Delivery Available
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {popularCities.map((city) => {
                  const isSelected = (location?.city || location?.name) === city.name;
                  return (
                    <button
                      key={city.name}
                      onClick={() => handleSelectCity(city)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 ${
                        isSelected
                          ? "border-ribbon-500 bg-blush-100 text-burgundy-900 font-semibold shadow-xs"
                          : "border-espresso-100/80 bg-cream-50/60 text-espresso-600 hover:border-ribbon-300 hover:bg-white"
                      }`}
                    >
                      <Building2 size={18} className={isSelected ? "text-ribbon-600" : "text-espresso-400"} />
                      <span className="text-xs font-medium mt-1">{city.name}</span>
                      <span className="text-[10px] text-espresso-400">{city.pincode}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Location Pill */}
            {location && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-950">
                      Delivering to: {location.city || location.name} ({location.pincode})
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      ⚡ Express delivery &amp; standard slots active
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
