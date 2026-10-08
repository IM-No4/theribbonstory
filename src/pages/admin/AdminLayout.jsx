import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Tag,
  MessageSquare,
  Box,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();


  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/3d-studio", label: "3D Figurine Studio (AI)", icon: Box },
    { to: "/admin/orders", label: "Customer Orders", icon: ShoppingBag },
    { to: "/admin/products", label: "Products & Pricing", icon: Package },
    { to: "/admin/collections", label: "Collections", icon: Layers },
    { to: "/admin/coupons", label: "Coupons & Discounts", icon: Tag },
    { to: "/admin/reviews", label: "Reviews & Feedback", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950/95 backdrop-blur-md border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-500 to-ribbon-600 flex items-center justify-center text-white font-bold shadow-lg shadow-rose-900/30">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-white tracking-wide block">
                The Ribbon Story
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800/50">
                Admin Center
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Store Management
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-rose-600 to-ribbon-700 text-white shadow-md shadow-rose-950/40 font-semibold"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/80"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={15} className="opacity-50" />
              </NavLink>
            );
          })}

          <div className="pt-6 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Quick Actions
          </div>
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 transition"
          >
            <ExternalLink size={18} />
            <span>View Live Storefront</span>
          </Link>
        </nav>

        {/* Admin User Profile & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="h-9 w-9 rounded-full bg-rose-900/50 border border-rose-700/50 flex items-center justify-center text-rose-300 font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">{user?.name || "Admin"}</div>
              <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 border border-rose-900/40 transition"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
        {/* Mobile Header Bar */}
        <header className="md:hidden bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-rose-400" />
            <span className="font-display font-bold text-sm text-white">TRS Admin</span>
          </div>
          <Link to="/" target="_blank" className="p-2 text-slate-400 hover:text-white">
            <ExternalLink size={18} />
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
