import { Navigate } from "react-router-dom";
import { getSession } from "@/lib/auth";

interface ProtectedRouteProps {
  element: React.ReactElement;
  requiredRole?: "industry" | "buyer";
}

const ProtectedRoute = ({ element, requiredRole }: ProtectedRouteProps) => {
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && session.role !== requiredRole) {
    return <Navigate to={session.role === "industry" ? "/industry" : "/buyer"} replace />;
  }

  return element;
};

export default ProtectedRoute;
