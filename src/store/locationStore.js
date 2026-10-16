import { create } from "zustand";

const POPULAR_CITIES = [
  { city: "Bengaluru", name: "Bengaluru", pincode: "560001", state: "Karnataka", expressAvailable: true },
  { city: "Mumbai", name: "Mumbai", pincode: "400001", state: "Maharashtra", expressAvailable: true },
  { city: "Delhi NCR", name: "Delhi NCR", pincode: "110001", state: "Delhi", expressAvailable: true },
  { city: "Hyderabad", name: "Hyderabad", pincode: "500001", state: "Telangana", expressAvailable: true },
  { city: "Pune", name: "Pune", pincode: "411001", state: "Maharashtra", expressAvailable: true },
  { city: "Chennai", name: "Chennai", pincode: "600001", state: "Tamil Nadu", expressAvailable: true },
  { city: "Kolkata", name: "Kolkata", pincode: "700001", state: "West Bengal", expressAvailable: true },
  { city: "Ahmedabad", name: "Ahmedabad", pincode: "380001", state: "Gujarat", expressAvailable: true },
];

const getStoredLocation = () => {
  try {
    const savedPin = localStorage.getItem("ribbon_delivery_pincode");
    const saved = localStorage.getItem("ribbon_delivery_location");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (savedPin && parsed) parsed.pincode = savedPin;
      return parsed;
    }
    if (savedPin) {
      return {
        city: `PIN ${savedPin}`,
        pincode: savedPin,
        state: "India",
        expressAvailable: true,
      };
    }
  } catch {
    // fallback
  }
  return {
    city: "Bengaluru",
    pincode: "560001",
    state: "Karnataka",
    expressAvailable: true,
  };
};

export const useLocationStore = create((set, get) => ({
  isOpen: false,
  location: getStoredLocation(),
  popularCities: POPULAR_CITIES,
  
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
  
  setLocation: (loc) => {
    try {
      localStorage.setItem("ribbon_delivery_location", JSON.stringify(loc));
      if (loc?.pincode) {
        localStorage.setItem("ribbon_delivery_pincode", loc.pincode);
      }
    } catch {
      /* storage unavailable — keep defaults */
    }
    set({ location: loc, isOpen: false });
  },

  setPincode: (pin, details = {}) => {
    try {
      localStorage.setItem("ribbon_delivery_pincode", pin);
      const updated = {
        city: details.city || `PIN ${pin}`,
        pincode: pin,
        state: details.state || "India",
        expressAvailable: details.expressAvailable ?? true,
      };
      localStorage.setItem("ribbon_delivery_location", JSON.stringify(updated));
      set({ location: updated });
    } catch {
      /* storage error */
    }
  },

  getEstimatedDelivery: () => {
    const { location } = get();
    if (location?.expressAvailable) {
      return "Today / Tomorrow (Express)";
    }
    return "2-4 Business Days";
  },
}));
