import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireProvider?: boolean;
  requireSeller?: boolean;
}

export function ProtectedRoute({ children, requireAdmin, requireProvider, requireSeller }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !user?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireProvider && !user?.is_provider) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireSeller && !user?.is_seller) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
