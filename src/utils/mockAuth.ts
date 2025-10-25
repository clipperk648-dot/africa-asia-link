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
  // First try to get from new auth system
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

  // Fallback to old localStorage if needed
  const stored = localStorage.getItem("currentUser");
  return stored ? JSON.parse(stored) : null;
};

export const logout = () => {
  localStorage.removeItem("currentUser");
  clearSession();
};
