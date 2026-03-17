import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  impersonatedUser: User | null;
  login: () => void;
  logout: () => void;
  impersonate: (user: User) => void;
  stopImpersonating: () => void;
  activeUser: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const login = useCallback(() => {
    // Simulate logging in as an admin user for demonstration purposes
    const adminUser: User = {
        id: 'admin-001',
        fullName: 'Admin User',
        email: 'admin@hammr.com',
        phone: '555-0199',
        role: UserRole.Admin,
        avatarUrl: `https://i.pravatar.cc/150?u=admin-user`,
        registrationDate: new Date().toISOString().split('T')[0],
        isBlocked: false,
    };
    setCurrentUser(adminUser);
    navigate('/');
  }, [navigate]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setImpersonatedUser(null);
    navigate('/login');
  }, [navigate]);
  
  const impersonate = useCallback((user: User) => {
    setImpersonatedUser(user);
    navigate('/dashboard');
  }, [navigate]);

  const stopImpersonating = useCallback(() => {
    setImpersonatedUser(null);
    navigate('/dashboard');
  }, [navigate]);

  const activeUser = impersonatedUser || currentUser;

  const value = { currentUser, impersonatedUser, login, logout, impersonate, stopImpersonating, activeUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
