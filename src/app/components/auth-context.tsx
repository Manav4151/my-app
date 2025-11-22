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



type AuthContextType = {
  session: Session | null;
  isAuthenticated: boolean;
  pending: boolean;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  fetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [pending, setPending] = useState<boolean>(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    setPending(true);
    try {
      const { data: session } = await authClient.getSession();
      setSession(session);
    } catch (error) {
      console.warn("No session found, redirecting to login..." + error);
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
            console.error("Login error:", error);
            throw error.error?.message || error.error?.statusText || "Login failed";
          },
        }
      );
      return { success: true };
    } catch (error: unknown) {
      console.error("Login failed:", error);
      let errorMessage = "Login failed";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message;
      }

      // Check for common network errors
      if (errorMessage.includes('Load failed') || errorMessage.includes('fetch')) {
        errorMessage = "Cannot connect to server. Please make sure the backend server is running.";
      }

      return { success: false, error: errorMessage };
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



export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
