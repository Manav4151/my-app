"use client";

import React, { useEffect, useMemo, useState } from "react";
import { authClient, type Session } from "./auth-client";
import { ROLES, type Role } from "./role";
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

 const role = useMemo<Role | undefined>(() => {
    const raw = (session?.user as any)?.role;
    if (!raw) return undefined;

    return Object.values(ROLES).includes(raw) ? raw : undefined;
  }, [session]);

  const hasRole = (required: Role | Role[]) => {
    if (!role) return false;
    const list = (Array.isArray(required) ? required : [required]).map(r => r) as Role[];
    return list.includes(role);
  };

  const isAdmin = role === ROLES.ADMIN;

  return { session, role, loading, hasRole, isAdmin };
}

type RoleGateProps = {
  allow: Role | Role[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export function RoleGate({ allow, fallback = null, children }: RoleGateProps): React.ReactElement | null {
  const { loading, hasRole } = useRole();
  if (loading) return null;
  return hasRole(allow) ? React.createElement(React.Fragment, null, children) : React.createElement(React.Fragment, null, fallback);
}


