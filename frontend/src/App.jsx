import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import FieldOfficerDashboard from "./pages/field-officer/Dashboard.jsx";
import MineOfficialDashboard from "./pages/mine-official/Dashboard.jsx";
import CorporateDashboard from "./pages/corporate/Dashboard.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import InspectionList from "./pages/inspections/InspectionList.jsx";
import ConductInspection from "./pages/inspections/ConductInspection.jsx";
import InspectionDetail from "./pages/inspections/InspectionDetail.jsx";
import CorrectiveActionList from "./pages/corrective-actions/CorrectiveActionList.jsx";

const ROLE_HOME = {
  field_officer: "/field-officer",
  mine_official: "/mine-official",
  corporate: "/corporate",
  admin: "/admin",
};

function RoleRedirect() {
  const { profile, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-slate">Loading…</div>;
  if (!profile) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[profile.role] || "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Role Dashboards */}
          <Route
            path="/field-officer"
            element={
              <ProtectedRoute allowedRoles={["field_officer"]}>
                <FieldOfficerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mine-official"
            element={
              <ProtectedRoute allowedRoles={["mine_official"]}>
                <MineOfficialDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/corporate"
            element={
              <ProtectedRoute allowedRoles={["corporate"]}>
                <CorporateDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Inspection Management Routes */}
          <Route
            path="/inspections"
            element={
              <ProtectedRoute allowedRoles={["field_officer", "mine_official", "corporate", "admin"]}>
                <InspectionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inspections/:id/conduct"
            element={
              <ProtectedRoute allowedRoles={["field_officer", "admin"]}>
                <ConductInspection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inspections/:id"
            element={
              <ProtectedRoute allowedRoles={["field_officer", "mine_official", "corporate", "admin"]}>
                <InspectionDetail />
              </ProtectedRoute>
            }
          />

          {/* Corrective Actions */}
          <Route
            path="/corrective-actions"
            element={
              <ProtectedRoute allowedRoles={["field_officer", "mine_official", "corporate", "admin"]}>
                <CorrectiveActionList />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
