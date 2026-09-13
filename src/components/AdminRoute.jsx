import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function AdminRoute() {
  const { user, token } = useAuthStore();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-blush-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 bg-rose-100 text-burgundy-900 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <h2 className="font-display text-2xl text-burgundy-900 font-bold">Access Denied</h2>
          <p className="text-sm text-espresso-500">
            You do not have administrator permissions to access this area. Please sign in with an administrator account.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Navigate to="/" replace />
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
