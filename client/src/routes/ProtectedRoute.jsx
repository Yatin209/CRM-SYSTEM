import { Navigate, Outlet, useLocation } from "react-router-dom";
import { canAccess } from "../config/roles.js";
import { navigationItems } from "../config/navigation.js";
import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const route = navigationItems.find((item) => item.path === location.pathname);
  if (route && !canAccess(user.role, route.id)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
