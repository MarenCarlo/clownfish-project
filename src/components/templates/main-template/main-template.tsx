import React from 'react';
import { Navbar } from '@/components/organisms/navbar';

export interface MainTemplateProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hero?: React.ReactNode;
}

export const MainTemplate: React.FC<MainTemplateProps> = ({
  children,
  header = <Navbar />,
  footer,
  hero,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans selection:bg-black selection:text-white">
      {header}
      {hero}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {children}
      </main>
      {footer}
    </div>
  );
};
