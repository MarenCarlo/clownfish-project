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
          <Link href={user ? '/productos' : '/'} className="flex items-center">
            <span className="font-bold text-lg text-black">
              {title}
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-4 text-sm font-medium text-black">
          {user ? (
            <>
              <span className="text-xs font-mono border border-black px-2.5 py-1">
                {user.userName}
              </span>
              <button
                type="button"
                onClick={logout}
                title="Cerrar Sesión"
                aria-label="Cerrar Sesión"
                className="text-black p-1 flex items-center justify-center hover:opacity-60 transition-opacity cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
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
