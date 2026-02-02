"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for different roles
const mockUsers: Record<UserRole, User> = {
  consultant: {
    id: "1",
    name: "Anders Mikkelsen",
    email: "anders.mikkelsen@example.dk",
    role: "consultant",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  resource_manager: {
    id: "rm1",
    name: "Karen Vestergaard",
    email: "karen.vestergaard@dis.dk",
    role: "resource_manager",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face"
  },
  sales: {
    id: "s1",
    name: "Morten Frederiksen",
    email: "morten.frederiksen@dis.dk",
    role: "sales",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Mock login - in real app would validate credentials
    // Default to resource_manager for demo purposes
    const role: UserRole = email.includes("consultant")
      ? "consultant"
      : email.includes("sales")
        ? "sales"
        : "resource_manager";

    setUser(mockUsers[role]);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setUser(mockUsers[role]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
