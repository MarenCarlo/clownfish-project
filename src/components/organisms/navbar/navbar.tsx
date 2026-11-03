'use client';

import React from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts';

export interface NavbarProps {
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title = 'Clownfish' }) => {
  const { user, logout } = useUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={user ? '/productos' : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-none border border-black bg-white flex items-center justify-center text-black">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <span className="font-bold text-lg text-black">
              {title}
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-6 text-sm font-medium text-black">
          {user ? (
            <>
              <Link href="/productos" className="hover:underline">
                Productos
              </Link>
              <span className="text-xs font-mono border border-black px-2.5 py-1">
                {user.userName}
              </span>
              <button
                type="button"
                onClick={logout}
                title="Cerrar Sesión"
                aria-label="Cerrar Sesión"
                className="border border-black bg-white text-black p-1.5 flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.36 6.64a9 9 0 11-12.73 0M12 2v10"
                  />
                </svg>
              </button>
            </>
          ) : (
            <Link href="/" className="hover:underline">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
