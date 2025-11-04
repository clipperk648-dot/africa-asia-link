// Authentication utilities - Netlify Functions backend

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "industry" | "buyer";
  createdAt?: string;
  oauthId?: string;
  oauthProvider?: string;
}

// Netlify functions endpoint
// In production, functions are available at /.netlify/functions/
// In development with local server, use localhost:3001 for Express or /.netlify/functions/ for Netlify
const API_BASE_URL = import.meta.env.VITE_API_URL || '/.netlify/functions';

/**
 * Register a new user via Netlify function
 */
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  phone: string,
  role: "industry" | "buyer"
): Promise<{ success: boolean; user?: AuthUser; error?: string; token?: string }> => {
  try {
    if (!email || !password || !name || !role) {
      return { success: false, error: "Missing required fields" };
    }

    const response = await fetch(`${API_BASE_URL}/register-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name, phone, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Registration failed" };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        phone: data.user.phone,
        role: data.user.role,
      },
      token: data.token,
    };
  } catch (error) {
    console.error("Registration failed:", error);
    return { success: false, error: String(error) || "Registration failed" };
  }
};

/**
 * Login user with email and password via Netlify function
 */
export const loginUser = async (
  email: string,
  password: string,
  role: "industry" | "buyer"
): Promise<{ success: boolean; user?: AuthUser; error?: string; token?: string }> => {
  try {
    if (!email || !password) {
      return { success: false, error: "Email and password required" };
    }

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Login failed" };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        phone: data.user.phone,
        role: data.user.role,
      },
      token: data.token,
    };
  } catch (error) {
    console.error("Login failed:", error);
    return { success: false, error: String(error) || "Login failed. Please try again." };
  }
};

/**
 * Google OAuth authentication via Netlify function
 */
export const googleOAuthLogin = async (
  token: string,
  role: "industry" | "buyer"
): Promise<{ success: boolean; user?: AuthUser; error?: string; token?: string }> => {
  try {
    if (!token) {
      return { success: false, error: "Token required" };
    }

    const response = await fetch(`${API_BASE_URL}/google-oauth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Google authentication failed" };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        phone: data.user.phone,
        role: data.user.role,
        oauthProvider: "google",
      },
      token: data.token,
    };
  } catch (error) {
    console.error("Google OAuth login failed:", error);
    return { success: false, error: String(error) || "Google authentication failed. Please try again." };
  }
};

/**
 * Get current user from Netlify function by ID
 */
export const getCurrentUserData = async (userId: string): Promise<AuthUser | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-auth-user?id=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch user:", response.statusText);
      return null;
    }

    const data = await response.json();

    if (!data.user) {
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      phone: data.user.phone,
      role: data.user.role,
      createdAt: data.user.created_at,
    };
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
};

// ============ LOCAL STORAGE SESSION MANAGEMENT ============

const SESSION_KEY = "echina_session";
const SESSION_USER_KEY = "echina_user";

/**
 * Save session to local storage
 */
export const saveSession = (user: AuthUser) => {
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, timestamp: Date.now() }));
};

/**
 * Get current session
 */
export const getSession = (): AuthUser | null => {
  const userStr = localStorage.getItem(SESSION_USER_KEY);
  const sessionStr = localStorage.getItem(SESSION_KEY);

  if (!userStr || !sessionStr) {
    return null;
  }

  try {
    const user = JSON.parse(userStr);
    const session = JSON.parse(sessionStr);

    // Check if session is still valid (24 hour expiry)
    const sessionAge = Date.now() - session.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (sessionAge > maxAge) {
      clearSession();
      return null;
    }

    return user;
  } catch {
    return null;
  }
};

/**
 * Clear session from local storage
 */
export const clearSession = () => {
  localStorage.removeItem(SESSION_USER_KEY);
  localStorage.removeItem(SESSION_KEY);
};

/**
 * Logout user
 */
export const logoutUser = () => {
  clearSession();
};
