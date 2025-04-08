import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Header />
      <main className="flex-grow pt-28 px-6 w-full">
        <div className="w-full mx-auto" style={{ maxWidth: "calc(100% - 48px)" }}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
} 