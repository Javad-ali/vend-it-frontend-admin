import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/api';

interface Admin {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to safely get admin from localStorage
const getStoredAdmin = (): Admin | null => {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('adminToken');
  const savedAdmin = localStorage.getItem('adminUser');

  if (token && savedAdmin) {
    try {
      return JSON.parse(savedAdmin);
    } catch (error) {
      console.error('Failed to parse saved admin:', error);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
  }
  return null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(getStoredAdmin);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    const response = await api.post('/admin/auth/login', { email, password });
    const { token, admin: adminData } = response.data.data;

    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(adminData));
    setAdmin(adminData);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdmin(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
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