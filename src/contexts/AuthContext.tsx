// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials as setAuthCredentials, logout as logoutAction, finishInitialization, restoreAuth } from '@/store/slices/authSlice';
import api from '@/lib/api';

interface Admin {
  id: string;
  email: string;
  name: string | null;
  role?: string;
}

interface AuthContextType {
  admin: Admin | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      // Skip session check if on login page
      if (router.pathname === '/login') {
        setIsLoading(false);
        dispatch(finishInitialization());
        return;
      }

      try {
        const response = await api.get('/admin/me');
        if (response.data?.data?.admin) {
          const adminData = response.data.data.admin;
          setAdmin(adminData);
          dispatch(restoreAuth({ admin: adminData }));
        }
      } catch (error) {
        // Not authenticated - will be redirected by API interceptor if needed
        dispatch(finishInitialization());
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [dispatch, router.pathname]);

  const login = async (email: string, password: string) => {
    const response = await api.post('/admin/login', { email, password });
    const { admin: adminData, csrfToken } = response.data.data;
    
    setAdmin(adminData);
    dispatch(setAuthCredentials({ admin: adminData, csrfToken }));
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      await api.post('/admin/logout');
    } catch (error) {
      // Ignore errors on logout
    }
    setAdmin(null);
    dispatch(logoutAction());
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
