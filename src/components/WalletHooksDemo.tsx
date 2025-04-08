import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

// Import wallet images
import puzzleIcon from '../assets/puzzlewallet.png';
import leoIcon from '../assets/leowallet.png';
import foxIcon from '../assets/foxwallet.svg';
import soterIcon from '../assets/soterwallet.png';

// Define types
interface Wallet {
  id: 'puzzle' | 'leo' | 'fox' | 'soter';
  name: string;
  icon: string;
}

export function WalletHooksDemo() {
  // State for UI
  const [selectedWallet, setSelectedWallet] = useState<'puzzle' | 'leo' | 'fox' | 'soter' | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [availableWallets, setAvailableWallets] = useState<Wallet[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  
  // Using the WalletContext instead of aleo-hooks directly
  const { 
    connected, 
    connecting, 
    address, 
    walletName, 
    connectWallet, 
    disconnectWallet,
    errorMessage,
    connectionLogs
  } = useWallet();

  // Set available wallets
  useEffect(() => {
    // These are the wallets available in the project
    setAvailableWallets([
      { id: 'puzzle', name: 'Puzzle Wallet', icon: puzzleIcon },
      { id: 'leo', name: 'Leo Wallet', icon: leoIcon },
      { id: 'fox', name: 'Fox Wallet', icon: foxIcon },
      { id: 'soter', name: 'Soter Wallet', icon: soterIcon }
    ]);
  }, []);

  // Update connection status when relevant states change
  useEffect(() => {
    if (connected) {
      setConnectionStatus('Connected');
      setLastError(null);
    } else if (connecting) {
      setConnectionStatus('Connecting...');
    } else if (errorMessage) {
      setConnectionStatus(`Error: ${errorMessage}`);
      setLastError(errorMessage);
    } else if (!connected) {
      setConnectionStatus(lastError ? `Disconnected (last error: ${lastError})` : 'Disconnected');
    }
  }, [connected, connecting, errorMessage, lastError]);

  // Reset selected wallet when disconnected
  useEffect(() => {
    if (!connected && !connecting && selectedWallet) {
      // Only reset selected wallet if we were previously connected and now disconnected
      setTimeout(() => {
        setSelectedWallet(null);
      }, 2000);
    }
  }, [connected, connecting]);

  // Handle wallet selection
  const handleSelectWallet = (walletId: 'puzzle' | 'leo' | 'fox' | 'soter') => {
    setSelectedWallet(walletId);
    setConnectionStatus('Wallet selected');
    setLastError(null);
  };

  // Handle connect button click
  const handleConnect = async () => {
    try {
      setLastError(null);
      if (selectedWallet) {
        console.log(`Attempting to connect to ${selectedWallet} wallet...`);
        await connectWallet(selectedWallet);
        
        // Check connection status after a delay
        setTimeout(() => {
          if (!connected && !connecting) {
            console.log('Connection attempt timed out or failed');
            setConnectionStatus('Connection failed or timed out');
          }
        }, 10000);
      } else {
        setConnectionStatus('Please select a wallet first');
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      setLastError(error?.message || 'Unknown error');
      setConnectionStatus(`Error connecting: ${error?.message || 'Unknown error'}`);
    }
  };

  // Handle disconnect button click
  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error: any) {
      console.error('Disconnection error:', error);
      setLastError(error?.message || 'Unknown error');
      setConnectionStatus(`Error disconnecting: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm w-full">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Aleo Hooks Demo</h2>
      
      
      {/* Connection Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</h3>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Status:</span> {connectionStatus}
          </p>
        </div>
      </div>
      
      {/* Wallet Info */}
      {connected && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Wallet Info</h3>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 mb-1 break-all">
              <span className="font-semibold">Address:</span> {address || 'Not available'}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Wallet Name:</span> {walletName || 'Unknown'}
            </p>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {lastError && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Error</h3>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-lg">
            <p className="text-red-700 dark:text-red-300">{lastError}</p>
          </div>
        </div>
      )}
      
      {/* Hook Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h4 className="font-semibold text-blue-500 dark:text-blue-400 mb-2">Wallet Context</h4>
          <p className="text-gray-700 dark:text-gray-300 mb-1">
            <span className="font-semibold">Is Connected:</span> {connected ? 'Yes' : 'No'}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-1">
            <span className="font-semibold">Is Connecting:</span> {connecting ? 'Yes' : 'No'}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Error:</span> {errorMessage || 'None'}
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h4 className="font-semibold text-blue-500 dark:text-blue-400 mb-2">Wallet Selection</h4>
          <p className="text-gray-700 dark:text-gray-300 mb-1">
            <span className="font-semibold">Available Wallets:</span> {availableWallets.length}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Selected:</span> {selectedWallet || 'None'}
          </p>
        </div>
      </div>
      
      {/* Connection Logs */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Connection Logs</h3>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg max-h-[200px] overflow-y-auto">
          {connectionLogs && connectionLogs.length > 0 ? (
            connectionLogs.map((log, index) => (
              <div key={index} className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.event}
              </div>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-sm">No connection logs available</p>
          )}
        </div>
      </div>
    </div>
  );
} 