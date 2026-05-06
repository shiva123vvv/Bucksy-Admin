'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../utils/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import api from '../utils/api';

const AuthContext = createContext<any>({
  user: null,
  loading: true,
  login: async (email, password) => {},
  logout: async () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          // Use our robust api client to get profile
          const res = await api.get('/auth/me');
          const dbUser = res.data;
          
          if (dbUser.role === 'admin' || dbUser.role === 'super_admin') {
            setUser({ ...u, role: dbUser.role, dbData: dbUser });
          } else {
            console.error("Access denied: Not an admin");
            await signOut(auth);
            setUser(null);
            alert('Access denied: You do not have administrative privileges.');
          }
        } catch (err) {
          console.error("Auth verification failed", err);
          // If 401/403, we should probably sign out
          if (err.response?.status === 401 || err.response?.status === 403) {
            await signOut(auth);
          }
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
