import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiClient } from '../api/client';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('spine_token'));
  const [user, setUser] = useState<UserProfile | null>(null);

  const fetchUser = async () => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const { data } = await apiClient.get('/api/Account/me');
      setUser({
        id: data.id,
        email: data.email,
        displayName: data.displayName || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phoneNumber: data.phoneNumber || ''
      });
    } catch (error) {
      console.error('Failed to fetch user profile', error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('spine_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('spine_token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}