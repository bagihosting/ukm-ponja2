
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getClientAuth, firebaseConfig } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the necessary config values are present on the client
    const isConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

    if (isConfigured) {
      const auth = getClientAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
      // Cleanup listener on unmount
      return () => unsubscribe();
    } else {
      // If Firebase is not configured, stop loading and assume no user.
      console.error("Client-side Firebase configuration is missing. Auth will not work.");
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
