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
    const saved = localStorage.getItem("ribbon_delivery_location");
    if (saved) return JSON.parse(saved);
  } catch (e) {
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
    } catch (e) {}
    set({ location: loc, isOpen: false });
  },

  getEstimatedDelivery: () => {
    const { location } = get();
    if (location?.expressAvailable) {
      return "Today / Tomorrow (Express)";
    }
    return "2-4 Business Days";
  },
}));
