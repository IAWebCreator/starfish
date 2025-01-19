import { Box, Button, Container, Typography, Card, CardContent, Grid, Chip, Dialog, DialogTitle, DialogContent, DialogActions, ToggleButton, ToggleButtonGroup, Checkbox } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ConnectWallet from '../components/ConnectWallet';
import { useWallet } from '../context/WalletContext';
import { useEffect, useState } from "react";
import { DatabaseService } from '../services/databaseService';
import { BLOCKCHAIN_CONFIG } from '../config/blockchain';
import { ethers } from 'ethers';
import { BlockchainService } from '../services/blockchainService';
import { styled } from '@mui/material/styles';
import { ArrowBack } from '@mui/icons-material';

interface Agent {
  id: number;
  name: string;
  description: string;
  instructions: string;
  is_active: boolean;
  created_at: string;
  telegram_username: string;
  activations: {
    activation_status: string;
    duration_hours: number;
    created_at: string;
    verification_code: string;
    telegram_authorized_user: string;
    activation_start: string;
    activation_end: string;
    telegram_group_name: string;
  }[];
}

interface DurationOption {
  value: string;
  label: string;
  cost: string;
}

const durationOptions: DurationOption[] = [
  { value: '4', label: '4 Hours', cost: BLOCKCHAIN_CONFIG.TRANSACTION.AGENT_CREATION_COST['4'] },
  { value: '12', label: '12 Hours', cost: BLOCKCHAIN_CONFIG.TRANSACTION.AGENT_CREATION_COST['12'] },
  { value: '24', label: '24 Hours', cost: BLOCKCHAIN_CONFIG.TRANSACTION.AGENT_CREATION_COST['24'] }
];

// Add the same styled button from Home page
const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 4),
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontSize: '1rem',
  backgroundColor: 'rgba(25, 118, 210, 0.85)',
  '&:hover': {
    backgroundColor: 'rgba(25, 118, 210, 0.95)',
  },
  minWidth: '160px',
}));

const StyledTitle = styled(Typography)(() => ({
  fontWeight: 600,
  background: 'linear-gradient(90deg, #1976d2, #64b5f6)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: 0,
    width: '40px',
    height: '3px',
    background: 'linear-gradient(90deg, rgba(25, 118, 210, 0.7), rgba(25, 118, 210, 0.4))',
    borderRadius: '2px',
  }
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.primary.main,
  position: 'relative',
  paddingBottom: theme.spacing(2),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '30px',
    height: '2px',
    background: 'linear-gradient(90deg, rgba(25, 118, 210, 0.7), rgba(25, 118, 210, 0.3))',
    borderRadius: '1px',
  }
}));

const Profile = () => {
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDurationDialog, setOpenDurationDialog] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string>('4');
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [reactivationError, setReactivationError] = useState<string | null>(null);
  const [reactivationSuccess, setReactivationSuccess] = useState<string | null>(null);
  const [openAgreementDialog, setOpenAgreementDialog] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      if (!isConnected || !address) return;
      
      setLoading(true);
      setError(null);
      try {
        const data = await DatabaseService.getUserAgents(address);
        setAgents(data);
      } catch (err) {
        setError('Failed to load agents');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [isConnected, address]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleReactivate = (agentId: number) => {
    setSelectedAgentId(agentId);
    setOpenAgreementDialog(true);
  };

  const handleDurationChange = (
    _event: React.MouseEvent<HTMLElement>,
    newDuration: string,
  ) => {
    if (newDuration !== null) {
      setSelectedDuration(newDuration);
    }
  };

  const handleConfirmReactivation = async () => {
    if (selectedAgentId === null) {
      setReactivationError('No agent selected for reactivation.');
      return;
    }

    if (!window.ethereum) {
      setReactivationError('MetaMask is not installed');
      return;
    }

    setIsProcessing(true);
    setReactivationError(null);
    setReactivationSuccess(null);

    try {
      // Initialize blockchain service
      const blockchainService = new BlockchainService();
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();

      // Get the cost for the selected duration
      const amount = BLOCKCHAIN_CONFIG.TRANSACTION.AGENT_CREATION_COST[selectedDuration as keyof typeof BLOCKCHAIN_CONFIG.TRANSACTION.AGENT_CREATION_COST];

      // 1. Send transaction and wait for receipt
      const tx = await blockchainService.sendAgentCreationTransaction(signer, amount);
      console.log('Transaction sent:', tx.hash);

      // Show waiting message
      setReactivationError('Waiting for transaction confirmation...');

      // 2. Wait for confirmation
      const receipt = await blockchainService.waitForTransaction(tx);
      console.log('Transaction confirmed:', receipt);

      if (!receipt || receipt.status !== 1) {
        throw new Error('Transaction failed');
      }

      // 3. Update Activation in Database with transaction hash
      await DatabaseService.reactivateAgent(
        selectedAgentId, 
        parseInt(selectedDuration),
        tx.hash  // Pass the transaction hash
      );

      // 4. Update UI
      setReactivationSuccess('Agent reactivated successfully!');
      setOpenDurationDialog(false);
      setSelectedAgentId(null);

      // 5. Refresh Agents List
      const updatedAgents = await DatabaseService.getUserAgents(address!);
      setAgents(updatedAgents);
    } catch (err: any) {
      console.error('Reactivation Error:', err);
      if (err.code === 'ACTION_REJECTED') {
        setReactivationError('Transaction was rejected by user.');
      } else if (err.message.includes('insufficient funds')) {
        setReactivationError('Insufficient funds to complete the transaction.');
      } else {
        setReactivationError(err.message || 'Failed to reactivate agent.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseDurationDialog = () => {
    setOpenDurationDialog(false);
    setSelectedAgentId(null);
    setReactivationError(null);
    setReactivationSuccess(null);
  };

  const handleAgreementConfirm = () => {
    setOpenAgreementDialog(false);
    setOpenDurationDialog(true);
  };

  const handleAgreementCancel = () => {
    setOpenAgreementDialog(false);
    setSelectedAgentId(null);
    setAgreementChecked(false);
  };

  const DurationDialog = () => (
    <Dialog open={openDurationDialog} onClose={handleCloseDurationDialog}>
      <DialogTitle>Select Reactivation Duration</DialogTitle>
      <DialogContent>
        <Box sx={{ width: '100%', mt: 2 }}>
          <ToggleButtonGroup
            value={selectedDuration}
            exclusive
            onChange={handleDurationChange}
            aria-label="duration selection"
            sx={{ width: '100%', display: 'flex' }}
          >
            {durationOptions.map((option) => (
              <ToggleButton 
                key={option.value} 
                value={option.value}
                sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  textTransform: 'none'
                }}
              >
                <Typography variant="body1">{option.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.cost} ETH
                </Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        {reactivationError && (
          <Typography color="error" sx={{ mt: 2 }}>
            {reactivationError}
          </Typography>
        )}
        {reactivationSuccess && (
          <Typography color="success.main" sx={{ mt: 2 }}>
            {reactivationSuccess}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDurationDialog} disabled={isProcessing}>Cancel</Button>
        <Button 
          onClick={handleConfirmReactivation} 
          variant="contained" 
          color="primary" 
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const AgreementDialog = () => (
    <Dialog open={openAgreementDialog} onClose={handleAgreementCancel}>
      <DialogTitle>Important Notice</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" color="error" gutterBottom>
            Warning: Please read carefully before proceeding
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Make sure the bot you're reactivating doesn't already have an active agent in the same group. 
            Multiple agents from the same bot in one group are prohibited and may cause financial loss.
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <Checkbox
              checked={agreementChecked}
              onChange={(e) => setAgreementChecked(e.target.checked)}
            />
            <Typography variant="body2">
              I understand and confirm that I have checked for existing active agents in the target group
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleAgreementCancel}>Cancel</Button>
        <Button 
          onClick={handleAgreementConfirm}
          variant="contained" 
          color="primary"
          disabled={!agreementChecked}
        >
          Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );

  const sortAgents = (agents: Agent[]) => {
    const statusPriority = {
      'active': 0,
      'pending': 1,
      'expired': 2
    };

    return [...agents].sort((a, b) => {
      // Get the most recent activation for each agent
      const aActivation = a.activations?.[0];
      const bActivation = b.activations?.[0];

      // Get status or default to 'expired' if no activation exists
      const aStatus = aActivation?.activation_status || 'expired';
      const bStatus = bActivation?.activation_status || 'expired';

      // First, compare by status priority
      if (statusPriority[aStatus as keyof typeof statusPriority] !== statusPriority[bStatus as keyof typeof statusPriority]) {
        return statusPriority[aStatus as keyof typeof statusPriority] - statusPriority[bStatus as keyof typeof statusPriority];
      }

      // If status is the same, sort by creation date (most recent first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  // Add helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        mt: 6, 
        mb: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          mb: 2,
        }}>
          <StyledButton
            onClick={() => navigate('/')}
            startIcon={<ArrowBack />}
            variant="outlined"
            sx={{
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'transparent',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
              color: 'text.primary',
            }}
          >
            Back
          </StyledButton>
          <StyledTitle variant="h4">
            My Profile
          </StyledTitle>
        </Box>

        <ConnectWallet />

        {isConnected ? (
          <>
            <StyledSubtitle 
              variant="h5" 
              sx={{ 
                alignSelf: 'flex-start',
                mt: 4, 
                mb: 3,
              }}
            >
              Your AI Agents
            </StyledSubtitle>
            
            {loading ? (
              <Typography>Loading your agents...</Typography>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : agents.length > 0 ? (
              <Grid container spacing={3}>
                {sortAgents(agents).map((agent) => (
                  <Grid item xs={12} md={6} key={agent.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            {agent.name || 'Unnamed Agent'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Created: {new Date(agent.created_at).toLocaleDateString()}
                          </Typography>
                          <Typography 
                            variant="body1" 
                            paragraph
                            sx={{
                              mb: 2,
                              minHeight: '48px', // Ensure consistent height
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {truncateText(agent.description, 30)}
                          </Typography>
                          {agent.activations?.map((activation, index) => (
                            <Box key={index} sx={{ mt: 1 }}>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                <Chip
                                  label={`Status: ${activation.activation_status}`}
                                  color={getStatusColor(activation.activation_status) as any}
                                  size="small"
                                />
                                <Chip
                                  label={`Duration: ${activation.duration_hours}h`}
                                  variant="outlined"
                                  size="small"
                                />
                              </Box>
                              
                              {activation.activation_status === 'active' && (
                                <Box sx={{ mt: 1, backgroundColor: 'rgba(0, 150, 0, 0.05)', p: 1, borderRadius: 1 }}>
                                  {activation.telegram_group_name && (
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                      Group: {activation.telegram_group_name}
                                    </Typography>
                                  )}
                                  {activation.activation_start && (
                                    <Typography variant="body2" color="text.secondary">
                                      Start: {new Date(activation.activation_start).toLocaleString(undefined, { 
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                      })} UTC
                                    </Typography>
                                  )}
                                  {activation.activation_end && (
                                    <Typography variant="body2" color="text.secondary">
                                      End: {new Date(activation.activation_end).toLocaleString(undefined, { 
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                      })} UTC
                                    </Typography>
                                  )}
                                </Box>
                              )}

                              {activation.verification_code && activation.activation_status === 'pending' && (
                                <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>
                                  Verification Code: {activation.verification_code}
                                </Typography>
                              )}
                              
                              {activation.telegram_authorized_user && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  Authorized User: {activation.telegram_authorized_user}
                                </Typography>
                              )}

                              {activation.activation_status === 'expired' && (
                                <Box>
                                  {activation.telegram_group_name && (
                                    <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                                     active it in: {activation.telegram_group_name}
                                    </Typography>
                                  )}
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={() => handleReactivate(agent.id)}
                                    sx={{ mt: 1 }}
                                  >
                                    Reactivate
                                  </Button>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography variant="body1" gutterBottom>
                  You haven't created any agents yet.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/create-agent")}
                  sx={{ mt: 2 }}
                >
                  Create Your First Agent
                </Button>
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body1">
              Please connect your wallet to view your profile
            </Typography>
          </Box>
        )}
      </Box>
      <AgreementDialog />
      <DurationDialog />
    </Container>
  );
};

export default Profile; 