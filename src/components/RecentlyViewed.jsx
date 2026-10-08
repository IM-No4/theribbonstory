import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { useRecentlyViewedStore } from "../store/recentlyViewedStore";
import { assetUrl } from "../api/client";

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function RecentlyViewed({ currentProductId }) {
  const { items } = useRecentlyViewedStore();

  // Filter out the product currently being viewed
  const displayItems = items.filter(
    (item) => (item._id || item.slug) !== currentProductId
  );

  if (displayItems.length === 0) return null;

  return (
    <section className="py-10 border-t border-blush-200">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ribbon-600">
              Your Browsing History
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-burgundy-900 mt-0.5 flex items-center gap-2">
              <Eye size={18} className="text-ribbon-500" />
              <span>Recently Viewed Keepsakes</span>
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {displayItems.slice(0, 6).map((product) => {
            const img = product.images?.[0] || product.image || "/src/assets/images/photo-magnet.jpeg";
            return (
              <Link
                key={product._id || product.slug}
                to={`/product/${product.slug}`}
                className="group p-3 rounded-2xl bg-white border border-blush-200 hover:border-ribbon-400 hover:shadow-card transition flex flex-col justify-between space-y-2"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-rose-50 border border-blush-100">
                  <img
                    src={assetUrl(img)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs text-burgundy-900 group-hover:text-ribbon-600 transition line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="text-xs font-bold text-burgundy-900 mt-1">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
