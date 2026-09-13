import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Loader2, Sparkles } from "lucide-react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import WishlistDrawer from "./components/WishlistDrawer";
import LocationModal from "./components/LocationModal";
import FloatingHelp from "./components/FloatingHelp";

// Lazy-Loaded Storefront Pages (High-Speed Code Splitting)
const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const ThreeDKeepsakes = lazy(() => import("./pages/ThreeDKeepsakes"));
const PersonalizedPage = lazy(() => import("./pages/PersonalizedPage"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const Account = lazy(() => import("./pages/Account"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const BuildABox = lazy(() => import("./pages/BuildABox"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy-Loaded Admin Portal Pages & Guard
const AdminRoute = lazy(() => import("./components/AdminRoute"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminCollections = lazy(() => import("./pages/admin/AdminCollections"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));

// Luxury Branded Page Loading Suspense Fallback
function PageLoader() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
      <div className="relative flex items-center justify-center">
        <Loader2 className="animate-spin text-ribbon-500" size={38} />
        <Sparkles size={16} className="text-amber-400 absolute animate-pulse" />
      </div>
      <p className="font-display font-bold text-xs uppercase tracking-widest text-burgundy-900 animate-pulse">
        The Ribbon Story
      </p>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function App() {
  const { pathname } = useLocation();
  const isAdminPath = pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: "#4A1F29", color: "#FFFDF8", fontSize: "14px", borderRadius: "12px" },
          success: { iconTheme: { primary: "#D68893", secondary: "#FFFDF8" } },
        }}
      />
      <ScrollToTop />

      {/* Show Storefront navigation components only outside admin portal */}
      {!isAdminPath && (
        <>
          <Navbar />
          <CartDrawer />
          <WishlistDrawer />
          <LocationModal />
          <FloatingHelp />
        </>
      )}

      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Storefront Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/3d-keepsakes" element={<ThreeDKeepsakes />} />
            <Route path="/personalized" element={<PersonalizedPage />} />
            <Route path="/build-a-box" element={<BuildABox />} />
            <Route path="/build-a-hamper" element={<BuildABox />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/order-success/:id" element={<OrderSuccess />} />
            <Route path="/account" element={<Account />} />
            <Route path="/orders" element={<Account />} />
            <Route path="/about" element={<About />} />
            <Route path="/our-story" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Admin Authentication */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Portal */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="collections" element={<AdminCollections />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="reviews" element={<AdminReviews />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminPath && <Footer />}
    </div>
  );
}

export default App;
