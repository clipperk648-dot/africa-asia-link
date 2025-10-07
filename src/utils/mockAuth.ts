export interface User {
  id: string;
  email: string;
  role: "industry" | "buyer";
  name: string;
}

export const mockLogin = (email: string, password: string): User | null => {
  // Mock users
  if (email === "industry@china.com" && password === "password") {
    return {
      id: "1",
      email: "industry@china.com",
      role: "industry",
      name: "Chen Industries Ltd",
    };
  }
  
  if (email === "buyer@nigeria.com" && password === "password") {
    return {
      id: "2",
      email: "buyer@nigeria.com",
      role: "buyer",
      name: "Lagos Trading Co",
    };
  }
  
  return null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  } else {
    localStorage.removeItem("currentUser");
  }
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem("currentUser");
  return stored ? JSON.parse(stored) : null;
};

export const logout = () => {
  localStorage.removeItem("currentUser");
};
