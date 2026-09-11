import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/api';

type Role = 'client' | 'planner' | 'professional' | 'admin' | null;

interface AuthContextType {
  user: any | null;
  role: Role;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentUser().then(user => {
      if (user) {
        setUser(user);
        setRole(user.role);
      }
      setLoading(false);
    });
  }, []);

  const signIn = async (email: string) => {
    const { user } = await authService.signIn(email);
    setUser(user);
    setRole(user.role);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
