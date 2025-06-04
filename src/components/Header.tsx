import React, { useState } from 'react';
import { ConnectWallet } from './ConnectWallet';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import logoImage from '../assets/logo.png';
import writingImage from '../assets/writing.png';
import logoDarkImage from '../assets/logodark.png';
import writingDarkImage from '../assets/writingdark.png';

// Admin address from the Leo contract
const ADMIN_ADDRESS = 'aleo1pqcumqvf0vjqq800uuyaqqt6s2q6dxcgglywhf6dpzac2cmjgu8q2876eu';

export function Header() {
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const { connected, address } = useWallet();

  // Check if user is admin
  const isAdmin = connected && address === ADMIN_ADDRESS;

  // Fix the logo swap logic to match what the user described
  // In light mode: use logoDarkImage for logo and writingDarkImage for writing
  // In dark mode: use logoImage for logo and writingImage for writing
  const currentLogo = isDarkMode ? logoImage : logoDarkImage;
  const currentWriting = isDarkMode ? writingImage : writingDarkImage;

  // Navigation links
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Submit Project', path: '/submit' },
  ];

  // Add admin link if user is admin
  if (isAdmin) {
    navLinks.push({ name: 'Admin', path: '/admin' });
  }

  return (
    <header className="fixed top-0 left-0 w-full mt-4 px-6 z-50">
      <div className="w-full mx-auto bg-white dark:bg-gray-800 bg-opacity-95 dark:bg-opacity-90 rounded-2xl shadow-md py-3 px-6 flex items-center justify-between transition-all duration-300 hover:shadow-lg" style={{ maxWidth: "calc(100% - 48px)" }}>
        <div className="flex items-center">
          <Link to="/" className="flex items-center group">
            <img src={currentLogo} alt="Snark Collective Logo" className="h-10 md:h-12 w-auto mr-2 transition-transform duration-300 group-hover:scale-105" />
            <img src={currentWriting} alt="Snark Collective" className="h-8 md:h-10 w-auto transition-opacity duration-300 group-hover:opacity-90" />
          </Link>
          <nav className="ml-10 hidden md:flex space-x-6">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-3 py-1.5 rounded-md text-gray-700 dark:text-gray-300 transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'bg-blue-100 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onMouseEnter={() => setActiveLink(item.name)}
                onMouseLeave={() => setActiveLink(null)}
              >
                {item.name}
              </Link>
            ))}
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