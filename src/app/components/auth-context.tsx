"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient, type Session } from "@/lib/auth-client";

// ------------------ Types ------------------

type AuthContextType = {
  session: Session | null;
  isAuthenticated: boolean;
  pending: boolean;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  fetchUser: () => Promise<void>;
};

// ------------------ Context ------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ------------------ Provider ------------------

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [pending, setPending] = useState<boolean>(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    setPending(true);
    try {
      const { data: session } = await authClient.getSession();
      setSession(session);
    } catch {
      setSession(null);
    } finally {
      setPending(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setSession(null);
      router.push("/login");
    }
  }, [router]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      await authClient.signIn.email(
        { email, password },
        {
          onSuccess: async () => {
            await fetchUser();
          },
          onError: (error) => {
            throw error.error.message || error.error.statusText;
          },
        }
      );
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: error?.toString() || "Login failed" };
    }
  }, [fetchUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        pending,
        logout,
        login,
        fetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ------------------ Hook ------------------

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
