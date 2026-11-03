import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-black bg-white py-8 mt-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-black">
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
