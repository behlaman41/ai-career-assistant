'use client';

import { useRequireAuth } from '@/lib/auth';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
