// Authentication utilities - Works with both Express (dev) and Netlify Functions (prod)

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
// Dev: Use Express server at /api/auth/* (via localhost:3001)
// Prod (Netlify): Use /.netlify/functions/* endpoints
const getAPIBaseURL = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Check if we're in development
  if (import.meta.env.DEV) {
    // Use Express server endpoints in development
    return 'http://localhost:3001/api/auth';
  }

  // Production: Use Netlify Functions
  return '/.netlify/functions';
};

const API_BASE_URL = getAPIBaseURL();
const IS_DEVELOPMENT = import.meta.env.DEV;

/**
 * Register a new user via API (Express in dev, Netlify Functions in prod)
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

    const endpoint = IS_DEVELOPMENT
      ? `${API_BASE_URL}/register`
      : `${API_BASE_URL}/register-user`;

    const response = await fetch(endpoint, {
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
 * Login user with email and password via API (Express in dev, Netlify Functions in prod)
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

    const endpoint = IS_DEVELOPMENT
      ? `${API_BASE_URL}/login`
      : `${API_BASE_URL}/login`;

    const response = await fetch(endpoint, {
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
 * Google OAuth authentication via API (Express in dev, Netlify Functions in prod)
 */
export const googleOAuthLogin = async (
  token: string,
  role: "industry" | "buyer"
): Promise<{ success: boolean; user?: AuthUser; error?: string; token?: string }> => {
  try {
    if (!token) {
      return { success: false, error: "Token required" };
    }

    const endpoint = IS_DEVELOPMENT
      ? `${API_BASE_URL}/google`
      : `${API_BASE_URL}/google-oauth`;

    const response = await fetch(endpoint, {
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
 * Get current user from API by ID (Express in dev, Netlify Functions in prod)
 */
export const getCurrentUserData = async (userId: string): Promise<AuthUser | null> => {
  try {
    const endpoint = IS_DEVELOPMENT
      ? `${API_BASE_URL}/user/${userId}`
      : `${API_BASE_URL}/get-auth-user?id=${userId}`;

    const response = await fetch(endpoint, {
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
