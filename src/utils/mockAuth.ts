import { getSession, clearSession, type AuthUser } from "@/lib/auth";

export interface User extends AuthUser {
  id: string;
  email: string;
  role: "industry" | "buyer";
  name: string;
  phone?: string;
}

// Keep these for backward compatibility, but delegate to new auth system
export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  } else {
    localStorage.removeItem("currentUser");
  }
};

export const getCurrentUser = (): User | null => {
  const session = getSession();
  if (session) {
    return {
      id: session.id,
      email: session.email,
      name: session.name,
      role: session.role,
      phone: session.phone,
    };
  }

  const stored = localStorage.getItem("currentUser");
  if (stored) return JSON.parse(stored);

  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  const role: User["role"] = path.startsWith("/industry") ? "industry" : "buyer";
  return {
    id: "guest",
    email: "guest@example.com",
    name: role === "industry" ? "Guest Seller" : "Guest Buyer",
    role,
    phone: "",
  };
};

export const logout = () => {
  localStorage.removeItem("currentUser");
  clearSession();
};
