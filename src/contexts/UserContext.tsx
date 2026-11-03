'use client';

import React, {
  createContext,
  useContext,
  type ReactNode,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type User = {
  userId: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  [key: string]: unknown;
};

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const FullScreenLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
    <div className="w-10 h-10 border-2 border-black/20 border-t-black rounded-full animate-spin" />
  </div>
);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/');
  }, [router]);

  const validateAndLogToken = useCallback(
    async (silent = false) => {
      try {
        const secureSession = await fetch('/api/auth/me', { method: 'GET' });
        const val = await secureSession.json();

        if (!val.error && val.data) {
          setUser(val.data as User);
          if (pathname === '/') {
            router.push('/productos');
          }
        } else if (!silent) {
          setUser(null);
          if (pathname !== '/') {
            router.push('/');
          }
        }
      } catch {
        if (!silent) {
          setUser(null);
          if (pathname !== '/') {
            router.push('/');
          }
        }
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [router, pathname]
  );

  const refreshSession = useCallback(async () => {
    try {
      const refreshReq = await fetch('/api/auth/refresh', { method: 'PATCH' });
      const val = await refreshReq.json();

      if (refreshReq.ok && !val.error) {
        await validateAndLogToken(true);
      } else if (refreshReq.status === 401 || refreshReq.status === 403) {
        await logout();
      }
    } catch (error) {
      console.error('Error de red al intentar refrescar la sesión.', error);
    }
  }, [validateAndLogToken, logout]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void validateAndLogToken();
    }, 0);
    return () => clearTimeout(timer);
  }, [validateAndLogToken]);

  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        refreshSession();
      }, 14 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user, refreshSession]);

  return (
    <UserContext.Provider
      value={{ user, isLoading, login, logout, refreshSession }}
    >
      {isLoading ? <FullScreenLoader /> : children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};
