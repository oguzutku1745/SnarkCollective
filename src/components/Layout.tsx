import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden app-gradient">
      <Header />
      <main className="flex-grow pt-28 w-full">
        <div className="w-full mx-auto">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
} 