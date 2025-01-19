import { useWallet } from '../context/WalletContext';
import Button from '@mui/material/Button';
import '../styles/ConnectWallet.css';

const ConnectWallet = () => {
  const { isConnected, address, connect, disconnect } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="connect-wallet">
      {isConnected ? (
        <div className="wallet-info">
          <span>{formatAddress(address!)}</span>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={disconnect}
            size="small"
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={connect}
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export default ConnectWallet; 