import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { isWalletUnlocked } from "@/utils/walletPin";

interface WalletGuardProps {
  element: React.ReactElement;
  requirePin?: boolean;
}

const WalletGuard = ({ element, requirePin = true }: WalletGuardProps) => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (requirePin && !isWalletUnlocked(user.id)) {
      navigate("/wallet/pin", { state: { from: window.location.pathname } });
    }
  }, [user, navigate, requirePin]);

  return element;
};

export default WalletGuard;
