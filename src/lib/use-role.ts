"use client";

import React, { useEffect, useMemo, useState } from "react";
import { authClient, type Session } from "./auth-client";

export type Role = "USER" | "ADMIN" | "MANAGER";

export function useRole() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: sessionData } = await authClient.getSession();
        if (mounted) {
          setSession(sessionData ?? null);
        }
      } catch (error) {
        if (mounted) setSession(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const role = useMemo(() => {
    const raw = (session?.user as any)?.role as string | undefined;
    if (!raw) return undefined;
    const upper = raw.toUpperCase();
    return (upper === "ADMIN" || upper === "MANAGER" || upper === "USER") ? (upper as Role) : undefined;
  }, [session]);

  const hasRole = (required: Role | Role[]) => {
    console.log('hasRole', { role, required });
    if (!role) return false;
    const list = (Array.isArray(required) ? required : [required]).map(r => r.toUpperCase()) as Role[];
    return list.includes(role);
  };

  const isAdmin = role === "ADMIN";

  return { session, role, loading, hasRole, isAdmin };
}

type RoleGateProps = {
  allow: Role | Role[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export function RoleGate({ allow, fallback = null, children }: RoleGateProps): React.ReactElement | null {
  const { loading, hasRole } = useRole();
  console.log('RoleGate', { allow, fallback, loading, hasRole });
  if (loading) return null;
  return hasRole(allow) ? React.createElement(React.Fragment, null, children) : React.createElement(React.Fragment, null, fallback);
}


