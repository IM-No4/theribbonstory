import { useState, useEffect } from "react";
import {
  Star,
  Trash2,
  CheckCircle,
  EyeOff,
  Eye,
  MessageSquare,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api, assetUrl } from "../../api/client";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/reviews/admin/all");
      setReviews(data.reviews || []);
    } catch (err) {
      toast.error("Failed to load customer reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggle = async (review) => {
    try {
      const { data } = await api.put(`/reviews/${review._id}/toggle`);
      toast.success(data.message);
      fetchReviews();
    } catch (err) {
      toast.error("Failed to update review visibility");
    }
  };

  const handleDelete = async (review) => {
    if (!window.confirm("Are you sure you want to delete this customer review?")) return;
    try {
      await api.delete(`/reviews/${review._id}`);
      toast.success("Review deleted");
      fetchReviews();
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Customer Reviews & Feedback
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Moderate verified buyer ratings, customer unboxing photos, and praise.
          </p>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-900/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <MessageSquare size={36} className="mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-white">No reviews submitted yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Comment & Photos</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {reviews.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white truncate max-w-[180px]">
                        {r.product?.name || "Product"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{r.userName}</div>
                      <div className="text-[11px] text-slate-400">{r.userCity}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            className={i < r.rating ? "fill-amber-400" : "text-slate-700"}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      {r.title && <div className="font-bold text-white mb-0.5">{r.title}</div>}
                      <p className="text-slate-300 line-clamp-2">{r.comment}</p>
                      {r.photos?.length > 0 && (
                        <div className="flex gap-1.5 mt-2">
                          {r.photos.map((ph, pIdx) => (
                            <a
                              key={pIdx}
                              href={assetUrl(ph)}
                              target="_blank"
                              rel="noreferrer"
                              className="w-8 h-8 rounded-lg overflow-hidden border border-slate-700 block"
                            >
                              <img src={assetUrl(ph)} alt="review" className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.isApproved
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                            : "bg-amber-950 text-amber-400 border border-amber-800/40"
                        }`}
                      >
                        {r.isApproved ? "Approved" : "Hidden"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(r)}
                          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
                          title={r.isApproved ? "Hide Review" : "Approve Review"}
                        >
                          {r.isApproved ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          className="p-2 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 hover:text-rose-300 border border-rose-900/40 transition cursor-pointer"
                          title="Delete Review"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
