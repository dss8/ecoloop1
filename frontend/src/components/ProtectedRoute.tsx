/**
 * Wraps a route element. Redirects unauthenticated users to /login.
 */
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center" data-testid="auth-loading">
        <div className="w-8 h-8 border-2 border-[#83f0c7]/30 border-t-[#83f0c7] rounded-full animate-spin" />
      </div>
    );
  }

  // If Firebase is NOT configured, allow through (dev mode) so the app remains usable.
  if (!configured) return <>{children}</>;

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  return <>{children}</>;
}
