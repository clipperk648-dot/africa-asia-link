// Authentication utilities - MongoDB with Google OAuth and Traditional Login

import { isDatabaseConfigured, createUser, getUserByEmail, getUserById } from "./db";

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

// Simple hash function (in production, use bcrypt or similar)
// For demo purposes, this is a basic implementation
const hashPassword = (password: string): string => {
  // This is NOT secure for production - use proper bcrypt in real apps
  return btoa(password + "salt_" + new Date().getTime());
};

const verifyPassword = (password: string, hash: string): boolean => {
  // This is NOT secure for production - use proper bcrypt comparison
  return hash.startsWith(btoa(password + "salt_"));
};

/**
 * Register a new user in the database
 */
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  phone: string,
  role: "industry" | "buyer"
): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
  try {
    // Validate inputs
    if (!email || !password || !name || !phone || !role) {
      return { success: false, error: "Missing required fields" };
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return { success: false, error: "Email already registered" };
    }

    const passwordHash = hashPassword(password);
    const user = await createUser(email, passwordHash, name, phone, role);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Registration failed:", error);
    return { success: false, error: String(error) || "Registration failed. Please ensure database is connected." };
  }
};

/**
 * Login user with email and password
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
  try {
    if (!email || !password) {
      return { success: false, error: "Email and password required" };
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return { success: false, error: "Invalid credentials" };
    }

    const passwordValid = verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      return { success: false, error: "Invalid credentials" };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at,
      },
    };
  } catch (error) {
    console.error("Login failed:", error);
    return { success: false, error: String(error) || "Login failed. Please ensure database is connected." };
  }
};

/**
 * Get current user from database by ID
 */
export const getCurrentUserData = async (userId: string): Promise<AuthUser | null> => {
  try {
    if (!isDatabaseConfigured()) {
      return null;
    }

    const user = await getUserById(userId);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      createdAt: user.created_at,
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
