import React from 'react';
import { Navbar } from '@/components/organisms/navbar';
import { Footer } from '@/components/organisms/footer';

export interface MainTemplateProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hero?: React.ReactNode;
}

export const MainTemplate: React.FC<MainTemplateProps> = ({
  children,
  header = <Navbar />,
  footer = <Footer />,
  hero,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans selection:bg-black selection:text-white">
      {header}
      {hero}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>
      {footer}
    </div>
  );
};
