import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Layout } from "./components/Layout";
import { WalletProvider } from "./contexts/WalletContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WalletDemo } from "./components/WalletDemo";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <WalletProvider>
        <Layout>
          <div className="flex flex-col items-center justify-center w-full py-12">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-8">Snark Collective</h1>
            
            {/* Wallet Integration Demo */}
            <div className="max-w-4xl w-full mb-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Aleo Wallet Integration</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This section demonstrates how to use our custom wallet integration with multiple Aleo wallets.
                The implementation provides a unified interface for connecting to Puzzle, Leo, Fox, and Soter wallets
                through a centralized <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 mx-1 rounded">WalletContext</code>.
              </p>
              <WalletDemo />
            </div>
            
            
          </div>
        </Layout>
      </WalletProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
