// Authentication utilities - Works with Express backend (current) and Netlify Functions (future)

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

// Determine API base URL based on environment
// Development: Express backend at localhost:3001
// Production: Netlify Functions at /.netlify/functions/auth-*
const getAPIBaseURL = (): string => {
  // Check for explicit environment variable (for custom backends)
  if (import.meta.env.VITE_API_URL) {
    const baseUrl = import.meta.env.VITE_API_URL;
    return baseUrl.endsWith('/api/auth') ? baseUrl : `${baseUrl}/api/auth`;
  }

  // Development: Use Express server backend
  if (import.meta.env.DEV) {
    return 'http://localhost:3001/api/auth';
  }

  // Production: Use Netlify Functions (always use relative path for same-domain routing)
  // Netlify.toml redirects /api/auth/* to /.netlify/functions/auth-*
  return '/api/auth';
};

const API_BASE_URL = getAPIBaseURL();

// Helper to check if backend is accessible
const checkBackendAccess = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/auth', '')}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
};

/**
 * Register a new user via Express API
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

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
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
    const errorMsg = error instanceof TypeError && error.message === "Failed to fetch"
      ? "Unable to connect to authentication server. Please ensure you're using the correct preview environment."
      : String(error) || "Registration failed. Please try again.";
    return { success: false, error: errorMsg };
  }
};

/**
 * Login user with email and password via Express API
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
      credentials: "include",
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
    const errorMsg = error instanceof TypeError && error.message === "Failed to fetch"
      ? "Unable to connect to authentication server. Please ensure you're using the correct preview environment."
      : String(error) || "Login failed. Please try again.";
    return { success: false, error: errorMsg };
  }
};

/**
 * Google OAuth authentication via Express API
 */
export const googleOAuthLogin = async (
  token: string,
  role: "industry" | "buyer"
): Promise<{ success: boolean; user?: AuthUser; error?: string; token?: string }> => {
  try {
    if (!token) {
      return { success: false, error: "Token required" };
    }

    const response = await fetch(`${API_BASE_URL}/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
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
    const errorMsg = error instanceof TypeError && error.message === "Failed to fetch"
      ? "Unable to connect to authentication server. Please ensure you're using the correct preview environment."
      : String(error) || "Google authentication failed. Please try again.";
    return { success: false, error: errorMsg };
  }
};

/**
 * Get current user from Express API by ID
 */
export const getCurrentUserData = async (userId: string): Promise<AuthUser | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
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
