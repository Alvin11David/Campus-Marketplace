import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { User } from "@/lib/api";
import { apiPost, apiGet } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    passwordConfirmation: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapUser(data: any): User {
  return {
    id: data.id,
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    bio: data.bio ?? null,
    profile_photo_url: data.profilePhotoUrl ?? null,
    campus_location_id: data.campusLocation?.id ?? null,
    campus_location_name: data.campusLocation?.name ?? null,
    is_provider: data.isProvider,
    is_seller: data.isSeller,
    is_admin: data.isAdmin,
    is_verified: data.isVerified,
    is_active: true,
    is_suspended: false,
    avg_rating: data.avgRating ?? null,
    rating_count: data.ratingCount ?? 0,
    created_at: data.joinDate ?? new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("cm_token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    apiGet<Record<string, unknown>>("/auth/me")
      .then((res) => {
        const mapped = mapUser(res);
        setUser(mapped);
        localStorage.setItem("cm_user", JSON.stringify(mapped));
      })
      .catch(() => {
        localStorage.removeItem("cm_token");
        localStorage.removeItem("cm_refresh_token");
        localStorage.removeItem("cm_user");
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiPost<{
      user: Record<string, unknown>;
      accessToken: string;
      refreshToken: string;
    }>("/auth/login", { email, password });

    localStorage.setItem("cm_token", res.accessToken);
    localStorage.setItem("cm_refresh_token", res.refreshToken);

    const mapped = mapUser(res.user);
    setUser(mapped);
    localStorage.setItem("cm_user", JSON.stringify(mapped));
  }, []);

  const register = useCallback(
    async (data: {
      fullName: string;
      email: string;
      phone: string;
      password: string;
      passwordConfirmation: string;
    }) => {
      const res = await apiPost<{
        user: Record<string, unknown>;
        accessToken: string;
        refreshToken: string;
      }>("/auth/register", data);

      localStorage.setItem("cm_token", res.accessToken);
      localStorage.setItem("cm_refresh_token", res.refreshToken);

      const mapped = mapUser(res.user);
      setUser(mapped);
      localStorage.setItem("cm_user", JSON.stringify(mapped));
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      const rt = localStorage.getItem("cm_refresh_token");
      if (rt) await apiPost("/auth/logout", { refreshToken: rt });
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem("cm_user");
    localStorage.removeItem("cm_token");
    localStorage.removeItem("cm_refresh_token");
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem("cm_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await apiGet<Record<string, unknown>>("/auth/me");
    const mapped = mapUser(res);
    setUser(mapped);
    localStorage.setItem("cm_user", JSON.stringify(mapped));
    return mapped;
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
        refreshUser,
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
