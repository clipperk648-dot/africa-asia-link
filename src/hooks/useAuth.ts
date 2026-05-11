import { useState, useEffect } from 'react';
import { getSession, AuthUser, logoutUser, saveSession, getCurrentUserData } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(getSession());
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const session = getSession();
    if (session) {
      try {
        const latestData = await getCurrentUserData(session.id);
        if (latestData) {
          saveSession(latestData);
          setUser(latestData);
        } else {
          setUser(session);
        }
      } catch (error) {
        setUser(session);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await refreshUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    logout: logoutUser,
    isAdmin: user?.role === 'admin' || user?.isAdmin,
    refreshUser
  };
};
