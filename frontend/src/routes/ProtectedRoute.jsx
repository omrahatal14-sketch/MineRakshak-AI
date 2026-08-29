import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { profile, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center text-slate">Loading…</div>;
  if (!profile) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(profile.role)) return <Navigate to="/" replace />;

  return children;
}
