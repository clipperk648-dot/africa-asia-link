// Authentication utilities - Mock data only

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "buyer" | "admin";
  isAdmin?: boolean;
  createdAt?: string;
  oauthId?: string;
  oauthProvider?: string;
}

/**
 * Register a new user via Mock Auth
 */
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  phone: string
): Promise<{ success: boolean; user?: AuthUser; error?: string; token?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay

  if (!email || !password || !name) {
    return { success: false, error: "Missing required fields" };
  }

  const user: AuthUser = {
    id: `user_${Date.now()}`,
    email,
    name,
    phone,
    role: "buyer",
    createdAt: new Date().toISOString(),
  };

  return {
    success: true,
    user,
    token: "mock_token_" + Date.now(),
  };
};

/**
 * Login user with email and password via Mock Auth
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string; token?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  // Predefined mock accounts
  if (email === "admin@echina.com" && password === "admin") {
    const user: AuthUser = {
      id: 'user_admin_001',
      email: 'admin@echina.com',
      name: 'Admin User',
      phone: '+86 138 1234 5678',
      role: 'admin',
      isAdmin: true,
      createdAt: new Date().toISOString(),
    };
    return { success: true, user, token: "mock_token_admin" };
  }

  const user: AuthUser = {
    id: 'user_buyer_001',
    email: email,
    name: email.split('@')[0],
    phone: '+234 801 234 5678',
    role: 'buyer',
    isAdmin: false,
    createdAt: new Date().toISOString(),
  };

  return {
    success: true,
    user,
    token: "mock_token_buyer",
  };
};

/**
 * Google OAuth authentication via Mock Auth
 */
export const googleOAuthLogin = async (
  token: string
): Promise<{ success: boolean; user?: AuthUser; error?: string; token?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
  
  const user: AuthUser = {
    id: 'user_google_001',
    email: 'google_user@gmail.com',
    name: 'Google User',
    role: 'buyer',
    oauthProvider: "google",
  };

  return {
    success: true,
    user,
    token: "mock_token_google",
  };
};

/**
 * Get current user data via Mock Auth
 */
export const getCurrentUserData = async (userId: string): Promise<AuthUser | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    id: userId,
    email: 'user@example.com',
    name: 'Example User',
    role: 'buyer',
    createdAt: new Date().toISOString(),
  };
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

// ============ MOCK AUTHENTICATION (Development Only) ============

/**
 * Auto-login user with mock data (when backend is unavailable)
 * This allows users to access the app without authentication barriers
 */
export const autoLoginWithMockData = (isAdmin = false): AuthUser => {
  const mockUser: AuthUser = isAdmin
    ? {
        id: 'user_admin_001',
        email: 'admin@echina.com',
        name: 'Admin User',
        phone: '+86 138 1234 5678',
        role: 'admin',
        isAdmin: true,
        createdAt: new Date().toISOString(),
      }
    : {
        id: 'user_buyer_001',
        email: 'buyer@echina.com',
        name: 'John Buyer',
        phone: '+234 801 234 5678',
        role: 'buyer',
        isAdmin: false,
        createdAt: new Date().toISOString(),
      };

  saveSession(mockUser);

  return mockUser;
};

/**
 * Initialize mock authentication on app load
 * This ensures users are always logged in for development/testing
 */
export const initializeMockAuth = (): AuthUser | null => {
  // Check if user already has a session
  let session = getSession();

  // If no session, auto-login with mock buyer account
  if (!session) {
    session = autoLoginWithMockData("buyer");
  }

  return session;
};
