// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials, logout as logoutAction, restoreAuth, finishInitialization } from '@/store/slices/authSlice';
import { useLoginMutation } from '@/store/api/adminApi';

interface Admin {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  admin: Admin | null;
  loading: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { admin, isAuthenticated, isInitializing } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [loginMutation, { isLoading }] = useLoginMutation();

  // Restore auth from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const savedAdmin = localStorage.getItem('adminUser');

    if (token && savedAdmin && !isAuthenticated) {
      try {
        const adminData = JSON.parse(savedAdmin);
        dispatch(restoreAuth({ admin: adminData, token }));
      } catch (error) {
        console.error('Failed to restore auth:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        dispatch(finishInitialization());
      }
    } else {
      dispatch(finishInitialization());
    }
  }, [dispatch, isAuthenticated]);

  const login = async (email: string, password: string) => {
    const result = await loginMutation({ email, password }).unwrap();
    const { token, admin: adminData } = result.data;

    dispatch(setCredentials({ admin: adminData, token }));
    router.push('/dashboard');
  };

  const logout = () => {
    dispatch(logoutAction());
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ admin, loading: isLoading, isInitializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
