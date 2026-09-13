import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import toast from "react-hot-toast";
import { api, assetUrl } from "../api/client";
import { useAuthStore } from "../store/authStore";

const formatPrice = (n) => `₹${n.toLocaleString("en-IN")}`;

export default function Account() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState("orders"); // "orders", "addresses", "profile"
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.line1 || !newAddress.city || !newAddress.postalCode || !newAddress.phone) {
      toast.error("Please fill in required address fields");
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
      toast.error("Failed to add address");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Delete this saved address?")) return;
    try {
      const { data } = await api.delete(`/auth/address/${addressId}`);
      setAddresses(data.addresses || []);
      toast.success("Address removed");
    } catch (err) {
      toast.error("Failed to remove address");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put("/auth/profile", {
        name: profileName,
        password: profilePassword || undefined,
      });
      toast.success("Profile updated!");
      setProfilePassword("");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-cream-50 min-h-screen py-10 sm:py-16">
      <div className="container-page max-w-5xl">
        {/* User Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-blush-200 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-ribbon-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-rose-900/20">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-burgundy-900">{user.name}</h1>
                {user.role === "admin" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-espresso-400 mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
              >
                ⚡ Admin Panel
              </Link>
            )}
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="px-4 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-espresso-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-blush-200 pb-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "orders"
                ? "bg-burgundy-900 text-white shadow-xs"
                : "bg-white text-espresso-600 hover:bg-blush-50 border border-blush-200"
            }`}
          >
            <Package size={15} />
            <span>My Keepsake Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "addresses"
                ? "bg-burgundy-900 text-white shadow-xs"
                : "bg-white text-espresso-600 hover:bg-blush-50 border border-blush-200"
            }`}
          >
            <MapPin size={15} />
            <span>Saved Address Book ({addresses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "profile"
                ? "bg-burgundy-900 text-white shadow-xs"
                : "bg-white text-espresso-600 hover:bg-blush-50 border border-blush-200"
            }`}
          >
            <Settings size={15} />
            <span>Profile & Security</span>
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {loading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="animate-spin text-ribbon-500" size={24} />
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-blush-200 text-center space-y-4">
                <Package size={36} className="mx-auto text-espresso-300" />
                <h3 className="font-display font-bold text-xl text-burgundy-900">
                  No keepsake orders yet
                </h3>
                <p className="text-xs text-espresso-400 max-w-sm mx-auto">
                  Transform your memories into handcrafted 3D figurines and glossy magnets.
                </p>
                <Link to="/shop" className="btn-primary mt-2 inline-flex items-center gap-2">
                  <span>Explore Keepsakes</span>
                  <ChevronRight size={15} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="p-6 rounded-3xl bg-white border border-blush-200 shadow-xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blush-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-base text-burgundy-900">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blush-100 text-burgundy-900 border border-blush-200">
                            {order.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-espresso-400 mt-0.5">
                          Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Cancel Button if eligible */}
                        {!order.isRefunded &&
                          order.status !== "delivered" &&
                          order.status !== "cancelled" &&
                          order.refundStatus !== "requested" && (
                            <button
                              onClick={() => {
                                setCancelModalOrder(order);
                                setCancelReason("Ordered by mistake");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1 transition cursor-pointer border border-rose-200"
                            >
                              <RotateCcw size={12} />
                              <span>Cancel Order</span>
                            </button>
                          )}

                        <Link
                          to={`/track-order?id=${order._id}`}
                          className="px-3 py-1.5 rounded-xl bg-blush-50 text-burgundy-900 hover:bg-blush-100 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <Truck size={13} className="text-ribbon-600" />
                          <span>Track Delivery</span>
                        </Link>
                        <Link
                          to={`/order-success/${order._id}`}
                          className="px-3 py-1.5 rounded-xl bg-cream-100 text-espresso-700 hover:bg-cream-200 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <span>Receipt</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>

                    {/* Refund Banner if refunded or requested */}
                    {order.isRefunded && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <div className="font-bold text-emerald-900">
                            Refund of {formatPrice(order.refundAmount || order.totalPrice)} Processed
                          </div>
                          <p className="text-emerald-700 text-[11px] mt-0.5">
                            Credited back to your original payment method. Ref ID:{" "}
                            <span className="font-mono font-bold">{order.refundId || "rfnd_completed"}</span>
                          </p>
                          {order.refundReason && (
                            <p className="text-emerald-600 text-[11px] italic mt-0.5">
                              "{order.refundReason}"
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {order.refundStatus === "requested" && (
                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <div className="font-bold text-amber-900">
                            Cancellation & Refund Under Studio Review
                          </div>
                          <p className="text-amber-700 text-[11px] mt-0.5">
                            Our studio team has received your cancellation request (Reason: "{order.cancellationReason || "Customer requested"}"). Your refund will be credited shortly.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={assetUrl(item.image || "/src/assets/images/photo-magnet.jpeg")}
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover border border-blush-100 bg-cream-50"
                            />
                            <div>
                              <div className="font-bold text-burgundy-900">{item.name}</div>
                              <div className="text-[11px] text-espresso-400">
                                Qty: {item.quantity} × {formatPrice(item.price)}
                              </div>
                            </div>
                          </div>
                          <div className="font-bold text-burgundy-900">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-blush-100 flex items-center justify-between text-xs">
                      <span className="text-espresso-400">
                        Delivering to: {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                      </span>
                      <div className="font-display font-bold text-base text-burgundy-900">
                        Total: {formatPrice(order.totalPrice)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Saved Addresses */}
        {activeTab === "addresses" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-burgundy-900">Saved Address Book</h3>
                <p className="text-xs text-espresso-400">Manage delivery addresses for faster checkout.</p>
              </div>
              <button
                onClick={() => setAddressModalOpen(true)}
                className="btn-primary !py-2.5 !px-4 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Add Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-blush-200 text-center space-y-3">
                <MapPin size={32} className="mx-auto text-espresso-300" />
                <h4 className="font-bold text-base text-burgundy-900">No saved addresses</h4>
                <p className="text-xs text-espresso-400">Add your home or office address for seamless 1-click checkout.</p>
                <button
                  onClick={() => setAddressModalOpen(true)}
                  className="btn-primary mt-2 text-xs"
                >
                  Add Address Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="p-6 rounded-3xl bg-white border border-blush-200 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-burgundy-900 text-sm">{addr.label || "Home"}</span>
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="text-espresso-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Delete address"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-espresso-700 font-medium">{addr.line1}</p>
                      {addr.line2 && <p className="text-espresso-500">{addr.line2}</p>}
                      <p className="text-espresso-600">
                        {addr.city}, {addr.state} - {addr.postalCode}
                      </p>
                      <p className="text-espresso-400 pt-1">Phone: {addr.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Profile Settings */}
        {activeTab === "profile" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-blush-200 shadow-xl max-w-xl space-y-6">
            <div>
              <h3 className="font-display font-bold text-xl text-burgundy-900">Profile & Security</h3>
              <p className="text-xs text-espresso-400 mt-0.5">Update your contact details or password.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-burgundy-900 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="input-field text-xs py-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-burgundy-900 uppercase mb-1">Account Email</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="input-field text-xs py-2.5 bg-cream-100/70 text-espresso-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-espresso-400">Email cannot be changed directly</span>
              </div>

              <div>
                <label className="block font-bold text-burgundy-900 uppercase mb-1">
                  Change Password (Optional)
                </label>
                <input
                  type="password"
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="input-field text-xs py-2.5"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="btn-primary py-2.5 px-6 text-xs font-semibold cursor-pointer"
              >
                {savingProfile ? "Saving..." : "Update Profile"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 border border-blush-200 shadow-2xl relative">
            <h3 className="font-display font-bold text-lg text-burgundy-900 border-b border-blush-100 pb-3">
              Add New Delivery Address
            </h3>

            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-burgundy-900 uppercase mb-1">Address Label</label>
                <input
                  type="text"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  placeholder="e.g. Home, Studio, Parents House"
                  className="input-field text-xs py-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-burgundy-900 uppercase mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  value={newAddress.line1}
                  onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                  placeholder="Flat, House No., Building name"
                  className="input-field text-xs py-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-burgundy-900 uppercase mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={newAddress.line2}
                  onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                  placeholder="Street, Landmark, Area"
                  className="input-field text-xs py-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-burgundy-900 uppercase mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="input-field text-xs py-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-burgundy-900 uppercase mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="input-field text-xs py-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-burgundy-900 uppercase mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    placeholder="6 digits"
                    className="input-field text-xs py-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-burgundy-900 uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    placeholder="10-digit mobile"
                    className="input-field text-xs py-2.5"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-blush-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-espresso-500 hover:text-burgundy-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="btn-primary py-2 px-6 text-xs font-semibold cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-burgundy-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-blush-200 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-blush-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <RotateCcw size={16} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-burgundy-900">
                    Cancel Keepsake Order
                  </h3>
                  <p className="text-[11px] text-espresso-400">
                    Order #{cancelModalOrder._id.slice(-6).toUpperCase()} • {formatPrice(cancelModalOrder.totalPrice)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCancelModalOrder(null)}
                className="p-1.5 rounded-xl text-espresso-400 hover:text-burgundy-900 hover:bg-blush-50 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRequestCancellation} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-cream-50 border border-blush-100 text-espresso-600 space-y-1">
                <p className="font-semibold text-burgundy-900">Refund Guarantee:</p>
                <p className="text-[11px]">
                  {cancelModalOrder.status === "confirmed" || cancelModalOrder.status === "pending"
                    ? "Your order hasn't entered production yet. You will receive an instant 100% refund credited back to your payment account."
                    : "Your personalized keepsake is in crafting. A concierge artisan will review and approve your refund request within 2 hours."}
                </p>
              </div>

              <div>
                <label className="block font-bold text-burgundy-900 uppercase text-[10px] mb-1.5">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="input-field text-xs py-2.5 mb-2"
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
                  className="input-field text-xs py-2"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-blush-100">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="px-4 py-2 rounded-xl text-espresso-500 hover:text-burgundy-900 font-semibold"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
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
