'use client';

import { useEffect } from 'react';
import useAppRouter from '@/hooks/useAppRouter';
import useAuth, { useIsAuthenticated } from '@/lib/stores/use-auth';
import { ROUTES } from '@/utils/constants/routes';

export default function Home() {
  const router = useAppRouter();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuth((state) => state.isLoading);

  useEffect(() => {
    // Chờ auth initialization hoàn thành
    if (isLoading) {
      return;
    }

    // Nếu đã authenticated, redirect đến mail
    if (isAuthenticated) {
      router.push(ROUTES.MAIL);
      return;
    }

    // Nếu chưa authenticated, redirect đến login
    router.push(ROUTES.LOGIN);
  }, [isAuthenticated, isLoading, router]);

  // Hiển thị loading state trong khi check auth
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-400" />
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    </div>
  );
}
