import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Layers,
  ShoppingBag,
  Plus,
  ArrowRight,
  Sparkles,
  DollarSign,
} from "lucide-react";
import { api } from "../../api/client";
import SalesOverview from "../../components/admin/SalesOverview";
import EmailCheck from "../../components/admin/EmailCheck";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/admin/stats")
      .then(({ data }) => {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setLowStock(data.lowStockProducts || []);
      })
      .catch((err) => {
        console.error("Failed to load admin stats:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-800/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "All-time Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`,
      icon: DollarSign,
      color: "from-emerald-500/20 to-emerald-700/20 text-emerald-400 border-emerald-500/30",
      change: "Excludes cancelled & refunded",
    },
    {
      label: "Active Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "from-rose-500/20 to-rose-700/20 text-rose-400 border-rose-500/30",
      change: "In database",
    },
    {
      label: "Dynamic Collections",
      value: stats?.totalCategories || 0,
      icon: Layers,
      color: "from-purple-500/20 to-purple-700/20 text-purple-400 border-purple-500/30",
      change: "Live in store",
    },
    {
      label: "Total Customer Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: "from-blue-500/20 to-blue-700/20 text-blue-400 border-blue-500/30",
      change: `${stats?.pendingOrders || 0} pending fulfillment`,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Store Overview & Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your dynamic product catalog, custom collections, and customer orders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/products?action=new"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-ribbon-700 hover:from-rose-500 hover:to-ribbon-600 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-950/40 transition"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </Link>
          <Link
            to="/admin/collections?action=new"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
          >
            <Plus size={16} />
            <span>Add Collection</span>
          </Link>
        </div>
      </div>

      <SalesOverview />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-gradient-to-br bg-slate-950 border ${card.color} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{card.label}</span>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold font-display text-white">{card.value}</div>
                <div className="text-[11px] text-slate-400 mt-1">{card.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Recent Orders & Low Stock Warning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-base text-white">Recent Customer Orders</h3>
              <p className="text-xs text-slate-400">Latest transactions and gift orders placed</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No orders placed yet. Products ready for customers!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Items</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-900/40">
                      <td className="py-3 font-mono text-[11px] text-slate-400">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3">
                        <div className="font-semibold text-white">{order.user?.name || "Guest"}</div>
                        <div className="text-[11px] text-slate-400">{order.shippingAddress?.city}</div>
                      </td>
                      <td className="py-3">{order.items?.length || 0} items</td>
                      <td className="py-3 font-semibold text-white">₹{order.totalPrice}</td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.status === "delivered"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                              : order.status === "shipped"
                              ? "bg-blue-950 text-blue-400 border border-blue-800/50"
                              : "bg-amber-950 text-amber-400 border border-amber-800/50"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Collections / Inventory Side Card */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-rose-400" />
              <h3 className="font-display font-bold text-base text-white">Catalog Controls</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every change you make to pricing, images, categories, and options updates the live storefront instantly.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                to="/admin/products"
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 transition"
              >
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-rose-400" />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white">Manage Products</div>
                    <div className="text-[11px] text-slate-400">Edit prices, variants & photos</div>
                  </div>
                </div>
                <ArrowRight size={15} className="text-slate-400" />
              </Link>

              <Link
                to="/admin/collections"
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 transition"
              >
                <div className="flex items-center gap-3">
                  <Layers size={18} className="text-purple-400" />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white">Organize Collections</div>
                    <div className="text-[11px] text-slate-400">Add or reorder categories</div>
                  </div>
                </div>
                <ArrowRight size={15} className="text-slate-400" />
              </Link>

              <Link
                to="/admin/orders"
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 transition"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag size={18} className="text-emerald-400" />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white">Fulfill Orders</div>
                    <div className="text-[11px] text-slate-400">View customer uploads & notes</div>
                  </div>
                </div>
                <ArrowRight size={15} className="text-slate-400" />
              </Link>
            </div>
          </div>

          <EmailCheck />
        </div>
      </div>
    </div>
  );
}
