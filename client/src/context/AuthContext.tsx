import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';

interface User {
  _id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    axiosInstance
      .get('/auth/me')
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem('token');
        queryClient.clear();
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [queryClient, token]);

  const login = (newToken: string, newUser: User) => {
    queryClient.clear();
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    queryClient.clear();
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
