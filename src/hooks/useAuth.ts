import { useState, useEffect } from 'react';
import { getSession, AuthUser, logoutUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(getSession());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const checkSession = async () => {
      const session = getSession();
      setUser(session);
      setLoading(false);
    };

    checkSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // We'd ideally fetch the profile here, but for now we trust the session
        // or the local storage which was updated during login
        const currentUser = getSession();
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    logout: logoutUser,
    isAdmin: user?.role === 'admin' || user?.isAdmin
  };
};
