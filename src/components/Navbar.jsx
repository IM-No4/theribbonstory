import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingBag,
  User,
  Search,
  Sparkles,
  ChevronDown,
  Heart,
  Truck,
  ArrowRight,
  Layers,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { LogoMark } from "./Logo";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useWishlistStore } from "../store/wishlistStore";
import SearchModal from "./SearchModal";
import { api } from "../api/client";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [keepsakeDropdownOpen, setKeepsakeDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mobileKeepsakeOpen, setMobileKeepsakeOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [keepsakeCategories, setKeepsakeCategories] = useState([]);
  const shopTimeoutRef = useRef(null);
  const keepsakeTimeoutRef = useRef(null);

  const routerLocation = useLocation();
  const isDashboard = routerLocation.pathname.startsWith("/account");
  const isCartOrCheckout =
    routerLocation.pathname === "/cart" ||
    routerLocation.pathname === "/checkout";

  const { totalItems, openCart } = useCartStore();
  const { items: wishlistItems, openDrawer: openWishlist } = useWishlistStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Fetch dynamic collections from database
  useEffect(() => {
    let active = true;
    api
      .get("/categories")
      .then(({ data }) => {
        if (active && data.categories) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error("Failed to load nav categories:", err));

    api
      .get("/keepsake-categories")
      .then(({ data }) => {
        if (active && data.categories) {
          setKeepsakeCategories(data.categories);
        }
      })
      .catch((err) => console.error("Failed to load keepsake categories:", err));

    return () => {
      active = false;
    };
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setMobileOpen(false);
    setShopDropdownOpen(false);
    setKeepsakeDropdownOpen(false);
    setAccountDropdownOpen(false);
  }, [routerLocation.pathname, routerLocation.search]);

  const handleShopMouseEnter = () => {
    if (shopTimeoutRef.current) clearTimeout(shopTimeoutRef.current);
    setShopDropdownOpen(true);
  };

  const handleShopMouseLeave = () => {
    shopTimeoutRef.current = setTimeout(() => {
      setShopDropdownOpen(false);
    }, 180);
  };

  const handleKeepsakeMouseEnter = () => {
    if (keepsakeTimeoutRef.current) clearTimeout(keepsakeTimeoutRef.current);
    setKeepsakeDropdownOpen(true);
  };

  const handleKeepsakeMouseLeave = () => {
    keepsakeTimeoutRef.current = setTimeout(() => {
      setKeepsakeDropdownOpen(false);
    }, 180);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-200 overflow-x-clip">
        {/* STREAMLINED SINGLE-ROW LUXURY NAVBAR */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4 min-w-0">
          {/* Brand Logo */}
          <div className="flex items-center min-w-0 shrink">
            <LogoMark to="/" size="compact" />
          </div>

          {/* Clean Desktop Navigation Links (Centered, Elegant) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {/* Shop Models with Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleShopMouseEnter}
              onMouseLeave={handleShopMouseLeave}
            >
              <Link
                to="/shop"
                onClick={(e) => {
                  if (routerLocation.pathname === "/shop") {
                    e.preventDefault();
                    setShopDropdownOpen((prev) => !prev);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs lg:text-[13px] font-medium tracking-wide transition flex items-center gap-1 ${
                  routerLocation.pathname === "/shop"
                    ? "text-stone-950 font-bold bg-stone-100"
                    : "text-stone-600 hover:text-stone-950 hover:bg-stone-100/70"
                }`}
              >
                <span>Shop 3D Models</span>
                <ChevronDown
                  size={12}
                  className={`text-stone-400 transition-transform duration-200 ${
                    shopDropdownOpen ? "rotate-180 text-stone-950" : ""
                  }`}
                />
              </Link>

              {/* Minimalist Shop Dropdown */}
              <AnimatePresence>
                {shopDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-2xl shadow-2xl border border-stone-200 p-2 z-50 text-left"
                  >
                    <div className="px-3 py-2 border-b border-stone-100 mb-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        3D Printed Catalog
                      </span>
                    </div>

                    <div className="space-y-0.5 max-h-72 overflow-y-auto">
                      {categories.map((cat) => (
                        <Link
                          key={cat._id || cat.slug}
                          to={`/shop?category=${cat.slug}`}
                          onClick={() => setShopDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-stone-700 hover:text-rose-600 hover:bg-rose-50/70 transition"
                        >
                          <span className="font-semibold">{cat.name}</span>
                          <span className="text-[10px] text-stone-400">
                            {cat.badge || (cat.productCount !== undefined ? `${cat.productCount} models` : "")}
                          </span>
                        </Link>
                      ))}
                    </div>

                    <div className="pt-2 mt-1 border-t border-stone-100 px-3 pb-1">
                      <Link
                        to="/shop"
                        onClick={() => setShopDropdownOpen(false)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center justify-between"
                      >
                        <span>View All Models</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Personalize 3D with Subject Dropdown */}
            <div
              className="relative"
              onMouseEnter={handleKeepsakeMouseEnter}
              onMouseLeave={handleKeepsakeMouseLeave}
            >
              <Link
                to="/personalized"
                onClick={(e) => {
                  if (routerLocation.pathname === "/personalized") {
                    e.preventDefault();
                    setKeepsakeDropdownOpen((prev) => !prev);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs lg:text-[13px] font-medium tracking-wide transition flex items-center gap-1.5 ${
                  routerLocation.pathname === "/personalized"
                    ? "text-rose-600 font-bold bg-rose-50"
                    : "text-stone-600 hover:text-stone-950 hover:bg-stone-100/70"
                }`}
              >
                <Sparkles size={13} className="text-rose-500" />
                <span>Personalize 3D</span>
                <ChevronDown
                  size={12}
                  className={`text-stone-400 transition-transform duration-200 ${
                    keepsakeDropdownOpen ? "rotate-180 text-rose-600" : ""
                  }`}
                />
              </Link>

              {/* Minimalist Keepsake Subject Dropdown */}
              <AnimatePresence>
                {keepsakeDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-2xl shadow-2xl border border-stone-200 p-2 z-50 text-left"
                  >
                    <div className="px-3 py-2 border-b border-stone-100 mb-1 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Keepsake Subjects
                      </span>
                      <span className="text-[10px] text-rose-500 font-semibold">Custom 3D</span>
                    </div>

                    <div className="space-y-0.5">
                      {(keepsakeCategories.length > 0 ? keepsakeCategories : [
                        { name: "Single", slug: "single", icon: "👤", tagline: "Individual portraits & solos" },
                        { name: "Couple", slug: "couple", icon: "👩‍❤️‍👨", tagline: "Anniversaries & romance" },
                        { name: "Family", slug: "family", icon: "👨‍👩‍👧", tagline: "Cherished moments together" },
                        { name: "Kid & Baby", slug: "kid-baby", icon: "👶", tagline: "Little milestones & toddlers" },
                        { name: "Pet", slug: "pet", icon: "🐾", tagline: "Dogs, cats & furry companions" },
                      ]).map((cat) => (
                        <Link
                          key={cat._id || cat.slug}
                          to={`/personalized?category=${cat.slug}`}
                          onClick={() => setKeepsakeDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-stone-700 hover:text-rose-600 hover:bg-rose-50/70 transition group"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base leading-none">{cat.icon || "👤"}</span>
                            <div>
                              <div className="font-semibold text-stone-800 group-hover:text-rose-600">
                                {cat.name}
                              </div>
                              {cat.tagline && (
                                <div className="text-[10px] text-stone-400 line-clamp-1">
                                  {cat.tagline}
                                </div>
                              )}
                            </div>
                          </div>
                          <ArrowRight
                            size={12}
                            className="text-stone-300 group-hover:text-rose-500 group-hover:translate-x-0.5 transition"
                          />
                        </Link>
                      ))}
                    </div>

                    <div className="pt-2 mt-1 border-t border-stone-100 px-3 pb-1">
                      <Link
                        to="/personalized"
                        onClick={() => setKeepsakeDropdownOpen(false)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center justify-between"
                      >
                        <span>Open 3D Personalizer</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* How It Works */}
            <NavLink
              to="/how-it-works"
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-full text-xs lg:text-[13px] font-semibold transition ${
                  isActive
                    ? "text-ribbon-600 bg-rose-50 font-bold"
                    : "text-stone-700 hover:text-stone-900 hover:bg-stone-50"
                }`
              }
            >
              How It Works
            </NavLink>

            {/* About */}
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-full text-xs lg:text-[13px] font-semibold transition ${
                  isActive
                    ? "text-ribbon-600 bg-rose-50 font-bold"
                    : "text-stone-700 hover:text-stone-900 hover:bg-stone-50"
                }`
              }
            >
              About Studio
            </NavLink>
          </nav>

          {/* Right Action Icons & Direct CTA */}
          <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search Catalog"
              className="p-1.5 sm:p-2.5 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              title="Search"
            >
              <Search size={18} />
            </button>

            {/* Wishlist Trigger (Shown on sm+ screens, prominently available in mobile drawer on phones) */}
            {!isDashboard && (
              <button
                onClick={openWishlist}
                aria-label="Wishlist"
                className="hidden sm:inline-flex relative p-1.5 sm:p-2.5 rounded-full text-stone-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Wishlist"
              >
                <Heart size={18} className={wishlistItems.length > 0 ? "fill-rose-500 text-rose-500" : ""} />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-2xs">
                    {wishlistItems.length}
                  </span>
                )}
              </button>
            )}

            {/* Account Trigger */}
            <div className="relative">
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                onBlur={() => setTimeout(() => setAccountDropdownOpen(false), 200)}
                aria-label="Account"
                className="p-1.5 sm:p-2.5 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors flex items-center"
                title={user ? user.name : "Sign In"}
              >
                {user ? (
                  <div className="h-6 w-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-xs ring-1 ring-rose-200">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <User size={18} />
                )}
              </button>

              {/* Account Dropdown */}
              <AnimatePresence>
                {accountDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 text-left"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-stone-100">
                          <p className="text-[10px] text-stone-400 uppercase font-bold">Signed in as</p>
                          <p className="text-sm font-semibold text-stone-900 truncate">{user.name}</p>
                        </div>
                        {user.role === "admin" && (
                          <Link
                            to="/admin"
                            onClick={() => setAccountDropdownOpen(false)}
                            className="flex items-center justify-between px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition"
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
                          className="block px-4 py-2 text-xs text-stone-700 hover:bg-rose-50 hover:text-rose-600"
                        >
                          My Profile &amp; Orders
                        </Link>
                        <Link
                          to="/account?tab=wishlist"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center justify-between px-4 py-2 text-xs text-stone-700 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <span>My Wishlist</span>
                          {wishlistItems.length > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                              {wishlistItems.length}
                            </span>
                          )}
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
                        <div className="p-3 border-b border-stone-100">
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
                          className="block px-4 py-2 text-xs text-stone-700 hover:bg-rose-50 hover:text-rose-600"
                        >
                          Track Order
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart Button: Clean Icon with Count Badge (Hidden on Cart and Checkout pages) */}
            {!isCartOrCheckout && (
              <button
                onClick={openCart}
                aria-label="Shopping Bag"
                className="relative p-1.5 sm:p-2.5 rounded-full text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                title="Cart"
              >
                <ShoppingBag size={19} />
                {totalItems() > 0 && (
                  <span className="absolute top-0.5 sm:top-1 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-2xs">
                    {totalItems()}
                  </span>
                )}
              </button>
            )}

            {/* Mobile Hamburger Menu */}
            <button
              aria-label="Toggle Menu"
              onClick={() => setMobileOpen(true)}
              className="p-1.5 sm:p-2 rounded-full text-stone-700 hover:bg-stone-100 transition-colors md:hidden"
            >
              <Menu size={22} />
            </button>
          </div>
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
              className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs md:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 280 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col justify-between overflow-y-auto"
              >
                <div>
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100">
                    <LogoMark to="/" size="compact" />
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="p-2 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition"
                      aria-label="Close menu"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Mobile Drawer Account Banner */}
                  <div className="p-4 border-b border-stone-100">
                    {user ? (
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-50/80 to-pink-50/50 border border-rose-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-9 w-9 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-xs">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-stone-900 truncate">{user.name}</p>
                            <p className="text-[10px] text-stone-500 truncate">{user.email || "Customer"}</p>
                          </div>
                        </div>
                        <Link
                          to="/account"
                          onClick={() => setMobileOpen(false)}
                          className="text-[11px] font-bold text-rose-700 bg-white px-3 py-1.5 rounded-full shadow-2xs border border-rose-200/60 shrink-0 hover:bg-rose-50 transition"
                        >
                          Profile
                        </Link>
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-900">Welcome to Studio</p>
                          <p className="text-[10px] text-stone-500">Sign in to track orders</p>
                        </div>
                        <Link
                          to="/login"
                          onClick={() => setMobileOpen(false)}
                          className="btn-primary py-1.5 px-3.5 text-[11px] shrink-0"
                        >
                          Sign In
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Drawer Navigation Links */}
                  <div className="p-4 space-y-1">
                    {/* Wishlist Link inside Mobile Drawer */}
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        openWishlist();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold text-stone-800 hover:bg-rose-50 hover:text-rose-600 transition group"
                    >
                      <span className="flex items-center gap-2.5">
                        <Heart
                          size={16}
                          className={wishlistItems.length > 0 ? "fill-rose-500 text-rose-500" : "text-stone-400 group-hover:text-rose-500"}
                        />
                        <span>My Wishlist</span>
                      </span>
                      {wishlistItems.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-xs">
                          {wishlistItems.length}
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-400">0 items</span>
                      )}
                    </button>

                    {/* Admin Dashboard link if user is admin */}
                    {user?.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between p-3 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition"
                      >
                        <span className="flex items-center gap-2">
                          <span>⚡</span>
                          <span>Admin Dashboard</span>
                        </span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-rose-200 text-rose-800 font-bold">
                          Admin
                        </span>
                      </Link>
                    )}

                    {/* Shop 3D Models Dropdown Accordion */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setMobileShopOpen((prev) => !prev)}
                        className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold text-stone-800 hover:bg-stone-50 transition"
                      >
                        <div className="flex items-center gap-2">
                          <Layers size={16} className="text-stone-500" />
                          <span>Shop 3D Models</span>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`text-stone-400 transition-transform duration-200 ${
                            mobileShopOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {mobileShopOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 pr-2 py-1 space-y-0.5 border-l-2 border-rose-100 ml-4 my-1">
                              <Link
                                to="/shop"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center justify-between p-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50"
                              >
                                <span>All Collections</span>
                                <ArrowRight size={12} />
                              </Link>
                              {categories.map((cat) => (
                                <Link
                                  key={cat._id || cat.slug}
                                  to={`/shop?category=${cat.slug}`}
                                  onClick={() => setMobileOpen(false)}
                                  className="flex items-center justify-between p-2 rounded-lg text-xs text-stone-600 hover:text-rose-600 hover:bg-stone-50"
                                >
                                  <span className="font-medium">{cat.name}</span>
                                  {cat.badge && (
                                    <span className="text-[10px] text-rose-500 font-semibold">{cat.badge}</span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Personalize 3D Keepsake Dropdown Accordion */}
                    <div className="mt-1">
                      <button
                        type="button"
                        onClick={() => setMobileKeepsakeOpen((prev) => !prev)}
                        className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-bold text-rose-600 bg-rose-50/70 hover:bg-rose-50 transition"
                      >
                        <span className="flex items-center gap-2">
                          <Sparkles size={16} />
                          <span>Personalize 3D Keepsake</span>
                        </span>
                        <ChevronDown
                          size={16}
                          className={`text-rose-500 transition-transform duration-200 ${
                            mobileKeepsakeOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {mobileKeepsakeOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 pr-2 py-1 space-y-0.5 border-l-2 border-rose-200 ml-4 my-1">
                              <Link
                                to="/personalized"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center justify-between p-2 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-100/60"
                              >
                                <span>Overview & Customizer</span>
                                <ArrowRight size={12} />
                              </Link>
                              {(keepsakeCategories.length > 0 ? keepsakeCategories : [
                                { name: "Single", slug: "single", icon: "👤" },
                                { name: "Couple", slug: "couple", icon: "👩‍❤️‍👨" },
                                { name: "Family", slug: "family", icon: "👨‍👩‍👧" },
                                { name: "Kid & Baby", slug: "kid-baby", icon: "👶" },
                                { name: "Pet", slug: "pet", icon: "🐾" },
                              ]).map((cat) => (
                                <Link
                                  key={cat._id || cat.slug}
                                  to={`/personalized?category=${cat.slug}`}
                                  onClick={() => setMobileOpen(false)}
                                  className="flex items-center justify-between p-2 rounded-lg text-xs text-stone-600 hover:text-rose-600 hover:bg-stone-50"
                                >
                                  <span className="flex items-center gap-2">
                                    <span>{cat.icon || "👤"}</span>
                                    <span className="font-medium">{cat.name}</span>
                                  </span>
                                  <span className="text-[10px] text-stone-400">Personalize</span>
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <NavLink
                      to="/how-it-works"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl text-sm font-semibold text-stone-800 hover:bg-stone-50"
                    >
                      <span>How It Works</span>
                      <ArrowRight size={14} className="text-stone-400" />
                    </NavLink>

                    <NavLink
                      to="/about"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl text-sm font-semibold text-stone-800 hover:bg-stone-50"
                    >
                      <span>About Studio</span>
                      <ArrowRight size={14} className="text-stone-400" />
                    </NavLink>

                    <NavLink
                      to="/track-order"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl text-sm font-semibold text-stone-800 hover:bg-stone-50"
                    >
                      <span>Track Order</span>
                      <ArrowRight size={14} className="text-stone-400" />
                    </NavLink>
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="p-4 border-t border-stone-100 bg-stone-50 space-y-2">
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      navigate("/personalized");
                    }}
                    className="btn-primary w-full py-3 text-xs"
                  >
                    <span>Create 3D Figurine</span>
                  </button>

                  {user && (
                    <button
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="w-full text-center py-2 text-xs font-semibold text-stone-500 hover:text-red-600 transition"
                    >
                      Sign Out
                    </button>
                  )}
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
