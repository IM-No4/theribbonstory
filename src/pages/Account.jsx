import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  LogOut,
  User,
  Loader2,
  ChevronRight,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
  Truck,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Clock,
  Settings,
  RotateCcw,
  AlertTriangle,
  X,
  Heart,
  Gift,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { api, assetUrl } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useWishlistStore } from "../store/wishlistStore";
import { useCartStore, productToCartItem } from "../store/cartStore";

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function Account() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "orders";

  const { user, logout, isAuthenticated } = useAuthStore();
  const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlistStore();
  const { addItem: addToCart, openCart } = useCartStore();

  const [activeTab, setActiveTab] = useState(initialTab); // "orders", "wishlist", "addresses", "profile"
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["orders", "wishlist", "addresses", "profile"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Address Modal
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Profile Edit
  const [profileName, setProfileName] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Cancel & Refund Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("Ordered by mistake");
  const [cancelling, setCancelling] = useState(false);

  const fetchUserData = async () => {
    try {
      const [orderRes, meRes] = await Promise.all([
        api.get("/orders/my"),
        api.get("/auth/me"),
      ]);
      setOrders(orderRes.data.orders || []);
      setAddresses(meRes.data.user?.addresses || []);
      setProfileName(meRes.data.user?.name || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCancellation = async (e) => {
    if (e) e.preventDefault();
    if (!cancelModalOrder) return;

    setCancelling(true);
    try {
      const { data } = await api.post(`/orders/${cancelModalOrder._id}/cancel`, {
        reason: cancelReason,
      });

      toast.success(data.message || "Cancellation & refund request submitted!");
      setCancelModalOrder(null);
      fetchUserData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit cancellation request");
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: "/account" } });
      return;
    }
    fetchUserData();
  }, [isAuthenticated, navigate]);

  const [pincodeLoading, setPincodeLoading] = useState(false);

  const handlePincodeLookup = async (pincodeVal) => {
    const cleanPin = pincodeVal.replace(/\D/g, "").slice(0, 6);
    setNewAddress((prev) => ({ ...prev, postalCode: cleanPin }));

    if (cleanPin.length === 6) {
      setPincodeLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
        const data = await res.json();
        if (data?.[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          setNewAddress((prev) => ({
            ...prev,
            city: po.District || po.Division || po.Block || prev.city,
            state: po.State || prev.state,
          }));
          toast.success(`Location detected: ${po.District}, ${po.State}`);
        }
      } catch (err) {
        console.warn("Pincode lookup error", err);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.postalCode || !newAddress.phone) {
      toast.error("Please fill all required address fields");
      return;
    }

    setSavingAddress(true);
    try {
      const { data } = await api.post("/auth/address", newAddress);
      setAddresses(data.addresses || []);
      toast.success("Address added successfully!");
      setAddressModalOpen(false);
      setNewAddress({
        label: "Home",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        phone: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add address");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Are you sure you want to remove this address?")) return;
    try {
      const { data } = await api.delete(`/auth/address/${addressId}`);
      setAddresses(data.addresses || []);
      toast.success("Address deleted");
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put("/auth/profile", {
        name: profileName,
        password: profilePassword || undefined,
        currentPassword: profilePassword ? currentPassword : undefined,
      });
      toast.success("Profile updated!");
      setProfilePassword("");
      setCurrentPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleMoveWishlistToCart = (item) => {
    addToCart(productToCartItem(item, 1));
    toast.success(`${item.name} added to cart!`);
    openCart();
  };

  if (!user) return null;

  const menuItems = [
    {
      id: "orders",
      label: "My Keepsake Orders",
      icon: Package,
      count: orders.length,
    },
    {
      id: "wishlist",
      label: "My Wishlist",
      icon: Heart,
      count: wishlistItems.length,
    },
    {
      id: "addresses",
      label: "Saved Address Book",
      icon: MapPin,
      count: addresses.length,
    },
    {
      id: "profile",
      label: "Profile & Security",
      icon: Settings,
    },
  ];

  return (
    <div className="bg-[#FAF8F5] py-6 sm:py-8 px-3 sm:px-6 lg:px-10 xl:px-12 w-full">
      <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto">
        {/* Main 2-Column Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start w-full">
          
          {/* LEFT SIDEBAR: Option Menu */}
          <aside className="lg:col-span-3.5 xl:col-span-3 2xl:col-span-2.5 space-y-4">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
              {/* User Profile Summary */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-ribbon-500 to-rose-400 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-bold text-sm text-slate-900 truncate">{user.name}</h2>
                    {user.role === "admin" && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-100 text-ribbon-600">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>

              {/* Vertical Navigation Menu */}
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-ribbon-500 text-white shadow-sm font-bold"
                          : "text-slate-600 hover:bg-rose-50/70 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={isActive ? "text-white" : "text-slate-400"} />
                        <span>{item.label}</span>
                      </div>
                      {typeof item.count === "number" && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Quick Links Section */}
              <div className="pt-3 border-t border-slate-100 space-y-1">
                <Link
                  to="/track-order"
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Truck size={15} className="text-slate-400" />
                    <span>Track an Order</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                </Link>

                <Link
                  to="/3d-keepsakes"
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles size={15} className="text-slate-400" />
                    <span>Keepsakes Studio</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                </Link>

                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/80 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck size={15} />
                      <span>Admin Portal</span>
                    </div>
                    <ExternalLink size={13} />
                  </Link>
                )}
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN CONTENT AREA */}
          <main className="lg:col-span-8.5 xl:col-span-9 2xl:col-span-9.5">
            {/* Tab 1: Orders */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                        My Keepsake Orders
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Track, review and manage your keepsake gifts & hampers
                      </p>
                    </div>
                    <span className="text-xs font-bold text-ribbon-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full">
                      {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                    </span>
                  </div>

                  {loading ? (
                    <div className="py-16 flex justify-center">
                      <Loader2 className="animate-spin text-ribbon-500" size={24} />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="py-12 px-6 text-center space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-300 shadow-2xs">
                        <Package size={28} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-display font-bold text-lg text-slate-900">
                          No keepsake orders yet
                        </h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Transform your cherished memories into handcrafted 3D crystal figurines, photo magnets & hampers.
                        </p>
                      </div>
                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 rounded-full bg-ribbon-500 hover:bg-ribbon-600 px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:-translate-y-0.5 cursor-pointer"
                      >
                        <span>Explore Keepsakes</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order._id}
                          className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4 transition hover:bg-slate-50"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900">
                                  Order #{order._id.slice(-6).toUpperCase()}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white text-slate-700 border border-slate-200 shadow-2xs">
                                  {order.status}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Placed on{" "}
                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {!order.isRefunded &&
                                order.status !== "delivered" &&
                                order.status !== "cancelled" &&
                                order.refundStatus !== "requested" && (
                                  <button
                                    onClick={() => {
                                      setCancelModalOrder(order);
                                      setCancelReason("Ordered by mistake");
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1 transition cursor-pointer border border-rose-200/70"
                                  >
                                    <RotateCcw size={12} />
                                    <span>Cancel Order</span>
                                  </button>
                                )}

                              <Link
                                to={`/track-order?id=${order._id}`}
                                className="px-3 py-1.5 rounded-xl bg-rose-50 text-ribbon-600 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition border border-rose-100"
                              >
                                <Truck size={13} />
                                <span>Track</span>
                              </Link>
                              <Link
                                to={`/order-success/${order._id}`}
                                className="px-3 py-1.5 rounded-xl bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 transition border border-slate-200"
                              >
                                <span>Receipt</span>
                                <ExternalLink size={12} />
                              </Link>
                            </div>
                          </div>

                          {/* Refund Banner */}
                          {order.isRefunded && (
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs">
                              <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                <div className="font-bold text-emerald-900">
                                  Refund of {formatPrice(order.refundAmount || order.totalPrice)} Processed
                                </div>
                                <p className="text-emerald-700 text-[11px]">
                                  Credited back to your original payment account. Ref:{" "}
                                  <span className="font-mono">{order.refundId || "rfnd_done"}</span>
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Order Items */}
                          <div className="space-y-2.5">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={assetUrl(item.image || "/src/assets/images/photo-magnet.jpeg")}
                                    alt={item.name}
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white"
                                  />
                                  <div>
                                    <div className="font-bold text-slate-800">{item.name}</div>
                                    <div className="text-[11px] text-slate-400">
                                      Qty: {item.quantity} × {formatPrice(item.price)}
                                    </div>
                                  </div>
                                </div>
                                <div className="font-bold text-slate-900">
                                  {formatPrice(item.price * item.quantity)}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                            <span className="text-slate-400">
                              Delivering to: {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                            </span>
                            <div className="font-bold text-sm text-slate-900">
                              Total: {formatPrice(order.totalPrice)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: My Wishlist */}
            {activeTab === "wishlist" && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                      My Wishlist
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Your saved handcrafted gifts, keepsakes & bespoke hampers
                    </p>
                  </div>
                  <span className="text-xs font-bold text-ribbon-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full">
                    {wishlistItems.length} {wishlistItems.length === 1 ? "Item" : "Items"}
                  </span>
                </div>

                {wishlistItems.length === 0 ? (
                  <div className="py-12 px-6 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-ribbon-500 shadow-2xs">
                      <Heart size={26} className="fill-rose-200" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-base text-slate-800">Your wishlist is currently empty</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Explore our handcrafted 3D crystal figurines, custom photo magnets, and curated gift hampers to save your favorite gifts.
                      </p>
                    </div>
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 rounded-full bg-ribbon-500 hover:bg-ribbon-600 text-white py-2.5 px-6 text-xs font-bold shadow-sm transition mt-1 cursor-pointer"
                    >
                      <span>Explore Storefront</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {wishlistItems.map((item) => {
                      const itemId = item._id || item.id;
                      const productUrl = `/product/${item.slug || itemId}`;
                      return (
                        <div
                          key={itemId}
                          className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between gap-4 transition hover:bg-slate-50 hover:border-rose-200"
                        >
                          <div className="flex gap-3.5">
                            <Link to={productUrl} className="shrink-0">
                              <img
                                src={assetUrl(item.image || item.images?.[0] || "/src/assets/images/photo-magnet.jpeg")}
                                alt={item.name}
                                className="w-20 h-20 rounded-xl object-cover border border-slate-200 bg-white shadow-2xs"
                              />
                            </Link>
                            <div className="min-w-0 flex-1 space-y-1">
                              <Link
                                to={productUrl}
                                className="font-bold text-xs sm:text-sm text-slate-900 hover:text-ribbon-600 line-clamp-2 transition"
                              >
                                {item.name}
                              </Link>
                              <div className="flex items-baseline gap-2">
                                <span className="font-bold text-sm text-slate-900">
                                  {formatPrice(item.price)}
                                </span>
                                {item.originalPrice && (
                                  <span className="text-[11px] text-slate-400 line-through">
                                    {formatPrice(item.originalPrice)}
                                  </span>
                                )}
                              </div>
                              {item.category && (
                                <span className="inline-block text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200/80">
                                  {item.category}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                            <button
                              onClick={() => handleMoveWishlistToCart(item)}
                              className="flex-1 py-2 px-3 rounded-xl bg-ribbon-500 hover:bg-ribbon-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                            >
                              <ShoppingBag size={13} />
                              <span>Add to Cart</span>
                            </button>
                            <button
                              onClick={() => removeFromWishlist(itemId)}
                              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Remove from wishlist"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Saved Addresses */}
            {activeTab === "addresses" && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                      Saved Address Book
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Manage delivery destinations for seamless 1-click checkout
                    </p>
                  </div>
                  <button
                    onClick={() => setAddressModalOpen(true)}
                    className="rounded-full bg-ribbon-500 hover:bg-ribbon-600 text-white py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Plus size={14} /> Add Address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="py-12 px-6 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-300 shadow-2xs">
                      <MapPin size={26} />
                    </div>
                    <h3 className="font-bold text-base text-slate-800">No saved addresses</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Save your home, office or loved ones' addresses for fast delivery.
                    </p>
                    <button
                      onClick={() => setAddressModalOpen(true)}
                      className="rounded-full bg-ribbon-500 hover:bg-ribbon-600 text-white py-2 px-5 text-xs font-bold shadow-sm transition mt-1 cursor-pointer"
                    >
                      Add Address Now
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">{addr.label || "Home"}</span>
                            <button
                              onClick={() => handleDeleteAddress(addr._id)}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition"
                              title="Delete address"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-slate-700 font-medium">{addr.line1}</p>
                          {addr.line2 && <p className="text-slate-500">{addr.line2}</p>}
                          <p className="text-slate-600">
                            {addr.city}, {addr.state} - {addr.postalCode}
                          </p>
                          <p className="text-slate-400 pt-1">Phone: {addr.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Profile Settings */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                    Profile & Security
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update your account details and password settings
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full rounded-xl bg-[#F4F5F8] border border-transparent px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-ribbon-500 focus:ring-2 focus:ring-rose-100 focus:outline-hidden transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Account Email</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full rounded-xl bg-slate-100 text-slate-500 border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm cursor-not-allowed"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Google OAuth verified email address
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      New Password (Optional)
                    </label>
                    <input
                      type="password"
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      placeholder="Leave blank to keep current password"
                      className="w-full rounded-xl bg-[#F4F5F8] border border-transparent px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-ribbon-500 focus:ring-2 focus:ring-rose-100 focus:outline-hidden transition"
                    />
                  </div>

                  {profilePassword && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Current Password
                      </label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Required to change your password"
                        className="w-full rounded-xl bg-[#F4F5F8] border border-transparent px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-ribbon-500 focus:ring-2 focus:ring-rose-100 focus:outline-hidden transition"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Signed up with Google? Use &ldquo;Forgot password&rdquo; on the login page to set one first.
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="rounded-full bg-ribbon-500 hover:bg-ribbon-600 text-white py-2.5 px-6 text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-60"
                  >
                    {savingProfile ? "Saving..." : "Update Profile"}
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Add Address Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 border border-slate-100 shadow-2xl relative">
            <h3 className="font-display font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
              Add New Delivery Address
            </h3>

            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Address Label</label>
                <input
                  type="text"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  placeholder="e.g. Home, Studio, Office"
                  className="w-full rounded-xl bg-[#F4F5F8] border border-transparent px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-ribbon-500 focus:ring-1 focus:ring-rose-100 focus:outline-hidden transition"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  value={newAddress.line1}
                  onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                  placeholder="Flat, House No., Building name"
                  className="w-full rounded-xl bg-[#F4F5F8] border border-transparent px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-ribbon-500 focus:ring-1 focus:ring-rose-100 focus:outline-hidden transition"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={newAddress.line2}
                  onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                  placeholder="Street, Landmark, Area"
                  className="w-full rounded-xl bg-[#F4F5F8] border border-transparent px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-ribbon-500 focus:ring-1 focus:ring-rose-100 focus:outline-hidden transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Pincode (6-digit) *</label>
                    {pincodeLoading && <span className="text-[10px] text-ribbon-600 animate-pulse">Detecting...</span>}
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newAddress.postalCode}
                    onChange={(e) => handlePincodeLookup(e.target.value)}
                    placeholder="e.g. 411001"
                    className="w-full rounded-xl bg-[#F4F5F8] border border-transparent px-3.5 py-2 text-xs text-slate-800 font-mono focus:bg-white focus:border-ribbon-500 focus:ring-1 focus:ring-rose-100 focus:outline-hidden transition"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value.replace(/\D/g, "") })}
                    placeholder="10-digit mobile"
                    className="w-full rounded-xl bg-[#F4F5F8] border border-transparent px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-ribbon-500 focus:ring-1 focus:ring-rose-100 focus:outline-hidden transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City / District *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    placeholder="Auto-detected or enter city"
                    className="w-full rounded-xl bg-[#F4F5F8] border border-transparent px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-ribbon-500 focus:ring-1 focus:ring-rose-100 focus:outline-hidden transition"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    placeholder="Auto-detected or enter state"
                    className="w-full rounded-xl bg-[#F4F5F8] border border-transparent px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-ribbon-500 focus:ring-1 focus:ring-rose-100 focus:outline-hidden transition"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="rounded-full bg-ribbon-500 hover:bg-ribbon-600 text-white py-2 px-6 text-xs font-bold cursor-pointer disabled:opacity-60"
                >
                  {savingAddress ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Cancel & Refund Request Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-100 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <RotateCcw size={16} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">
                    Cancel Keepsake Order
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Order #{cancelModalOrder._id.slice(-6).toUpperCase()} • {formatPrice(cancelModalOrder.totalPrice)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCancelModalOrder(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRequestCancellation} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 space-y-1">
                <p className="font-semibold text-slate-900">Refund Guarantee:</p>
                <p className="text-[11px]">
                  {cancelModalOrder.status === "confirmed" || cancelModalOrder.status === "pending"
                    ? "Your order hasn't entered crafting yet. You will receive an instant 100% refund credited back to your payment account."
                    : "Your personalized keepsake is in crafting. A concierge artisan will review and approve your refund request within 2 hours."}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[10px] mb-1.5 uppercase">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full rounded-xl bg-[#F4F5F8] border border-transparent px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-ribbon-500 focus:ring-1 focus:ring-rose-100 focus:outline-hidden transition mb-2"
                >
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Celebration date changed / Event postponed">Celebration date changed / Event postponed</option>
                  <option value="Need to change uploaded photo or custom text">Need to change uploaded photo or custom text</option>
                  <option value="Found alternative gift">Found alternative gift</option>
                  <option value="Other reason">Other reason</option>
                </select>

                <input
                  type="text"
                  placeholder="Additional feedback for our artisan team (optional)..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full rounded-xl bg-[#F4F5F8] border border-transparent px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-ribbon-500 focus:ring-1 focus:ring-rose-100 focus:outline-hidden transition"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {cancelling ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <RotateCcw size={13} />
                      <span>Confirm Cancellation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
