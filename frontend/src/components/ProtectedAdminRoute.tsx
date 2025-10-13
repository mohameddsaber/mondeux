import { Navigate } from "react-router-dom";

interface ProtectedAdminRouteProps {
  isAdmin: boolean;
  isCheckingAdmin: boolean;
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ isAdmin, isCheckingAdmin, children }: ProtectedAdminRouteProps) {
  if (isCheckingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}