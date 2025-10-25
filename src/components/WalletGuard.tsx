import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { isWalletUnlocked } from "@/utils/walletPin";

interface WalletGuardProps {
  element: React.ReactElement;
}

const WalletGuard = ({ element }: WalletGuardProps) => {
  const user = getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname !== "/wallet/pin" && !isWalletUnlocked(user.id)) {
    return <Navigate to="/wallet/pin" replace state={{ from: location.pathname }} />;
  }

  return element;
};

export default WalletGuard;
