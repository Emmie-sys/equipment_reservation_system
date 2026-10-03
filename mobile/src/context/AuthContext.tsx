import React, { createContext, useState, useContext } from 'react';
import { setAuthToken, clearAuthToken } from '../utils/storage';

interface User {
  id: string | number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (userData: User, token: string) => {
    await setAuthToken(token);
    setUser(userData);
  };

  const logout = async () => {
    await clearAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useMobileAuth = () => useContext(AuthContext);
