import React, { useState, useEffect } from 'react';
import * as PuzzleSDK from '@puzzlehq/sdk';
import {
  WalletProvider,
  useConnect,
  useDisconnect,
  useAccount,
  useSelect
} from 'aleo-hooks';
import {
  DecryptPermission,
  WalletAdapterNetwork as DemoxWalletAdapterNetwork
} from '@demox-labs/aleo-wallet-adapter-base';
import {
  FoxWalletAdapter,
  SoterWalletAdapter
} from 'aleo-adapters';
import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo';
import { useWallet } from '../contexts/WalletContext';

// Extend Window interface for Leo and Aleo wallets
declare global {
  interface Window {
    leo?: any;
    aleo?: any;
  }
}

// Define types for debugging
interface ConnectionLog {
  timestamp: Date;
  event: string;
  data?: any;
}

// Initialize other wallet adapters here, outside the component
const leoAdapter = new LeoWalletAdapter({
  appName: "Snark Collective"
});

const foxAdapter = new FoxWalletAdapter({ 
  appName: "Snark Collective" 
});

const soterAdapter = new SoterWalletAdapter({ 
  appName: "Snark Collective" 
});

// Component for other wallets that use aleo-hooks
function OtherWallets({ onConnect, onDisconnect, addLog }: {
  onConnect: (walletName: string, address: string) => void,
  onDisconnect: () => void,
  addLog: (event: string, data?: any) => void
}) {
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { publicKey } = useAccount();
  const { select } = useSelect();
  const [connecting, setConnecting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Handle connect for other wallets - Fox and Soter
  const handleConnect = async (walletName: string, adapter: any) => {
    try {
      setConnecting(true);
      addLog(`Connecting to ${walletName}...`);
      
      // First select the wallet
      await select(adapter.name);
      
      try {
        // Connect to wallet - simplify the call to match the API
        await connect(adapter.name);
        
        // Add a small delay to ensure connection is established
        await new Promise(resolve => setTimeout(resolve, 500));
        
        addLog(`Connected successfully to ${walletName}`);
        
        // Check if we have a public key after connection
        if (publicKey) {
          onConnect(walletName, publicKey);
        } else {
          // Retry getting the public key after a delay
          setTimeout(() => {
            if (publicKey) {
              onConnect(walletName, publicKey);
              addLog(`Got public key after delay: ${publicKey}`);
            }
          }, 1000);
        }
      } catch (connectionError: any) {
        console.error(`Direct connection error: ${connectionError?.message}`);
        
        // Fallback connection approach using the adapter directly
        try {
          addLog(`Trying direct adapter connection for ${walletName}...`);
          
          // Connect directly to the adapter with required parameters
          await adapter.connect(
            DecryptPermission.UponRequest,
            DemoxWalletAdapterNetwork.Testnet
          );
          
          // Check for success
          if (adapter.publicKey) {
            addLog(`Connected directly to ${walletName}`);
            onConnect(walletName, adapter.publicKey);
          }
        } catch (adapterError: any) {
          throw new Error(`Connection failed: ${adapterError?.message || connectionError?.message}`);
        }
      }
    } catch (error: any) {
      console.error(`Connection error for ${walletName}:`, error);
      addLog(`Connection error for ${walletName}: ${error?.message || "Unknown error"}`);
    } finally {
      setConnecting(false);
    }
  };
  
  // Leo Wallet specific connection following official example
  const handleLeoConnect = async () => {
    try {
      setLocalError(null);
      setConnecting(true);
      addLog("Connecting to Leo Wallet...");
      
      // Try to directly access the Leo wallet extension
      if (typeof window.leo !== 'undefined') {
        addLog("Leo wallet extension detected, attempting direct connection...");
        try {
          // @ts-ignore - Access Leo wallet API
          const accounts = await window.leo.requestAccounts();
          if (accounts && accounts.length > 0) {
            const address = accounts[0];
            addLog(`Connected to Leo wallet directly: ${address}`);
            onConnect("Leo Wallet", address);
            return;
          }
        } catch (directError: any) {
          console.error("Direct Leo wallet error:", directError);
          addLog(`Direct Leo wallet error: ${directError?.message || "Unknown error"}`);
        }
      } else {
        addLog("Leo wallet extension not detected in window.leo");
      }
      
      // Fall back to adapter approach
      try {
        // Create a fresh adapter instance with official parameters
        const leoWallet = new LeoWalletAdapter({
          appName: "Snark Collective",
          isMobile: false,
        });
        
        addLog("Attempting Leo wallet connection with adapter...");
        
        // Connect with parameters from the official example - using a simple string value
        await leoWallet.connect(
          DecryptPermission.OnChainHistory,
          'testnetbeta' as any,
          ["credits.aleo"]
        );
        
        if (leoWallet.publicKey) {
          const address = leoWallet.publicKey;
          addLog(`Connected successfully to Leo wallet: ${address}`);
          onConnect("Leo Wallet", address);
        } else {
          throw new Error("Could not get Leo wallet public key");
        }
      } catch (error: any) {
        console.error("Leo wallet adapter error:", error);
        setLocalError("Leo wallet error: " + (error?.message || "Unknown error"));
        addLog(`Leo connection error: ${error?.message || "Unknown error"}`);
        
        // More detailed error for the user
        if (error.message && error.message.includes("not detected") || 
            error.message && error.message.includes("INVALID_PARAMS")) {
          addLog("Make sure Leo wallet is installed and unlocked. Visit https://leo.app/ to install.");
        }
      }
    } finally {
      setConnecting(false);
    }
  };
  
  // Handle disconnect for other wallets
  const handleDisconnect = async () => {
    try {
      addLog("Disconnecting from wallet...");
      await disconnect();
      onDisconnect();
      addLog("Disconnected successfully");
    } catch (error: any) {
      addLog(`Disconnection error: ${error?.message || "Unknown error"}`);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button 
        onClick={handleLeoConnect}
        disabled={connecting}
        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        Connect Leo Wallet
      </button>
      {localError && <div className="text-red-500 text-sm">{localError}</div>}
      <button 
        onClick={() => handleConnect('Fox Wallet', foxAdapter)}
        disabled={connecting}
        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        Connect Fox Wallet
      </button>
      <button 
        onClick={() => handleConnect('Soter Wallet', soterAdapter)}
        disabled={connecting}
        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        Connect Soter Wallet
      </button>
    </div>
  );
}

// Main component that combines Puzzle wallet and others
export function WalletConnect() {
  const { 
    connected, 
    connecting, 
    address, 
    walletName, 
    connectionLogs, 
    errorMessage, 
    connectWallet, 
    disconnectWallet 
  } = useWallet();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mt-5 text-left max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-5 text-gray-800 dark:text-gray-200">Wallet Connection</h2>
      
      {!connected ? (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Select a wallet:</h3>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => connectWallet('puzzle')}
              disabled={connecting}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              Connect Puzzle Wallet
            </button>
            <button 
              onClick={() => connectWallet('leo')}
              disabled={connecting}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              Connect Leo Wallet
            </button>
            <button 
              onClick={() => connectWallet('fox')}
              disabled={connecting}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              Connect Fox Wallet
            </button>
        <button 
              onClick={() => connectWallet('soter')}
              disabled={connecting}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              Connect Soter Wallet
        </button>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
          <p className="text-base mb-2">Connected to {walletName}</p>
          {address && <p className="text-base font-mono break-all">{address}</p>}
          <button 
            onClick={() => disconnectWallet()}
            className="mt-3 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
          >
            Disconnect
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg p-3 mb-6">
          <p>Error: {errorMessage}</p>
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mt-7 border border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Debug Information</h3>
        <p className="mb-1 text-gray-600 dark:text-gray-400">Connected: {connected ? 'Yes' : 'No'}</p>
        <p className="mb-1 text-gray-600 dark:text-gray-400">Selected Wallet: {walletName || 'None'}</p>
        <p className="mb-3 text-gray-600 dark:text-gray-400">Address: {address || 'Not connected'}</p>
        
        <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Connection Logs:</h4>
        <ul className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 h-48 overflow-y-auto font-mono text-xs list-none m-0">
          {connectionLogs.map((log, index) => (
            <li key={index} className="mb-1 p-1 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">[{log.timestamp.toLocaleTimeString()}]</span> {log.event}
              {log.data && <span className="text-blue-500 dark:text-blue-400"> - {JSON.stringify(log.data)}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
