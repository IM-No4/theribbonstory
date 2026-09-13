import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingBag,
  User,
  Search,
  Sparkles,
  ChevronDown,
  Heart,
  MapPin,
  Truck,
  HelpCircle,
  PhoneCall,
  Flame,
  ArrowRight,
  ShieldCheck,
  Gift,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { LogoMark } from "./Logo";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useLocationStore } from "../store/locationStore";
import { useWishlistStore } from "../store/wishlistStore";
import SearchModal from "./SearchModal";
import MegaMenu, { MENU_CATEGORIES } from "./MegaMenu";

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMegaCategory, setActiveMegaCategory] = useState(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const menuTimeoutRef = useRef(null);

  const { totalItems, subtotal, openCart } = useCartStore();
  const { items: wishlistItems, openDrawer: openWishlist } = useWishlistStore();
  const { location, openModal: openLocationModal } = useLocationStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMouseEnterCategory = (catId) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setActiveMegaCategory(catId);
  };

  const handleMouseLeaveCategory = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMegaCategory(null);
    }, 150);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white transition-shadow duration-300 shadow-sm border-b border-slate-100">
        {/* 1. TOP ANNOUNCEMENT & LOCATION UTILITY BAR (IGP Style) */}
        <div className="bg-slate-50 border-b border-slate-200/70 text-slate-600 text-[11px] font-medium py-1.5 px-4 sm:px-6 lg:px-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left: Location & Delivery Pin Selector */}
            <div className="flex items-center gap-4">
              <button
                onClick={openLocationModal}
                className="flex items-center gap-1.5 text-slate-800 hover:text-ribbon-500 font-semibold transition-colors group"
                title="Change delivery location"
              >
                <MapPin size={13} className="text-ribbon-500 group-hover:animate-bounce" />
                <span>
                  Deliver to:{" "}
                  <span className="underline decoration-dotted font-bold text-slate-900">
                    {location ? `${location.city || location.name} (${location.pincode})` : "Select City / Pincode"}
                  </span>
                </span>
                <ChevronDown size={11} className="text-slate-400" />
              </button>

              <span className="hidden sm:inline-block text-slate-300">|</span>

              <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
                <span>🇮🇳 India (INR ₹)</span>
              </div>
            </div>

            {/* Right: Quick Links (Track, Help, Corporate) */}
            <div className="flex items-center gap-4 text-[11px]">
              <Link
                to="/track-order"
                className="hover:text-ribbon-500 transition-colors hidden md:inline-flex items-center gap-1"
              >
                <Truck size={12} className="text-ribbon-500" />
                <span>Track Order</span>
              </Link>
              <span className="hidden md:inline-block text-slate-300">|</span>
              <Link
                to="/contact"
                className="hover:text-ribbon-500 transition-colors hidden sm:inline-flex items-center gap-1"
              >
                <Sparkles size={11} className="text-amber-500" />
                <span>Corporate Gifts</span>
              </Link>
              <span className="hidden sm:inline-block text-slate-300">|</span>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="hover:text-emerald-700 text-emerald-600 font-semibold flex items-center gap-1"
              >
                <PhoneCall size={11} />
                <span>Help: +91 98765 43210</span>
              </a>
            </div>
          </div>
        </div>

        {/* 2. MAIN HEADER BAR: BRAND, RICH SEARCH & ACTIONS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3.5 flex items-center justify-between gap-4 sm:gap-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <LogoMark to="/" size="compact" />
          </div>

          {/* Desktop Rich Search Bar (IGP Style) */}
          <div className="hidden lg:flex flex-1 max-w-md xl:max-w-lg mx-2 xl:mx-6">
            <form
              onSubmit={handleSearchSubmit}
              className="w-full flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2 hover:border-ribbon-300 focus-within:border-ribbon-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-rose-100 transition-all shadow-xs"
            >
              <Search size={17} className="text-ribbon-500 shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={() => setSearchOpen(true)}
                placeholder="Search for 3D Keepsakes, Photo Magnets, Hampers..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="px-3.5 py-1.5 bg-ribbon-500 hover:bg-ribbon-600 text-white rounded-full text-[11px] font-bold uppercase tracking-wider transition ml-1 shadow-xs shrink-0"
              >
                Search
              </button>
            </form>
          </div>

          {/* Right Action Icons & Badges */}
          <div className="flex items-center gap-2 xl:gap-3 shrink-0">
            {/* Mobile Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="lg:hidden p-2 rounded-full text-slate-600 hover:bg-rose-50 hover:text-ribbon-500 transition-colors"
              title="Search"
            >
              <Search size={20} />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={openWishlist}
              aria-label="Wishlist"
              className="relative p-2 rounded-full text-slate-600 hover:bg-rose-50 hover:text-ribbon-500 transition-colors flex items-center gap-1.5"
              title="My Wishlist"
            >
              <div className="relative">
                <Heart size={20} className={wishlistItems.length > 0 ? "text-ribbon-500 fill-ribbon-500" : ""} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-ribbon-500 px-1 text-[10px] font-bold text-white shadow-xs">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline-block text-xs font-semibold text-slate-700">Wishlist</span>
            </button>

            {/* Account / User Menu - Prominent and Clear */}
            <div className="relative">
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                onBlur={() => setTimeout(() => setAccountDropdownOpen(false), 200)}
                aria-label="Account"
                className="px-2.5 py-1.5 rounded-full hover:bg-rose-50 text-slate-700 hover:text-ribbon-500 transition-colors flex items-center gap-2 border border-slate-200/80 bg-white shadow-2xs"
                title={user ? user.name : "Sign In / Register"}
              >
                <div className="h-6 w-6 rounded-full bg-rose-100 flex items-center justify-center text-ribbon-600 font-bold text-xs shrink-0">
                  {user ? user.name.charAt(0).toUpperCase() : <User size={14} />}
                </div>
                <div className="flex flex-col text-left leading-tight pr-1">
                  <span className="text-[10px] text-slate-400 font-medium">{user ? "Hi," : "Welcome"}</span>
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[85px]">
                    {user ? user.name.split(" ")[0] : "Sign In"}
                  </span>
                </div>
                <ChevronDown size={11} className="text-slate-400" />
              </button>

              {/* Account Dropdown */}
              <AnimatePresence>
                {accountDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-left"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="text-xs text-slate-400">Signed in as</p>
                          <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                        </div>
                        {user.role === "admin" && (
                          <Link
                            to="/admin"
                            onClick={() => setAccountDropdownOpen(false)}
                            className="flex items-center justify-between px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50/80 hover:bg-rose-100/80 transition"
                          >
                            <span>⚡ Admin Dashboard</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-rose-200 text-rose-800">
                              Admin
                            </span>
                          </Link>
                        )}
                        <Link
                          to="/account"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="block px-4 py-2 text-xs text-slate-700 hover:bg-rose-50 hover:text-ribbon-500"
                        >
                          My Profile &amp; Orders
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setAccountDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="p-3 border-b border-slate-100">
                          <Link
                            to="/login"
                            onClick={() => setAccountDropdownOpen(false)}
                            className="btn-primary w-full py-2.5 text-xs text-center block"
                          >
                            Sign In / Register
                          </Link>
                        </div>
                        <Link
                          to="/track-order"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="block px-4 py-2 text-xs text-slate-700 hover:bg-rose-50 hover:text-ribbon-500"
                        >
                          Track Live Order
                        </Link>
                        <Link
                          to="/how-it-works"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="block px-4 py-2 text-xs text-slate-700 hover:bg-rose-50 hover:text-ribbon-500"
                        >
                          How Customization Works
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart Button with Total Value */}
            <button
              onClick={openCart}
              aria-label="Cart"
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-slate-50 hover:bg-rose-50 border border-slate-200 text-slate-700 hover:text-ribbon-500 transition-colors flex items-center gap-2"
              title="Cart"
            >
              <div className="relative">
                <ShoppingBag size={19} className="text-ribbon-500" />
                {totalItems() > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-ribbon-500 px-1 text-[10px] font-bold text-white shadow-xs">
                    {totalItems()}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none pr-1">
                <span className="text-[10px] text-slate-400">Cart</span>
                <span className="text-xs font-bold text-slate-900">
                  {subtotal() > 0 ? formatPrice(subtotal()) : "₹0"}
                </span>
              </div>
            </button>

            {/* Primary CTA: Personalize Studio */}
            <button
              onClick={() => navigate("/personalized")}
              className="btn-primary hidden md:inline-flex py-2 px-3.5 xl:px-4 text-xs font-bold uppercase tracking-wider gap-1.5 shadow-xs shrink-0"
            >
              <Sparkles size={13} className="text-rose-100" />
              <span>Personalize</span>
            </button>

            {/* Mobile Hamburger Menu */}
            <button
              aria-label="Toggle Menu"
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-full text-slate-600 hover:bg-rose-50 hover:text-ribbon-500 transition-colors lg:hidden"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* 3. MULTI-TIER CATEGORY NAVIGATION BAR (IGP Style Mega-Nav) */}
        <div
          className="hidden lg:block bg-white border-t border-slate-100 relative w-full"
          onMouseLeave={handleMouseLeaveCategory}
        >
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
            <nav className="w-full flex items-center justify-between py-1 text-xs font-semibold tracking-tight">
              {MENU_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className="relative group shrink-0"
                  onMouseEnter={() => handleMouseEnterCategory(cat.id)}
                >
                  <Link
                    to={cat.to}
                    className={`inline-flex items-center gap-1 px-2 xl:px-3 py-2 rounded-lg transition-all whitespace-nowrap text-xs xl:text-[13px] ${
                      activeMegaCategory === cat.id
                        ? "bg-rose-50 text-ribbon-600 font-bold"
                        : "text-slate-700 hover:text-ribbon-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{cat.title}</span>
                    {cat.badge && (
                      <span
                        className={`text-[9px] font-extrabold text-white px-1.5 py-0.2 rounded-full uppercase tracking-tight shadow-2xs ${cat.badgeColor}`}
                      >
                        {cat.badge}
                      </span>
                    )}
                    <ChevronDown size={11} className="text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                  </Link>
                </div>
              ))}

              <NavLink
                to="/how-it-works"
                className={({ isActive }) =>
                  `px-2 xl:px-3 py-2 rounded-lg text-xs xl:text-[13px] font-semibold transition whitespace-nowrap shrink-0 ${
                    isActive ? "text-ribbon-600 bg-rose-50 font-bold" : "text-slate-700 hover:text-ribbon-600 hover:bg-slate-50"
                  }`
                }
              >
                How It Works
              </NavLink>
            </nav>
          </div>

          {/* MegaMenu Dropdown Content */}
          <AnimatePresence>
            {activeMegaCategory && (
              <MegaMenu
                activeCategory={activeMegaCategory}
                onMouseEnter={() => {
                  if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
                }}
                onClose={() => setActiveMegaCategory(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Live Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenCustomizer={(product) => navigate(`/product/${product.slug}`)}
      />

      {/* Mobile Navigation Drawer */}
      {createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-espresso-700/60 backdrop-blur-xs lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 280 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col justify-between overflow-y-auto"
              >
                <div>
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-5 border-b border-blush-200 bg-cream-100">
                    <LogoMark to="/" size="compact" />
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="p-2 rounded-full text-espresso-400 hover:text-burgundy-900"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Delivery Location Selector in Mobile */}
                  <div className="p-4 bg-blush-50 border-b border-blush-200">
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        openLocationModal();
                      }}
                      className="w-full flex items-center justify-between text-xs text-burgundy-900 font-semibold"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin size={15} className="text-ribbon-500" />
                        <span>Deliver to: {location?.city || "Select Pincode"}</span>
                      </div>
                      <span className="text-ribbon-600 text-[11px] underline">Change</span>
                    </button>
                  </div>

                  {/* Mobile Nav Links */}
                  <div className="p-4 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-espresso-400 px-3 py-1">
                      Gift Categories
                    </p>
                    {MENU_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.id}
                        to={cat.to}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-medium text-espresso-700 hover:bg-blush-50 hover:text-burgundy-900"
                      >
                        <div className="flex items-center gap-2">
                          <span>{cat.title}</span>
                          {cat.badge && (
                            <span
                              className={`text-[9px] font-bold text-white px-1.5 py-0.5 rounded-md ${cat.badgeColor}`}
                            >
                              {cat.badge}
                            </span>
                          )}
                        </div>
                        <ArrowRight size={14} className="text-espresso-300" />
                      </Link>
                    ))}

                    <div className="pt-3 border-t border-blush-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-espresso-400 px-3 py-1">
                        Explore &amp; Help
                      </p>
                      <Link
                        to="/personalized"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-sm font-medium text-espresso-700 hover:bg-blush-50"
                      >
                        <Sparkles size={16} className="text-ribbon-500" />
                        <span>Personalized Studio</span>
                      </Link>
                      <Link
                        to="/3d-keepsakes"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-sm font-medium text-espresso-700 hover:bg-blush-50"
                      >
                        <Flame size={16} className="text-coral-500" />
                        <span>3D Sculptures &amp; Castings</span>
                      </Link>
                      <Link
                        to="/how-it-works"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-sm font-medium text-espresso-700 hover:bg-blush-50"
                      >
                        <ShieldCheck size={16} className="text-emerald-600" />
                        <span>How It Works</span>
                      </Link>
                      <Link
                        to="/account"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-sm font-medium text-espresso-700 hover:bg-blush-50"
                      >
                        <Truck size={16} className="text-burgundy-900" />
                        <span>Track My Order</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Mobile Bottom User & CTA */}
                <div className="p-4 border-t border-blush-200 bg-cream-50 space-y-2">
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      navigate("/personalized");
                    }}
                    className="btn-primary w-full py-3 text-xs uppercase font-bold tracking-wider"
                  >
                    Personalize a Gift
                  </button>
                  <div className="flex items-center justify-between text-xs pt-1 px-1">
                    <Link
                      to={user ? "/account" : "/login"}
                      onClick={() => setMobileOpen(false)}
                      className="font-medium text-espresso-600 hover:text-burgundy-900"
                    >
                      {user ? `Account (${user.name})` : "Sign In / Register"}
                    </Link>
                    <a
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 font-semibold"
                    >
                      WhatsApp Us
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
