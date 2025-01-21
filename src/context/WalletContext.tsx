import { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Network configuration
const SUPPORTED_NETWORK = {
  chainId: '0xaa36a7', // Sepolia testnet in hex
  chainName: 'Sepolia Test Network',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'SEP',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.infura.io/v3/'],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
};

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  networkError: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Check if the current network is supported
  const checkNetwork = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const isSupported = chainId === SUPPORTED_NETWORK.chainId;
      setIsCorrectNetwork(isSupported);
      setNetworkError(isSupported ? null : 'Please switch to Sepolia Test Network');
    } catch (error) {
      console.error('Error checking network:', error);
      setNetworkError('Error checking network');
    }
  }, []);

  // Switch to the supported network
  const switchNetwork = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SUPPORTED_NETWORK.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SUPPORTED_NETWORK],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
          setNetworkError('Error adding network to MetaMask');
        }
      } else {
        console.error('Error switching network:', switchError);
        setNetworkError('Error switching network');
      }
    }
  };

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      setAddress(null);
      setIsConnected(false);
      setNetworkError(null);
    } else {
      setAddress(accounts[0]);
      setIsConnected(true);
      checkNetwork(); // Check network when accounts change
    }
  }, [checkNetwork]);

  // Handle chain changes
  const handleChainChanged = useCallback(() => {
    checkNetwork(); // Check if the new network is supported
  }, [checkNetwork]);

  // Initialize wallet connection
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          handleAccountsChanged(accounts);
        } catch (error) {
          console.error('Error checking wallet connection:', error);
          setNetworkError('Error checking wallet connection');
        }
      }
    };

    checkConnection();
    checkNetwork(); // Check network on initial load

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [handleAccountsChanged, handleChainChanged, checkNetwork]);

  const connect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to connect your wallet!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      handleAccountsChanged(accounts);
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        setNetworkError('Please accept the connection request in MetaMask');
      } else {
        setNetworkError('Error connecting to wallet');
      }
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    setNetworkError(null);
  };

  return (
    <WalletContext.Provider 
      value={{ 
        address, 
        isConnected, 
        isCorrectNetwork,
        connect, 
        disconnect,
        switchNetwork,
        networkError,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}; 