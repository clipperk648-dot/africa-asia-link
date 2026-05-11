import React from "react";
import { Navigate } from "react-router-dom";
import { getSession } from "@/lib/auth";

interface ProtectedRouteProps {
  element: React.ReactElement;
  requiredRole?: "buyer" | "admin" | "industry" | "sourcing-agent" | ("buyer" | "admin" | "industry" | "sourcing-agent")[];
}

const ProtectedRoute = ({ element, requiredRole }: ProtectedRouteProps) => {
  const user = getSession();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role as any) && !user.isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  return element;
};

export default ProtectedRoute;
