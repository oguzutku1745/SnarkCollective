import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { RecordStatus, EventType } from '@puzzlehq/types';

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

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  children, 
  defaultExpanded = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  return (
    <div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 bg-gray-50 dark:bg-gray-900 flex justify-between items-center"
      >
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
        <svg 
          className={`w-5 h-5 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div 
        className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[2000px]' : 'max-h-0'}`}
      >
        {isExpanded && (
          <div className="p-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export function WalletDemo() {
  // State for UI
  const [selectedWallet, setSelectedWallet] = useState<'puzzle' | 'leo' | 'fox' | 'soter' | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [availableWallets, setAvailableWallets] = useState<Wallet[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  
  // Transaction state
  const [programId, setProgramId] = useState<string>('credits.aleo');
  const [functionName, setFunctionName] = useState<string>('transfer');
  const [feeAmount, setFeeAmount] = useState<number>(3000);
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('1000000');
  const [transactionResult, setTransactionResult] = useState<string | null>(null);
  
  // Signature state
  const [messageToSign, setMessageToSign] = useState<string>('Hello from Snark Collective!');
  const [signatureResult, setSignatureResult] = useState<string | null>(null);
  
  // Decrypt state
  const [ciphertextToDecrypt, setCiphertextToDecrypt] = useState<string>('');
  const [decryptResult, setDecryptResult] = useState<string | null>(null);
  
  // Records state
  const [recordsProgramId, setRecordsProgramId] = useState<string>('credits.aleo');
  const [recordsStatus, setRecordsStatus] = useState<RecordStatus | ''>('');
  const [recordsResult, setRecordsResult] = useState<string | null>(null);
  
  // Record plaintexts state
  const [recordPlaintextsProgramId, setRecordPlaintextsProgramId] = useState<string>('credits.aleo');
  const [recordPlaintextsStatus, setRecordPlaintextsStatus] = useState<RecordStatus | ''>('');
  const [recordPlaintextsResult, setRecordPlaintextsResult] = useState<string | null>(null);
  
  // Transaction history state
  const [transactionHistoryProgramId, setTransactionHistoryProgramId] = useState<string>('credits.aleo');
  const [transactionHistoryEventType, setTransactionHistoryEventType] = useState<EventType | ''>('');
  const [transactionHistoryFunctionId, setTransactionHistoryFunctionId] = useState<string>('');
  const [transactionHistoryResult, setTransactionHistoryResult] = useState<string | null>(null);
  
  // Using the WalletContext instead of aleo-hooks directly
  const { 
    connected, 
    connecting, 
    address, 
    walletName, 
    errorMessage,
    connectionLogs,
    connectWallet,
    disconnectWallet,
    createTransaction,
    signMessage,
    decryptMessage,
    getRecords,
    getRecordPlaintexts,
    getTransactionHistory,
    transactionPending,
    lastTransactionId,
    signaturePending,
    lastSignature,
    decryptPending,
    recordsLoading,
    lastRecords,
    recordPlaintextsLoading,
    lastRecordPlaintexts,
    transactionHistoryLoading,
    lastTransactionHistory
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
  }, [connected, connecting, selectedWallet]);

  // Handle transaction request
  const handleRequestTransaction = async () => {
    if (!connected || !address) {
      setLastError('Wallet not connected');
      return;
    }

    setTransactionResult(null);

    try {
      // Prepare inputs based on wallet type
      let inputs: any[] = [];
      
      switch (walletName) {
        case 'Puzzle Wallet':
        case 'Leo Wallet':
        case 'Fox Wallet':
        case 'Soter Wallet':
          inputs = [recipient, `${amount}u64`];
          break;
        default:
          setLastError('Transaction not supported for this wallet type');
          return;
      }
      
      // Common transaction creation for all wallet types
      const result = await createTransaction({
        programId,
        functionName,
        inputs,
        fee: feeAmount
      });

      if (result.error) {
        setLastError(result.error);
        setTransactionResult(`Transaction failed: ${result.error}`);
      } else {
        setTransactionResult(`Transaction submitted successfully! ID: ${result.transactionId}`);
      }
    } catch (error: any) {
      setLastError(error.message || 'Unknown error creating transaction');
      setTransactionResult(`Transaction failed: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle signature request
  const handleRequestSignature = async () => {
    if (!connected || !address) {
      setLastError('Wallet not connected');
      return;
    }

    setSignatureResult(null);

    try {
      // Common signature request for all wallet types
      const result = await signMessage({
        message: messageToSign
      });

      if (result.error) {
        setLastError(result.error);
        setSignatureResult(`Signature failed: ${result.error}`);
      } else {
        setSignatureResult(`Signature created successfully: ${result.signature}`);
      }
    } catch (error: any) {
      setLastError(error.message || 'Unknown error signing message');
      setSignatureResult(`Signature failed: ${error.message || 'Unknown error'}`);
    }
  };
  
  // Handle decrypt request
  const handleRequestDecrypt = async () => {
    if (!connected || !address) {
      setLastError('Wallet not connected');
      return;
    }

    setDecryptResult(null);

    try {
      // Common decrypt request for all wallet types
      const result = await decryptMessage({
        ciphertexts: [ciphertextToDecrypt]
      });

      if (result.error) {
        setLastError(result.error);
        setDecryptResult(`Decryption failed: ${result.error}`);
      } else if (result.plaintexts && result.plaintexts.length > 0) {
        setDecryptResult(`Decryption successful: ${result.plaintexts.join(', ')}`);
      } else {
        setDecryptResult('Decryption successful but no plaintexts returned');
      }
    } catch (error: any) {
      setLastError(error.message || 'Unknown error decrypting message');
      setDecryptResult(`Decryption failed: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle record request
  const handleRequestRecords = async () => {
    if (!connected || !address) {
      setLastError('Wallet not connected');
      return;
    }

    setRecordsResult(null);

    try {
      // Common records request for all wallet types
      const params: any = {
        programId: recordsProgramId
      };
      
      if (recordsStatus) {
        params.status = recordsStatus;
      }
      
      const result = await getRecords(params);

      if (result.error) {
        setLastError(result.error);
        setRecordsResult(`Records request failed: ${result.error}`);
      } else if (result.records && result.records.length > 0) {
        setRecordsResult(`Found ${result.records.length} records`);
      } else {
        setRecordsResult('No records found for this program');
      }
    } catch (error: any) {
      setLastError(error.message || 'Unknown error fetching records');
      setRecordsResult(`Records request failed: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle record plaintexts request
  const handleRequestRecordPlaintexts = async () => {
    if (!connected || !address) {
      setLastError('Wallet not connected');
      return;
    }

    setRecordPlaintextsResult(null);

    try {
      // Common record plaintexts request for all wallet types
      const params: any = {
        programId: recordPlaintextsProgramId
      };
      
      if (recordPlaintextsStatus) {
        params.status = recordPlaintextsStatus;
      }
      
      const result = await getRecordPlaintexts(params);

      if (result.error) {
        setLastError(result.error);
        setRecordPlaintextsResult(`Record plaintexts request failed: ${result.error}`);
      } else if (result.recordsWithPlaintext && result.recordsWithPlaintext.length > 0) {
        setRecordPlaintextsResult(`Found ${result.recordsWithPlaintext.length} records with plaintext`);
      } else {
        setRecordPlaintextsResult('No records with plaintext found for this program');
      }
    } catch (error: any) {
      setLastError(error.message || 'Unknown error fetching record plaintexts');
      setRecordPlaintextsResult(`Record plaintexts request failed: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle transaction history request
  const handleRequestTransactionHistory = async () => {
    if (!connected || !address) {
      setLastError('Wallet not connected');
      return;
    }

    setTransactionHistoryResult(null);

    try {
      // Common transaction history request for all wallet types
      const params: any = {
        programId: transactionHistoryProgramId
      };
      
      if (transactionHistoryEventType) {
        params.eventType = transactionHistoryEventType;
      }
      
      if (transactionHistoryFunctionId) {
        params.functionId = transactionHistoryFunctionId;
      }
      
      const result = await getTransactionHistory(params);

      if (result.error) {
        setLastError(result.error);
        setTransactionHistoryResult(`Transaction history request failed: ${result.error}`);
      } else if (result.transactions && result.transactions.length > 0) {
        setTransactionHistoryResult(`Found ${result.transactions.length} transactions`);
      } else {
        setTransactionHistoryResult('No transactions found for this program');
      }
    } catch (error: any) {
      setLastError(error.message || 'Unknown error fetching transaction history');
      setTransactionHistoryResult(`Transaction history request failed: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm w-full">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Wallet Integration Demo</h2>
      
      {/* Status Section - Always Expanded */}
      <CollapsibleSection title="Wallet Status" defaultExpanded={true}>
        <div className="mb-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Status:</span> {connectionStatus}
            </p>
            <br />
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
        </div>
        
        {connected && (
          <div className="mb-4">
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

        {/* Wallet Selection */}
        <div className="mb-4">
          <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Available Wallets</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {availableWallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => {
                  setSelectedWallet(wallet.id);
                  connectWallet(wallet.id);
                }}
                disabled={connecting}
                className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${
                  selectedWallet === wallet.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <img 
                  src={wallet.icon} 
                  alt={wallet.name} 
                  className="w-10 h-10 mb-2" 
                />
                {wallet.name === "Fox Wallet" ? <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Fox Wallet (Mainnet Only)</span> : <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{wallet.name}</span>}
              </button>
            ))}
          </div>
        </div>

        {connected && (
          <button
            onClick={() => disconnectWallet()}
            className="w-full p-2 rounded-md font-medium bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white transition-colors"
          >
            Disconnect Wallet
          </button>
        )}
      </CollapsibleSection>
      
      {/* Transaction Demo Section */}
      {connected && ['Puzzle Wallet', 'Leo Wallet', 'Fox Wallet', 'Soter Wallet'].includes(walletName || '') && (
        <CollapsibleSection title="Transaction Demo">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program ID</label>
                <input
                  type="text"
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Function Name</label>
                <input
                  type="text"
                  value={functionName}
                  onChange={(e) => setFunctionName(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient Address</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="aleo1..."
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (without units)</label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fee (microcredits)</label>
                <input
                  type="number"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>
            
            <button
              onClick={handleRequestTransaction}
              disabled={transactionPending || !connected}
              className={`w-full p-2 rounded-md font-medium ${
                transactionPending
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
              } text-white transition-colors`}
            >
              {transactionPending ? 'Processing...' : 'Create Transaction'}
            </button>
            
            {lastTransactionId && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-md">
                <p className="text-sm text-green-800 dark:text-green-300 break-all">
                  <span className="font-semibold">Transaction ID:</span> {lastTransactionId}
                </p>
              </div>
            )}
            
            {transactionResult && (
              <div className={`mt-4 p-3 ${
                transactionResult.includes('failed') 
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-800 dark:text-red-300' 
                  : 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 text-green-800 dark:text-green-300'
              } rounded-md`}>
                <p className="text-sm break-all">{transactionResult}</p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}
      
      {/* Signature Demo Section */}
      {connected && ['Puzzle Wallet', 'Leo Wallet', 'Fox Wallet', 'Soter Wallet'].includes(walletName || '') && (
        <CollapsibleSection title="Signature Demo">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message to Sign</label>
              <input
                type="text"
                value={messageToSign}
                onChange={(e) => setMessageToSign(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              />
            </div>
            
            <button
              onClick={handleRequestSignature}
              disabled={signaturePending || !connected}
              className={`w-full p-2 rounded-md font-medium ${
                signaturePending
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
              } text-white transition-colors`}
            >
              {signaturePending ? 'Signing...' : 'Sign Message'}
            </button>
            
            {lastSignature && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-md">
                <p className="text-sm text-green-800 dark:text-green-300 break-all">
                  <span className="font-semibold">Signature:</span> {lastSignature}
                </p>
              </div>
            )}
            
            {signatureResult && (
              <div className={`mt-4 p-3 ${
                signatureResult.includes('failed') 
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-800 dark:text-red-300' 
                  : 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 text-green-800 dark:text-green-300'
              } rounded-md`}>
                <p className="text-sm break-all">{signatureResult}</p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}
      
      {/* Decrypt Demo Section */}
      {connected && ['Puzzle Wallet', 'Leo Wallet', 'Fox Wallet', 'Soter Wallet'].includes(walletName || '') && (
        <CollapsibleSection title="Decrypt Demo">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ciphertext to Decrypt</label>
              <textarea
                value={ciphertextToDecrypt}
                onChange={(e) => setCiphertextToDecrypt(e.target.value)}
                placeholder="Enter ciphertext (e.g., record...)"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 min-h-[100px]"
              />
            </div>
            
            <button
              onClick={handleRequestDecrypt}
              disabled={decryptPending || !connected || !ciphertextToDecrypt}
              className={`w-full p-2 rounded-md font-medium ${
                decryptPending || !ciphertextToDecrypt
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
              } text-white transition-colors`}
            >
              {decryptPending ? 'Decrypting...' : 'Decrypt Ciphertext'}
            </button>
            
            {decryptResult && (
              <div className={`mt-4 p-3 ${
                decryptResult.includes('failed') 
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-800 dark:text-red-300' 
                  : 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 text-green-800 dark:text-green-300'
              } rounded-md`}>
                <p className="text-sm break-all">{decryptResult}</p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}
      
      {/* Records Demo Section */}
      {connected && ['Puzzle Wallet', 'Leo Wallet', 'Fox Wallet', 'Soter Wallet'].includes(walletName || '') && (
        <CollapsibleSection title="Records Demo">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program ID</label>
                <input
                  type="text"
                  value={recordsProgramId}
                  onChange={(e) => setRecordsProgramId(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Record Status (Puzzle only)</label>
                <select
                  value={recordsStatus}
                  onChange={(e) => setRecordsStatus(e.target.value as RecordStatus | '')}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  <option value="">All Records</option>
                  <option value={RecordStatus.Unspent}>Unspent</option>
                  <option value={RecordStatus.Pending}>Pending</option>
                  <option value={RecordStatus.Spent}>Spent</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={handleRequestRecords}
              disabled={recordsLoading || !connected}
              className={`w-full p-2 rounded-md font-medium ${
                recordsLoading
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
              } text-white transition-colors`}
            >
              {recordsLoading ? 'Loading Records...' : 'Request Records'}
            </button>
            
            {lastRecords && lastRecords.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Found {lastRecords.length} Records</h4>
                <div className="max-h-[300px] overflow-y-auto bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  {lastRecords.map((record, index) => (
                    <div key={index} className="mb-3 p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Record #{index + 1}</p>
                      {record.plaintext && (
                        <p className="text-sm text-gray-800 dark:text-gray-200 break-all">
                          <span className="font-semibold">Plaintext:</span> {record.plaintext}
                        </p>
                      )}
                      {typeof record === 'string' ? (
                        <p className="text-sm text-gray-800 dark:text-gray-200 break-all">{record}</p>
                      ) : (
                        <div>
                          {record.owner && (
                            <p className="text-sm text-gray-800 dark:text-gray-200 break-all">
                              <span className="font-semibold">Owner:</span> {record.owner}
                            </p>
                          )}
                          {record.spent !== undefined && (
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              <span className="font-semibold">Status:</span> {record.spent ? 'Spent' : 'Unspent'}
                            </p>
                          )}
                          {record.data && (
                            <div className="mt-1">
                              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Data:</span>
                              <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-1 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(record.data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {recordsResult && (
              <div className={`mt-4 p-3 ${
                recordsResult.includes('failed') 
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-800 dark:text-red-300' 
                  : 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 text-green-800 dark:text-green-300'
              } rounded-md`}>
                <p className="text-sm break-all">{recordsResult}</p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}
      
      {/* Record Plaintexts Demo Section */}
      {connected && ['Puzzle Wallet', 'Leo Wallet', 'Fox Wallet', 'Soter Wallet'].includes(walletName || '') && (
        <CollapsibleSection title="Record Plaintexts Demo">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program ID</label>
                <input
                  type="text"
                  value={recordPlaintextsProgramId}
                  onChange={(e) => setRecordPlaintextsProgramId(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Record Status (Puzzle only)</label>
                <select
                  value={recordPlaintextsStatus}
                  onChange={(e) => setRecordPlaintextsStatus(e.target.value as RecordStatus | '')}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  <option value="">All Records</option>
                  <option value={RecordStatus.Unspent}>Unspent</option>
                  <option value={RecordStatus.Pending}>Pending</option>
                  <option value={RecordStatus.Spent}>Spent</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Note:</strong> For Leo, Fox, and Soter wallets, this requires the <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">OnChainHistory</code> permission during connection.
              </p>
            </div>
            
            <button
              onClick={handleRequestRecordPlaintexts}
              disabled={recordPlaintextsLoading || !connected}
              className={`w-full p-2 rounded-md font-medium ${
                recordPlaintextsLoading
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
              } text-white transition-colors`}
            >
              {recordPlaintextsLoading ? 'Loading Record Plaintexts...' : 'Request Record Plaintexts'}
            </button>
            
            {lastRecordPlaintexts && lastRecordPlaintexts.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Found {lastRecordPlaintexts.length} Records with Plaintext</h4>
                <div className="max-h-[300px] overflow-y-auto bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  {lastRecordPlaintexts.map((record, index) => (
                    <div key={index} className="mb-3 p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Record with Plaintext #{index + 1}</p>
                      {record.plaintext && (
                        <div>
                          <p className="text-sm text-gray-800 dark:text-gray-200 break-all">
                            <span className="font-semibold">Plaintext:</span> {record.plaintext}
                          </p>
                          {record.data && (
                            <div className="mt-1">
                              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Decoded Data:</span>
                              <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-1 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(record.data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                      {typeof record === 'string' ? (
                        <p className="text-sm text-gray-800 dark:text-gray-200 break-all">{record}</p>
                      ) : (
                        <div>
                          {record.owner && (
                            <p className="text-sm text-gray-800 dark:text-gray-200 break-all">
                              <span className="font-semibold">Owner:</span> {record.owner}
                            </p>
                          )}
                          {record.spent !== undefined && (
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              <span className="font-semibold">Status:</span> {record.spent ? 'Spent' : 'Unspent'}
                            </p>
                          )}
                          {record.transactionId && (
                            <p className="text-sm text-gray-800 dark:text-gray-200 break-all">
                              <span className="font-semibold">Transaction ID:</span> {record.transactionId}
                            </p>
                          )}
                          {record.programId && (
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              <span className="font-semibold">Program ID:</span> {record.programId}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {recordPlaintextsResult && (
              <div className={`mt-4 p-3 ${
                recordPlaintextsResult.includes('failed') 
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-800 dark:text-red-300' 
                  : 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 text-green-800 dark:text-green-300'
              } rounded-md`}>
                <p className="text-sm break-all">{recordPlaintextsResult}</p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}
      
      {/* Transaction History Demo Section */}
      {connected && ['Puzzle Wallet', 'Leo Wallet', 'Fox Wallet', 'Soter Wallet'].includes(walletName || '') && (
        <CollapsibleSection title="Transaction History Demo">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program ID</label>
                <input
                  type="text"
                  value={transactionHistoryProgramId}
                  onChange={(e) => setTransactionHistoryProgramId(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Type (Puzzle only)</label>
                <select
                  value={transactionHistoryEventType}
                  onChange={(e) => setTransactionHistoryEventType(e.target.value as EventType | '')}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  <option value="">All Events</option>
                  <option value={EventType.Deploy}>Deploy</option>
                  <option value={EventType.Execute}>Execute</option>
                  <option value={EventType.Send}>Send</option>
                  <option value={EventType.Receive}>Receive</option>
                  <option value={EventType.Join}>Join</option>
                  <option value={EventType.Split}>Split</option>
                  <option value={EventType.Shield}>Shield</option>
                  <option value={EventType.Unshield}>Unshield</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Function ID (Puzzle only)</label>
                <input
                  type="text"
                  value={transactionHistoryFunctionId}
                  onChange={(e) => setTransactionHistoryFunctionId(e.target.value)}
                  placeholder="e.g., transfer_private"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Note:</strong> For Leo, Fox, and Soter wallets, this requires the <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">OnChainHistory</code> permission during connection.
              </p>
            </div>
            
            <button
              onClick={handleRequestTransactionHistory}
              disabled={transactionHistoryLoading || !connected}
              className={`w-full p-2 rounded-md font-medium ${
                transactionHistoryLoading
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
              } text-white transition-colors`}
            >
              {transactionHistoryLoading ? 'Loading Transaction History...' : 'Request Transaction History'}
            </button>
            
            {lastTransactionHistory && lastTransactionHistory.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Found {lastTransactionHistory.length} Transactions</h4>
                <div className="max-h-[300px] overflow-y-auto bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  {lastTransactionHistory.map((transaction, index) => (
                    <div key={index} className="mb-3 p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transaction #{index + 1}</p>
                      {typeof transaction === 'string' ? (
                        <p className="text-sm text-gray-800 dark:text-gray-200 break-all">{transaction}</p>
                      ) : (
                        <div>
                          {transaction._id && (
                            <p className="text-sm text-gray-800 dark:text-gray-200 break-all">
                              <span className="font-semibold">ID:</span> {transaction._id}
                            </p>
                          )}
                          {transaction.transactionId && (
                            <p className="text-sm text-gray-800 dark:text-gray-200 break-all">
                              <span className="font-semibold">Transaction ID:</span> {transaction.transactionId}
                            </p>
                          )}
                          {transaction.type && (
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              <span className="font-semibold">Type:</span> {transaction.type}
                            </p>
                          )}
                          {transaction.status && (
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              <span className="font-semibold">Status:</span> {transaction.status}
                            </p>
                          )}
                          {transaction.programId && (
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              <span className="font-semibold">Program ID:</span> {transaction.programId}
                            </p>
                          )}
                          {transaction.functionId && (
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              <span className="font-semibold">Function ID:</span> {transaction.functionId}
                            </p>
                          )}
                          {transaction.created && (
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              <span className="font-semibold">Created:</span> {new Date(transaction.created).toLocaleString()}
                            </p>
                          )}
                          {transaction.settled && (
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              <span className="font-semibold">Settled:</span> {new Date(transaction.settled).toLocaleString()}
                            </p>
                          )}
                          {transaction.height !== undefined && (
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              <span className="font-semibold">Block Height:</span> {transaction.height}
                            </p>
                          )}
                          {transaction.inputs && transaction.inputs.length > 0 && (
                            <div className="mt-1">
                              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Inputs:</span>
                              <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-1 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(transaction.inputs, null, 2)}
                              </pre>
                            </div>
                          )}
                          {transaction.error && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                              <span className="font-semibold">Error:</span> {transaction.error}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {transactionHistoryResult && (
              <div className={`mt-4 p-3 ${
                transactionHistoryResult.includes('failed') 
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-red-800 dark:text-red-300' 
                  : 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 text-green-800 dark:text-green-300'
              } rounded-md`}>
                <p className="text-sm break-all">{transactionHistoryResult}</p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}
      
      {/* Error Message */}
      {lastError && (
        <CollapsibleSection title="Error Details" defaultExpanded={true}>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-lg">
            <p className="text-red-700 dark:text-red-300">{lastError}</p>
          </div>
        </CollapsibleSection>
      )}
      
      {/* Connection Logs */}
      <CollapsibleSection title="Connection Logs">
        <div className="max-h-[200px] overflow-y-auto">
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
      </CollapsibleSection>
    </div>
  );
} 