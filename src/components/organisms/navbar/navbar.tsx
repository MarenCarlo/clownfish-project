import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/atoms/badge';

export interface NavbarProps {
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title = 'Clownfish' }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
              🐠
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
              {title}
            </span>
          </Link>
          <Badge variant="info" size="sm">
            Next.js 16 + tRPC
          </Badge>
        </div>

        <nav className="flex items-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-300">
          <Link
            href="/"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Inicio
          </Link>
          <Link
            href="/api/trpc/health.check"
            target="_blank"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Health API
          </Link>
          <a
            href="https://trpc.io"
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Docs tRPC
          </a>
        </nav>
      </div>
    </header>
  );
};
