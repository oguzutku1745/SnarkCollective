import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Layout } from "./components/Layout";
import { WalletProvider } from "./contexts/WalletContext";
import { ThemeProvider } from "./contexts/ThemeContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <WalletProvider>
        <Layout>
          <div className="flex flex-col items-center justify-center w-full py-12">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-8">Snark Collective</h1>
            
            <div className="p-8 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg w-full max-w-4xl border border-gray-100 dark:border-gray-700">
              <p className="text-xl text-gray-700 dark:text-gray-200 mb-6 leading-relaxed font-medium">
                Empowering the next wave of zero-knowledge innovation on Aleo.
              </p>
              
              <div className="space-y-4 text-left mb-8">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Snark Collective brings together developers, researchers, and enthusiasts to build the future of privacy-preserving technology within the Aleo ecosystem.
                </p>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Our mission is to make zero-knowledge proofs accessible to everyone, transforming complex cryptography into intuitive tools that developers can easily integrate into their applications.
                </p>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Through collaboration, education, and open-source development, we're creating a world where privacy isn't just a feature—it's the foundation.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <div className="text-center p-5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                  <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800/40">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Privacy by design</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Building systems where privacy is a fundamental property, not an afterthought.</p>
                </div>
                
                <div className="text-center p-5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
                  <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-800/40">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Security by default</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ensuring robust security measures are automatically applied to protect user data.</p>
                </div>
                
                <div className="text-center p-5 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800/30">
                  <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-800/40">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-cyan-500 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Innovation through collaboration</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Working together to push the boundaries of what's possible with zero-knowledge technology.</p>
                </div>
              </div>
              
              <div className="flex justify-center mt-10 space-x-4">
                <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg font-medium">
                  Join the Collective
                </button>
                <button className="px-6 py-2 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-blue-500 dark:text-blue-300 border border-blue-500 dark:border-blue-400 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg font-medium">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </Layout>
      </WalletProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
