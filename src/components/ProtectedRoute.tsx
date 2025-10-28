interface ProtectedRouteProps {
  element: React.ReactElement;
  requiredRole?: "industry" | "buyer";
}

const ProtectedRoute = ({ element }: ProtectedRouteProps) => {
  return element;
};

export default ProtectedRoute;
