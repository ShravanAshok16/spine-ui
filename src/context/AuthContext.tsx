import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; // 🔥 npm install jwt-decode

interface AuthContextType {
  token: string | null;
  user: { id: string; email: string; displayName: string } | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('spine_token'));
  const [user, setUser] = useState<AuthContextType['user']>(null);

  // Parse the token whenever it changes
  useEffect(() => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser({
          id: decoded.sub,
          email: decoded.email,
          displayName: decoded.DisplayName || decoded.email.split('@')[0], // fallback to email prefix
        });
      } catch (e) {
        console.error("Invalid token", e);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('spine_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('spine_token');
    setToken(null);
  };

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}