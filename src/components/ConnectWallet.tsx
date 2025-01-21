import { Box, Button, Typography } from '@mui/material';
import { useWallet } from '../context/WalletContext';
import '../styles/ConnectWallet.css';

const ConnectWallet = () => {
  const { 
    isConnected, 
    address, 
    connect, 
    disconnect, 
    isCorrectNetwork,
    switchNetwork,
    networkError 
  } = useWallet();

  if (!isConnected) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          onClick={connect}
          sx={{ mb: networkError ? 2 : 0 }}
        >
          Connect Wallet
        </Button>
        {networkError && (
          <Typography color="error" variant="body2">
            {networkError}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: 'center' }}>
      {!isCorrectNetwork ? (
        <Box>
          <Button
            variant="contained"
            color="warning"
            onClick={switchNetwork}
            sx={{ mb: 1 }}
          >
            Switch to Sepolia Network
          </Button>
          <Typography variant="body2" color="error">
            Please switch to Sepolia Test Network to continue
          </Typography>
        </Box>
      ) : (
        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={disconnect}
            size="small"
          >
            Disconnect
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ConnectWallet; 