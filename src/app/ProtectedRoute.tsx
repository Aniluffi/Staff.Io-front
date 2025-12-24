// /components/Auth/ProtectedRoute.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/app/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true - только для авторизованных, false - только для гостей
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true,
  redirectTo 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      // Если нужна авторизация, но пользователь не авторизован
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo || '/auth/login');
      }
      // Если пользователь авторизован, но пытается попасть на страницы для гостей
      if (!requireAuth && isAuthenticated) {
        router.push(redirectTo || '/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router, redirectTo, pathname]);

  // Показываем загрузку
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Проверяем доступ
  if (requireAuth && !isAuthenticated) {
    return null; // или redirect компонент
  }

  if (!requireAuth && isAuthenticated) {
    return null; // или redirect компонент
  }

  return <>{children}</>;
}