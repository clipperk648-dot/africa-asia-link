import React from "react";
import { Navigate } from "react-router-dom";
import { getSession } from "@/lib/auth";

interface ProtectedRouteProps {
  element: React.ReactElement;
  requiredRole?: "industry" | "buyer";
}

const ProtectedRoute = ({ element, requiredRole }: ProtectedRouteProps) => {
  const user = getSession();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default ProtectedRoute;
