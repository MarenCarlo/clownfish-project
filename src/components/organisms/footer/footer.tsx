import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
        <p>© 2026 Clownfish Project. Estructura Modular Atomic Design + tRPC.</p>
        <div className="flex items-center gap-4">
          <span>Node.js v26 LTS</span>
          <span>•</span>
          <span>Next.js 16 (App Router)</span>
          <span>•</span>
          <span>pnpm</span>
        </div>
      </div>
    </footer>
  );
};
