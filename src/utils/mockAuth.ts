import { getSession, clearSession, type AuthUser } from "@/lib/auth";

export interface User extends AuthUser {
  id: string;
  email: string;
  role: "buyer" | "admin" | "industry" | "sourcing-agent";
  name: string;
  phone?: string;
  isAdmin?: boolean;
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
      isAdmin: session.isAdmin,
    };
  }

  const stored = localStorage.getItem("currentUser");
  if (stored) return JSON.parse(stored);

  return null;
};

export const logout = () => {
  localStorage.removeItem("currentUser");
  clearSession();
};
