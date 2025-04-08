import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as PuzzleSDK from '@puzzlehq/sdk';
import {
  DecryptPermission,
  WalletAdapterNetwork as DemoxWalletAdapterNetwork
} from '@demox-labs/aleo-wallet-adapter-base';
import {
  FoxWalletAdapter,
  SoterWalletAdapter
} from 'aleo-adapters';
import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo';

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

// Define wallet context type
interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  walletName: string | null;
  connectionLogs: ConnectionLog[];
  errorMessage: string | null;
  connectWallet: (type: 'puzzle' | 'leo' | 'fox' | 'soter') => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

// Create context with default values
const WalletContext = createContext<WalletContextType>({
  connected: false,
  connecting: false,
  address: null,
  walletName: null,
  connectionLogs: [],
  errorMessage: null,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
});

// Initialize wallet adapters
const foxAdapter = new FoxWalletAdapter({ 
  appName: "Snark Collective" 
});

const soterAdapter = new SoterWalletAdapter({ 
  appName: "Snark Collective" 
});

// Create the provider component
export function WalletProvider({ children }: { children: ReactNode }) {
  // State variables
  const [connectionLogs, setConnectionLogs] = useState<ConnectionLog[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [usingPuzzle, setUsingPuzzle] = useState(false);

  // Add connection log
  const addLog = (event: string, data?: any) => {
    setConnectionLogs(prevLogs => {
      const newLog = { timestamp: new Date(), event, data };
      // Keep only the last 10 logs
      const updatedLogs = [newLog, ...prevLogs].slice(0, 10);
      return updatedLogs;
    });
  };

  // Reset state function
  const resetState = () => {
    setAddress(null);
    setConnected(false);
    setWalletName(null);
    setUsingPuzzle(false);
  };

  // Handle connection errors
  const handleConnectionError = (error: any, walletDisplayName: string) => {
    console.error(`${walletDisplayName} connection error:`, error);
    setErrorMessage(`${walletDisplayName} error: ${error?.message || "Unknown error"}`);
    addLog(`${walletDisplayName} connection error: ${error?.message || "Unknown error"}`);
  };

  // Initial connection check for Puzzle wallet with multiple retry attempts
  useEffect(() => {
    let attemptCount = 0;
    const maxAttempts = 3;
    const finalCheckDelay = 2000; // ms
    
    const checkConnection = async (attempt?: number) => {
      try {
        if (attempt) {
          addLog(`Connection attempt ${attempt}/${maxAttempts}`);
        }
        
        const accountResponse = await PuzzleSDK.getAccount();
        if (accountResponse && accountResponse.account && accountResponse.account.address) {
          setAddress(accountResponse.account.address);
          setConnected(true);
          setWalletName('Puzzle Wallet');
          setUsingPuzzle(true);
          addLog('Connection detected!', accountResponse);
          return true;
        }
        return false;
      } catch (error: any) {
        if (attempt) {
          addLog(`Connection attempt ${attempt} failed: ${error.message || 'Unknown error'}`);
        }
        return false;
      }
    };
    
    const attemptConnection = async () => {
      if (await checkConnection()) return;
      
      // Connection not found on first try, make multiple attempts
      const attemptWithRetry = async () => {
        attemptCount++;
        await checkConnection(attemptCount);
        
        if (attemptCount < maxAttempts) {
          setTimeout(attemptWithRetry, 1000);
        } else {
          // After all attempts, wait a bit longer and try one final time
          addLog('All connection attempts appeared to fail. Checking one last time after delay...');
          setTimeout(async () => {
            const connected = await checkConnection();
            if (connected) {
              addLog('Connection detected after delay!');
            }
          }, finalCheckDelay);
        }
      };
      
      attemptWithRetry();
    };
    
    attemptConnection();
  }, []);

  // Connect to Puzzle using SDK
  const connectPuzzleSDK = async () => {
    try {
      setErrorMessage(null);
      setConnecting(true);
      setUsingPuzzle(true);
      
      addLog('Connecting to Puzzle using SDK...');
      
      // First check if already connected
      try {
        const existingAccount = await PuzzleSDK.getAccount();
        if (existingAccount && existingAccount.account && existingAccount.account.address) {
          setAddress(existingAccount.account.address);
          setConnected(true);
          setWalletName('Puzzle Wallet');
          addLog('Already connected to Puzzle', existingAccount);
          return;
        }
      } catch (e) {
        // Not connected, continue with connect flow
        addLog('No existing connection, proceeding with connect');
      }
      
      // Make multiple connection attempts
      let attemptCount = 0;
      const maxAttempts = 3;
      
      const attemptConnect = async (): Promise<boolean> => {
        attemptCount++;
        addLog(`Connection attempt ${attemptCount}/${maxAttempts}`);
        
        try {
          const result = await PuzzleSDK.connect({
            dAppInfo: {
              name: "Snark Collective",
              description: "Snark Collective App",
            },
            permissions: {
              programIds: {}
            }
          });
          
          if (result && result.connection) {
            const accountResponse = await PuzzleSDK.getAccount();
            if (accountResponse && accountResponse.account && accountResponse.account.address) {
              setAddress(accountResponse.account.address);
              setConnected(true);
              setWalletName('Puzzle Wallet');
              addLog('Connected successfully to Puzzle', accountResponse);
              return true;
            }
          }
          return false;
        } catch (error: any) {
          addLog(`Connection attempt ${attemptCount} failed: ${error.message || 'Unknown error'}`);
          return false;
        }
      };
      
      // Try connection with retries
      let connected = await attemptConnect();
      while (!connected && attemptCount < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        connected = await attemptConnect();
      }
      
      // Final check after a delay if all attempts appeared to fail
      if (!connected) {
        addLog('All connection attempts appeared to fail. Checking one last time after delay...');
        setTimeout(async () => {
          try {
            const accountResponse = await PuzzleSDK.getAccount();
            if (accountResponse && accountResponse.account && accountResponse.account.address) {
              setAddress(accountResponse.account.address);
              setConnected(true);
              setWalletName('Puzzle Wallet');
              addLog('Connection detected after delay!', accountResponse);
            }
          } catch (e) {
            // Still not connected
          }
        }, 2000);
      }
      
    } catch (error: any) {
      handleConnectionError(error, "Puzzle Wallet");
    } finally {
      setConnecting(false);
    }
  };

  // Connect to Leo wallet
  const connectLeoWallet = async () => {
    try {
      setErrorMessage(null);
      setConnecting(true);
      addLog("Connecting to Leo Wallet...");
      
      // Try to directly access the Leo wallet extension
      if (typeof window.leo !== 'undefined') {
        addLog("Leo wallet extension detected, attempting direct connection...");
        try {
          const accounts = await window.leo.requestAccounts();
          if (accounts && accounts.length > 0) {
            const address = accounts[0];
            setAddress(address);
            setConnected(true);
            setWalletName('Leo Wallet');
            setUsingPuzzle(false);
            addLog(`Connected to Leo wallet directly: ${address}`);
            return;
          }
        } catch (directError: any) {
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
          setAddress(address);
          setConnected(true);
          setWalletName('Leo Wallet');
          setUsingPuzzle(false);
          addLog(`Connected successfully to Leo wallet: ${address}`);
        } else {
          throw new Error("Could not get Leo wallet public key");
        }
      } catch (error: any) {
        handleConnectionError(error, "Leo Wallet");
        
        // More detailed error for the user
        if (error.message && (error.message.includes("not detected") || 
            error.message.includes("INVALID_PARAMS"))) {
          addLog("Make sure Leo wallet is installed and unlocked. Visit https://leo.app/ to install.");
        }
      }
    } finally {
      setConnecting(false);
    }
  };

  // Connect to Fox or Soter wallet 
  const connectOtherWallet = async (walletName: 'fox' | 'soter') => {
    try {
      setErrorMessage(null);
      setConnecting(true);
      
      const adapter = walletName === 'fox' ? foxAdapter : soterAdapter;
      const displayName = walletName === 'fox' ? 'Fox Wallet' : 'Soter Wallet';
      
      addLog(`Connecting to ${displayName}...`);
      
      try {
        // Connect directly to the adapter with required parameters
        await adapter.connect(
          DecryptPermission.UponRequest,
          DemoxWalletAdapterNetwork.Testnet
        );
        
        // Check for success
        if (adapter.publicKey) {
          const walletAddress = adapter.publicKey;
          setAddress(walletAddress);
          setConnected(true);
          setWalletName(displayName);
          setUsingPuzzle(false);
          addLog(`Connected directly to ${displayName}: ${walletAddress}`);
        } else {
          throw new Error(`Could not get ${displayName} public key`);
        }
      } catch (error: any) {
        handleConnectionError(error, displayName);
      }
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect from wallet
  const disconnectWallet = async () => {
    try {
      setErrorMessage(null);
      addLog("Disconnecting from wallet...");
      
      if (usingPuzzle) {
        try {
          await PuzzleSDK.disconnect();
        } catch (e) {
          // Ignore disconnect errors and continue
        }
      }
      
      // Reset all state
      resetState();
      addLog("Disconnected successfully");
    } catch (error: any) {
      console.error("Disconnection error:", error);
      setErrorMessage(error?.message || "Failed to disconnect");
      addLog(`Disconnection error: ${error?.message || "Unknown error"}`);
    }
  };

  // Main connect wallet method
  const connectWallet = async (type: 'puzzle' | 'leo' | 'fox' | 'soter') => {
    switch (type) {
      case 'puzzle':
        await connectPuzzleSDK();
        break;
      case 'leo':
        await connectLeoWallet();
        break;
      case 'fox':
        await connectOtherWallet('fox');
        break;
      case 'soter':
        await connectOtherWallet('soter');
        break;
    }
  };

  // Provide context value
  const contextValue: WalletContextType = {
    connected,
    connecting,
    address,
    walletName,
    connectionLogs,
    errorMessage,
    connectWallet,
    disconnectWallet
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

// Custom hook for using the wallet context
export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 