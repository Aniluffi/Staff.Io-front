"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AuthorizationGetCurrentUserResponse,
  AuthorizationLoginRequest,
  AuthorizationRegistrationRequest
} from "@/types/AuthorizationModels";
import * as Authorizations from "@/requests/Authorizations";

interface AuthContextType {
  user: AuthorizationGetCurrentUserResponse | null;
  login: (data: AuthorizationLoginRequest) => Promise<void>;
  register: (data: AuthorizationRegistrationRequest) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthorizationGetCurrentUserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const route = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const current = await Authorizations.GetCurrentUser();
        setUser(current);
        setIsAuthenticated(true);
      } catch (ex: any) {
        setUser(null);
        setIsAuthenticated(false);
        throw new Error(ex.message);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (data: AuthorizationLoginRequest) => {
    setIsLoading(true);
    try {
      await Authorizations.Login(data);
      const current = await Authorizations.GetCurrentUser();
      setUser(current);
    } catch (ex: any) {
      setUser(null);
      throw new Error(ex.message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: AuthorizationRegistrationRequest) => {
    setIsLoading(true);
    try {
      await Authorizations.Registration(data);
      const current = await Authorizations.GetCurrentUser();
      setUser(current);
    } catch (ex: any) {
      setUser(null);
      throw new Error(ex.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await Authorizations.Logout();
      setUser(null);
    } catch (ex: any) {
      throw new Error(ex.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
