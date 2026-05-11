import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "buyer" | "admin" | "industry" | "sourcing-agent";
  isAdmin?: boolean;
  createdAt?: string;
  oauthId?: string;
  oauthProvider?: string;
}

const ADMIN_EMAIL = 'oluwafemiod7@gmail.com';

/**
 * Register a new user via Supabase
 */
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  phone: string,
  role: "buyer" | "industry" | "sourcing-agent" = "buyer"
): Promise<{ success: boolean; user?: AuthUser; error?: string; token?: string }> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        phone: phone,
        role: email === ADMIN_EMAIL ? 'admin' : role,
      }
    }
  });

  if (error) return { success: false, error: error.message };

  if (data.user) {
    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata.full_name,
      phone: data.user.user_metadata.phone,
      role: data.user.user_metadata.role || 'buyer',
      isAdmin: data.user.user_metadata.role === 'admin' || data.user.email === ADMIN_EMAIL,
      createdAt: data.user.created_at,
    };
    return { success: true, user, token: data.session?.access_token };
  }

  return { success: false, error: "Unknown error during registration" };
};

/**
 * Login user with email and password via Supabase
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string; token?: string }> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { success: false, error: error.message };

  if (data.user) {
    const isAdmin = data.user.email === ADMIN_EMAIL || data.user.user_metadata.role === 'admin';
    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata.full_name || data.user.email!.split('@')[0],
      phone: data.user.user_metadata.phone,
      role: isAdmin ? 'admin' : (data.user.user_metadata.role || 'buyer'),
      isAdmin: isAdmin,
      createdAt: data.user.created_at,
    };
    saveSession(user);
    return { success: true, user, token: data.session?.access_token };
  }

  return { success: false, error: "Unknown error during login" };
};

/**
 * Google OAuth authentication via Supabase
 */
export const googleOAuthLogin = async (
  token: string
): Promise<{ success: boolean; user?: AuthUser; error?: string; token?: string }> => {
  // In a real app with Supabase, we usually use signInWithOAuth
  // If we already have a token from Google, we might use it differently
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: token,
  });

  if (error) return { success: false, error: error.message };

  if (data.user) {
    const isAdmin = data.user.email === ADMIN_EMAIL || data.user.user_metadata.role === 'admin';
    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata.full_name,
      role: isAdmin ? 'admin' : (data.user.user_metadata.role || 'buyer'),
      isAdmin: isAdmin,
      oauthProvider: "google",
    };
    saveSession(user);
    return { success: true, user, token: data.session?.access_token };
  }

  return { success: false, error: "Google login failed" };
};

/**
 * Get current user data via Supabase
 */
export const getCurrentUserData = async (userId: string): Promise<AuthUser | null> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) return null;

  const isAdmin = user.email === ADMIN_EMAIL || user.user_metadata.role === 'admin';
  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata.full_name || user.email!.split('@')[0],
    phone: user.user_metadata.phone,
    role: isAdmin ? 'admin' : (user.user_metadata.role || 'buyer'),
    isAdmin: isAdmin,
    createdAt: user.created_at,
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
  supabase.auth.signOut();
};

/**
 * Logout user
 */
export const logoutUser = () => {
  clearSession();
};

// ============ INITIALIZATION ============

export const initializeAuth = async (): Promise<AuthUser | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user) {
    const isAdmin = session.user.email === ADMIN_EMAIL || session.user.user_metadata.role === 'admin';
    const user: AuthUser = {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.user_metadata.full_name || session.user.email!.split('@')[0],
      phone: session.user.user_metadata.phone,
      role: isAdmin ? 'admin' : (session.user.user_metadata.role || 'buyer'),
      isAdmin: isAdmin,
      createdAt: session.user.created_at,
    };
    saveSession(user);
    return user;
  }

  return getSession();
};
