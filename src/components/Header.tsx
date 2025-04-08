import React from 'react';
import { ConnectWallet } from './ConnectWallet';
import { ThemeToggle } from './ThemeToggle';
import logoImage from '../assets/logo.png';
import writingImage from '../assets/writing.png';

export function Header() {
  return (
    <header className="fixed top-0 left-0 w-full py-4 px-6 z-50 bg-gray-50 dark:bg-gray-900">
      <div className="w-full mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md py-3 px-6 flex items-center justify-between" style={{ maxWidth: "calc(100% - 48px)" }}>
        <div className="flex items-center">
          <a href="/" className="flex items-center">
            <img src={logoImage} alt="Snark Collective Logo" className="h-10 md:h-12 w-auto mr-2" />
            <img src={writingImage} alt="Snark Collective" className="h-8 md:h-10 w-auto" />
          </a>
          <nav className="ml-10 hidden md:flex space-x-6">
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
              Home
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
              About
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
              Documentation
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
              Community
            </a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <ConnectWallet buttonText="Connect Wallet" />
        </div>
      </div>
    </header>
  );
} 