import { Box, Button, Container, Typography, Card, Grid, Chip, Dialog, DialogTitle, DialogContent, DialogActions, ToggleButton, ToggleButtonGroup, Checkbox, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ConnectWallet from '../components/ConnectWallet';
import { useWallet } from '../context/WalletContext';
import { useEffect, useState, useRef } from "react";
import { DatabaseService } from '../services/databaseService';
import { BLOCKCHAIN_CONFIG } from '../config/blockchain';
import { ethers } from 'ethers';
import { BlockchainService } from '../services/blockchainService';
import { styled } from '@mui/material/styles';
import { ArrowBack, Language } from '@mui/icons-material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Tab } from '@mui/material';
import { ButtonProps } from '@mui/material';
import { ElementType } from 'react';
import { animationService } from '../services/animationService';
import { Global } from '@emotion/react';
import { animationStyles } from '../styles/animations';

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

interface GeneratedWeb {
  id: number;
  web_generated_url: string;
  created_at: string;
  github_repo_url: string;
  subdomain: string;
}

const durationOptions: DurationOption[] = [
  { value: '4', label: '4 Hours', cost: BLOCKCHAIN_CONFIG.TRANSACTION.AGENT_CREATION_COST['4'] },
  { value: '12', label: '12 Hours', cost: BLOCKCHAIN_CONFIG.TRANSACTION.AGENT_CREATION_COST['12'] },
  { value: '24', label: '24 Hours', cost: BLOCKCHAIN_CONFIG.TRANSACTION.AGENT_CREATION_COST['24'] }
];

// Define a type that includes both button and anchor props
type StyledButtonProps = ButtonProps & {
  component?: ElementType;
  href?: string;
  target?: string;
  rel?: string;
};

// Update the StyledButton component with the new type
const StyledButton = styled(Button)<StyledButtonProps>({
  padding: '1rem 2rem',
  borderRadius: 'var(--border-radius)',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 600,
  transition: 'var(--transition)',
  '&.MuiButton-contained': {
    backgroundColor: 'var(--button-primary)',
    color: 'white',
    '&:hover': {
      backgroundColor: '#333333',
    },
  },
  '&.MuiButton-outlined': {
    borderColor: 'var(--button-primary)',
    color: 'var(--button-primary)',
    borderWidth: '2px',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      borderWidth: '2px',
    },
  },
});

const StyledTitle = styled(Typography)({
  fontSize: '3rem',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  color: 'var(--primary-color)',
  marginBottom: '2rem',
  '@media (max-width: 768px)': {
    fontSize: '2.5rem',
  },
});

// Update StyledTabList to use the new color scheme
const StyledTabList = styled(TabList)({
  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  '& .MuiTab-root': {
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 500,
    minWidth: 'auto',
    padding: '1rem 1.5rem',
    color: 'var(--text-light)',
    '&.Mui-selected': {
      color: 'var(--primary-color)',
      fontWeight: 600,
    },
    '& .MuiChip-root': {
      marginLeft: '0.5rem',
      background: 'var(--star-color)',
      color: 'var(--primary-color)',
      fontWeight: 500,
    },
  },
});

// Update StyledTabPanel for consistent spacing
const StyledTabPanel = styled(TabPanel)({
  padding: '32px 0',
});

// Update StyledCard with more refined styling
const StyledCard = styled(Card)({
  background: 'var(--background-soft)',
  '-webkit-backdrop-filter': 'blur(10px)',
  backdropFilter: 'blur(10px)',
  borderRadius: 'var(--border-radius)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  transition: 'var(--transition)',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: 'var(--shadow-md)',
  },
});

// Add styled components for card elements
const CardHeader = styled(Box)({
  padding: '1.5rem',
  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
});

const CardBody = styled(Box)({
  padding: '1.5rem',
});

const CardFooter = styled(Box)({
  padding: '1.5rem',
  borderTop: '1px solid rgba(0, 0, 0, 0.1)',
  background: 'rgba(0, 0, 0, 0.02)',
});

// Update StyledChip with the new design
const StyledChip = styled(Chip)({
  borderRadius: '4px',
  fontWeight: 500,
  '&.MuiChip-filled': {
    background: 'var(--star-color)',
    color: 'var(--primary-color)',
  },
  '&.MuiChip-outlined': {
    borderColor: 'var(--primary-color)',
    color: 'var(--primary-color)',
  },
  '&.MuiChip-sizeSmall': {
    height: '24px',
    fontSize: '0.75rem',
  },
});

// Add a new styled component for dialog styling
const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: 'var(--border-radius)',
    background: 'var(--background-soft)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
  },
  '& .MuiDialogTitle-root': {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--primary-color)',
  },
  '& .MuiDialogContent-root': {
    padding: '2rem',
  },
  '& .MuiDialogActions-root': {
    padding: '1rem 2rem',
  },
});

// Add a new styled component for toggle buttons
const StyledToggleButton = styled(ToggleButton)({
  padding: '1rem',
  borderRadius: 'var(--border-radius)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  '&.Mui-selected': {
    backgroundColor: 'var(--star-color)',
    color: 'var(--primary-color)',
    '&:hover': {
      backgroundColor: 'var(--star-color)',
    },
  },
});

const SectionTitle = styled(Typography)({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: 'var(--primary-color)',
  marginBottom: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

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
  const [generatedWebs, setGeneratedWebs] = useState<GeneratedWeb[]>([]);
  const [loadingWebs, setLoadingWebs] = useState(false);
  const [websError, setWebsError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'agents', 'websites'
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isConnected || !address) return;
      
      setLoading(true);
      setLoadingWebs(true);
      setError(null);
      setWebsError(null);

      try {
        console.log('Fetching user data for address:', address);
        const [agentsData, websData] = await Promise.all([
          DatabaseService.getUserAgents(address),
          DatabaseService.getUserGeneratedWebs(address)
        ]);
        
        console.log('Fetched agents:', agentsData);
        console.log('Fetched websites:', websData);
        
        setAgents(agentsData);
        setGeneratedWebs(websData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
        setLoadingWebs(false);
      }
    };

    fetchUserData();
  }, [isConnected, address]);

  useEffect(() => {
    if (backgroundRef.current) {
      // Initialize stars
      animationService.createStars(backgroundRef.current);
      
      // Initialize parallax
      const cleanup = animationService.initParallax();
      
      // Initialize scroll animations
      const observer = animationService.initScrollAnimations();
      
      // Observe sections
      const sections = [
        document.querySelector('.content'),
        document.querySelector('.agents-section'),
        document.querySelector('.websites-section'),
      ];

      sections.forEach(section => {
        if (section) {
          section.classList.add('fade-in');
          observer.observe(section);
        }
      });

      return () => {
        cleanup();
        observer.disconnect();
      };
    }
  }, []);

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
    <StyledDialog open={openDurationDialog} onClose={handleCloseDurationDialog}>
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
              <StyledToggleButton 
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
              </StyledToggleButton>
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
        <StyledButton 
          onClick={handleCloseDurationDialog} 
          disabled={isProcessing}
          variant="outlined"
        >
          Cancel
        </StyledButton>
        <StyledButton 
          onClick={handleConfirmReactivation} 
          variant="contained"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Confirm'}
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );

  const AgreementDialog = () => (
    <StyledDialog open={openAgreementDialog} onClose={handleAgreementCancel}>
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
        <StyledButton 
          onClick={handleAgreementCancel}
          variant="outlined"
        >
          Cancel
        </StyledButton>
        <StyledButton 
          onClick={handleAgreementConfirm}
          variant="contained"
          disabled={!agreementChecked}
        >
          Proceed
        </StyledButton>
      </DialogActions>
    </StyledDialog>
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
  };

  const renderContent = () => {
    if (!isConnected) {
      return (
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body1">
            Please connect your wallet to view your profile
          </Typography>
        </Box>
      );
    }

    // Add loading state for initial data fetch
    if (loading && loadingWebs) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <TabContext value={selectedTab}>
        <Box>
          <StyledTabList 
            onChange={handleTabChange} 
            aria-label="profile sections"
            sx={{ mb: 3 }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  All
                  <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                    <StyledChip 
                      size="small" 
                      label={agents.length} 
                      sx={{ 
                        backgroundColor: 'primary.main',
                        color: 'white',
                      }} 
                    />
                    <StyledChip 
                      size="small" 
                      label={generatedWebs.length}
                      sx={{ 
                        backgroundColor: 'secondary.main',
                        color: 'white',
                      }} 
                    />
                  </Box>
                </Box>
              }
              value="all"
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  AI Agents
                  {agents.length > 0 && (
                    <StyledChip 
                      size="small" 
                      label={agents.length}
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              }
              value="agents"
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Websites
                  {generatedWebs.length > 0 && (
                    <StyledChip 
                      size="small" 
                      label={generatedWebs.length}
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              }
              value="websites"
            />
          </StyledTabList>

          <StyledTabPanel value="all">
            <Grid container direction="column" spacing={6}>
              {/* AI Agents Section */}
              <Grid item>
                <Box sx={{ 
                  pb: 2, 
                  mb: 3, 
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                }}>
                  <SectionTitle>
                    AI Agents
                    {agents.length > 0 && (
                      <StyledChip 
                        size="small" 
                        label={agents.length}
                        sx={{ 
                          backgroundColor: 'var(--primary-color)',
                          color: 'white',
                        }} 
                      />
                    )}
                  </SectionTitle>
                </Box>
                {renderAgents()}
              </Grid>

              {/* Websites Section */}
              <Grid item>
                <Box sx={{ 
                  pb: 2, 
                  mb: 3, 
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                }}>
                  <SectionTitle>
                    Generated Websites
                    {generatedWebs.length > 0 && (
                      <StyledChip 
                        size="small" 
                        label={generatedWebs.length}
                        sx={{ 
                          backgroundColor: 'var(--primary-color)',
                          color: 'white',
                        }} 
                      />
                    )}
                  </SectionTitle>
                </Box>
                {renderWebsites()}
              </Grid>
            </Grid>
          </StyledTabPanel>

          <StyledTabPanel value="agents">
            {renderAgents()}
          </StyledTabPanel>

          <StyledTabPanel value="websites">
            {renderWebsites()}
          </StyledTabPanel>
        </Box>
      </TabContext>
    );
  };

  // Extract the agents rendering logic into a separate function
  const renderAgents = () => {
    if (loading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          py: 4 
        }}>
          <CircularProgress sx={{ color: 'var(--primary-color)' }} />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ 
          textAlign: 'center',
          color: 'var(--text-light)',
          py: 4,
        }}>
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    if (agents.length === 0) {
      return (
        <Box sx={{ 
          textAlign: 'center',
          py: 4,
        }}>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'var(--text-light)',
              mb: 2,
            }}
          >
            You haven't created any agents yet.
          </Typography>
          <StyledButton
            variant="contained"
            onClick={() => navigate("/create-agent")}
          >
            Create Your First Agent
          </StyledButton>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {sortAgents(agents).map((agent) => (
          <Grid item xs={12} md={6} key={agent.id}>
            <StyledCard>
              <CardHeader>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'var(--primary-color)',
                    mb: 1,
                  }}
                >
                  {agent.name || 'Unnamed Agent'}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: 'var(--text-light)' }}
                >
                  Created: {new Date(agent.created_at).toLocaleDateString()}
                </Typography>
              </CardHeader>

              <CardBody>
                <Typography 
                  variant="body1"
                  sx={{
                    color: 'var(--text-color)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 2,
                  }}
                >
                  {agent.description}
                </Typography>

                {agent.activations?.[0] && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <StyledChip
                      label={`Status: ${agent.activations[0].activation_status}`}
                      color={getStatusColor(agent.activations[0].activation_status) as any}
                      size="small"
                    />
                    <StyledChip
                      label={`${agent.activations[0].duration_hours}h`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                )}
              </CardBody>

              {agent.activations?.[0]?.activation_status === 'expired' && (
                <CardFooter>
                  <StyledButton
                    variant="contained"
                    size="small"
                    onClick={() => handleReactivate(agent.id)}
                    fullWidth
                  >
                    Reactivate
                  </StyledButton>
                </CardFooter>
              )}
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Update renderWebsites function to match renderAgents style
  const renderWebsites = () => {
    if (loadingWebs) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          py: 4 
        }}>
          <CircularProgress sx={{ color: 'var(--primary-color)' }} />
        </Box>
      );
    }

    if (websError) {
      return (
        <Box sx={{ 
          textAlign: 'center',
          color: 'var(--text-light)',
          py: 4,
        }}>
          <Typography color="error">{websError}</Typography>
        </Box>
      );
    }

    if (generatedWebs.length === 0) {
      return (
        <Box sx={{ 
          textAlign: 'center',
          py: 4,
        }}>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'var(--text-light)',
              mb: 2,
            }}
          >
            You haven't generated any websites yet.
          </Typography>
          <StyledButton
            variant="contained"
            onClick={() => navigate("/web-generator")}
          >
            Create Your First Website
          </StyledButton>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {generatedWebs.map((web) => (
          <Grid item xs={12} md={6} key={web.id}>
            <StyledCard>
              <CardHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Language sx={{ color: 'var(--primary-color)' }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'var(--primary-color)',
                    }}
                  >
                    {web.subdomain}
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'var(--text-light)',
                    mt: 1,
                  }}
                >
                  Created: {new Date(web.created_at).toLocaleDateString()}
                </Typography>
              </CardHeader>

              <CardFooter>
                <StyledButton
                  variant="contained"
                  size="small"
                  href={web.web_generated_url}
                  component="a"
                  target="_blank"
                  rel="noopener noreferrer"
                  fullWidth
                >
                  Visit Website
                </StyledButton>
              </CardFooter>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <>
      <Global styles={animationStyles} />
      <div ref={backgroundRef} className="background-animation" />
      <Container maxWidth="lg">
        <Box sx={{ 
          mt: 6, 
          mb: 8,
          position: 'relative',
        }}>
          {/* Back button */}
          <Box sx={{ 
            position: 'absolute',
            top: '-3rem',
            left: 0,
          }}>
            <StyledButton
              onClick={() => navigate('/')}
              startIcon={<ArrowBack />}
              variant="outlined"
              sx={{
                borderColor: 'rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  borderColor: 'var(--primary-color)',
                  backgroundColor: 'transparent',
                },
              }}
            >
              Back
            </StyledButton>
          </Box>

          {/* Title and Wallet */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 6,
          }}>
            <StyledTitle>My Profile</StyledTitle>
            <ConnectWallet />
          </Box>

          {/* Main Content */}
          {renderContent()}
        </Box>
        <AgreementDialog />
        <DurationDialog />
      </Container>
    </>
  );
};

export default Profile; 