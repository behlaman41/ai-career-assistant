'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: 'USER' | 'ADMIN';
    };
    accessToken: string;
  }
}

export interface SessionUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  accessToken: string;
}

export interface AuthSession {
  user: SessionUser;
  accessToken: string;
}

/**
 * Custom hook for typed session access
 */
export function useSessionUser() {
  const { data: session, status } = useSession();

  const user: SessionUser | null = session?.user
    ? {
        id: session.user.id as string,
        email: session.user.email as string,
        role: session.user.role as 'USER' | 'ADMIN',
        accessToken: session.accessToken as string,
      }
    : null;

  return {
    user,
    session: session as AuthSession | null,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated' && !!user,
  };
}

/**
 * Hook for route protection - returns redirect function
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useSessionUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook for role-based access control
 */
export function useRequireRole(role: 'USER' | 'ADMIN') {
  const { user, isLoading } = useSessionUser();

  const hasAccess = user && user.role === role;

  return { hasAccess, isLoading, user };
}
