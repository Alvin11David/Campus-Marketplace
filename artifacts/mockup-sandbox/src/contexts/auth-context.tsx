import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { User } from "@/lib/api";
import { MOCK_USER } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { full_name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("cm_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    if (email !== "richard@students.vu.ac.ug") {
      throw new Error("Invalid email or password");
    }
    setUser(MOCK_USER);
    localStorage.setItem("cm_user", JSON.stringify(MOCK_USER));
    localStorage.setItem("cm_token", "mock-jwt-token");
  }, []);

  const register = useCallback(async (data: { full_name: string; email: string; phone: string; password: string }) => {
    await new Promise((r) => setTimeout(r, 800));
    const newUser: User = {
      ...MOCK_USER,
      id: Date.now(),
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      is_provider: false,
      is_seller: false,
      is_admin: false,
      avg_rating: null,
      rating_count: 0,
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem("cm_user", JSON.stringify(newUser));
    localStorage.setItem("cm_token", "mock-jwt-token");
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("cm_user");
    localStorage.removeItem("cm_token");
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem("cm_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
