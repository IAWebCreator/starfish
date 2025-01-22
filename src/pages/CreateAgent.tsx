import { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  InputAdornment,
  Link,
  CircularProgress,
  Select,
  MenuItem,
  Chip,
  FormHelperText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useCreateAgent } from '../context/CreateAgentContext';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { blockchainService } from '../services/blockchainService';
import { BLOCKCHAIN_CONFIG } from '../config/blockchain';
import { DatabaseService } from '../services/databaseService';

const steps = [
  'Basic Configuration',
  'Telegram Setup',
  'Duration Settings',
  'Confirmation',
];

const StyledPaper = styled(Paper)({
  background: 'var(--background-soft)',
  '-webkit-backdrop-filter': 'blur(10px)',
  backdropFilter: 'blur(10px)',
  borderRadius: 'var(--border-radius)',
  padding: '2.5rem',
  margin: '2rem 0',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  transition: 'var(--transition)',
  '&:hover': {
    boxShadow: 'var(--shadow-md)',
  },
});

const StyledStepper = styled(Stepper)({
  '& .MuiStepLabel-label': {
    fontSize: '1rem',
    fontWeight: 500,
    color: 'var(--text-light)',
    '&.Mui-active': {
      color: 'var(--primary-color)',
      fontWeight: 600,
    },
    '&.Mui-completed': {
      color: 'var(--primary-color)',
    },
  },
  '& .MuiStepIcon-root': {
    color: 'var(--text-light)',
    '&.Mui-active, &.Mui-completed': {
      color: 'var(--primary-color)',
    },
  },
});

const PageTitle = styled(Typography)({
  fontSize: '3rem',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  color: 'var(--primary-color)',
  marginBottom: '2rem',
  '@media (max-width: 768px)': {
    fontSize: '2.5rem',
  },
});

const StyledButton = styled(Button)({
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
    '&.Mui-disabled': {
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
      color: 'rgba(0, 0, 0, 0.26)',
    },
    '&:not(.Mui-disabled)': {
      backgroundColor: 'var(--button-primary)',
      color: 'white',
      '&:hover': {
        backgroundColor: '#333333',
      },
    },
  },
  '&.MuiButton-outlined': {
    borderColor: 'rgba(0, 0, 0, 0.12)',
    color: 'rgba(0, 0, 0, 0.26)',
    borderWidth: '2px',
    '&.Mui-disabled': {
      borderColor: 'rgba(0, 0, 0, 0.12)',
      color: 'rgba(0, 0, 0, 0.26)',
    },
    '&:not(.Mui-disabled)': {
      borderColor: 'var(--button-primary)',
      color: 'var(--button-primary)',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderColor: '#333333',
        color: '#333333',
      },
    },
  },
});

const StyledFormSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
  '& .MuiTypography-h6': {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'var(--primary-color)',
    marginBottom: '1rem',
  },
  '& .MuiTextField-root': {
    '& .MuiOutlinedInput-root': {
      borderRadius: 'var(--border-radius)',
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--primary-color)',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--primary-color)',
      },
    },
  },
});

const SummaryItem = ({ label, value }: { label: string; value: string | boolean }) => (
  <Box sx={{ display: 'flex', mb: 2 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', minWidth: '200px' }}>
      {label}:
    </Typography>
    <Typography variant="body1">
      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value || 'Not provided'}
    </Typography>
  </Box>
);

const PERSONALITY_TRAITS = [
  "Kind", "Honest", "Loyal", "Empathetic", "Courageous",
  "Arrogant", "Selfish", "Manipulative", "Stubborn", "Pessimistic",
  "Ambitious", "Introverted", "Curious", "Intelligent", "Resourceful",
  "Charming", "Diplomatic", "Resilient", "Passionate", "Calm"
] as const;

const MAX_DESCRIPTION_LENGTH = 5000;

const CreateAgent = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const { formState, updateFormState, resetForm } = useCreateAgent();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleNext = () => {
    if (isStepValid(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormState({
      [field]: event.target.value,
    });
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(
          formState.name && 
          formState.description && 
          formState.description.length <= MAX_DESCRIPTION_LENGTH
        );
      case 1:
        return formState.customBotName ? 
          !!(formState.botToken && formState.telegramUsername) : 
          !!formState.telegramUsername;
      case 2:
        return !!formState.duration;
      case 3:
        return true; // Confirmation step is always valid
      default:
        return false;
    }
  };

  const handleCreateAgent = async () => {
    setIsProcessing(true);
    setError(null);
    setTransactionHash(null);
    
    try {
      // Check if we're on the right network
      const isCorrectNetwork = await blockchainService.checkNetwork();
      if (!isCorrectNetwork) {
        throw new Error(`Please switch to ${BLOCKCHAIN_CONFIG.NETWORKS.sepolia.name}`);
      }

      // Get the signer
      const signer = await blockchainService.getSigner();
      
      setError('Preparing transaction...');
      
      let tx;
      try {
        // Get the correct amount based on duration
        const amount = BLOCKCHAIN_CONFIG.TRANSACTION.AGENT_CREATION_COST[formState.duration as keyof typeof BLOCKCHAIN_CONFIG.TRANSACTION.AGENT_CREATION_COST];
        
        // Send the transaction with the correct amount
        tx = await blockchainService.sendAgentCreationTransaction(signer, amount);
        
        setError(`Transaction submitted!\n\nTransaction Hash: ${tx.hash}\n\nWaiting for confirmation... This may take a few minutes.`);
        
        // Wait for transaction confirmation
        const receipt = await blockchainService.waitForTransaction(tx);
        
        // Store the confirmed transaction hash
        setTransactionHash(receipt.hash);

        // Check if wallet address exists
        if (!formState.walletAddress) {
          throw new Error('Wallet address not found. Please reconnect your wallet.');
        }

        // After successful blockchain transaction, store data in Supabase
        try {
          const result = await DatabaseService.handleAgentCreation(
            formState.walletAddress,
            formState.telegramUsername,
            !formState.customBotName, // isAgentariumBot
            formState.botToken,
            formState.name,           // Add name parameter
            formState.description,
            formState.instructions,
            receipt.hash,
            parseInt(formState.duration) // Add duration parameter
          );

          console.log('Database records created:', result);
          
          // Clear error message and proceed to success state
          setError(null);
          setActiveStep((prevStep) => prevStep + 1);
          setVerificationCode(result.verificationCode);
        } catch (dbError: any) {
          console.error('Database error:', dbError);
          setError(`Transaction successful, but failed to save details. Please contact support.\nError: ${dbError.message}`);
        }
      } catch (error: any) {
        if (error.message.includes('timed out')) {
          setError(`Transaction is still processing.\n\nTransaction Hash: ${tx?.hash}\n\nPlease check your wallet for the final status.`);
        } else {
          throw error;
        }
      }
    } catch (err: any) {
      console.error('Failed to create agent:', err);
      setError(err.message || 'Failed to create agent');
      setTransactionHash(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>

            <TextField
              required
              fullWidth
              label="Name of the Token"
              value={formState.name}
              onChange={handleInputChange('name')}
              helperText="Enter a name for your token"
            />

            <TextField
              required
              fullWidth
              label="Agent Personality Description"
              value={formState.description}
              onChange={(e) => {
                const text = e.target.value;
                if (text.length <= MAX_DESCRIPTION_LENGTH) {
                  updateFormState({
                    description: text
                  });
                }
              }}
              multiline
              rows={4}
              helperText={`${formState.description.length}/${MAX_DESCRIPTION_LENGTH} characters. Provide a brief description of the agent's personality`}
              error={formState.description.length >= MAX_DESCRIPTION_LENGTH}
              FormHelperTextProps={{
                sx: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  '& .MuiFormHelperText-root': {
                    marginLeft: 0
                  }
                }
              }}
            />

            <FormControl fullWidth>
              <FormLabel component="legend">Personality Traits (Optional)</FormLabel>
              <Select
                multiple
                value={formState.selectedTraits || []}
                onChange={(event) => {
                  const value = event.target.value as string[];
                  if (value.length <= 3) {
                    updateFormState({
                      selectedTraits: value,
                      instructions: value.join(', ')
                    });
                  }
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
                sx={{ minHeight: '56px' }}
              >
                {PERSONALITY_TRAITS.map((trait) => (
                  <MenuItem key={trait} value={trait}>
                    {trait}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Select up to 3 personality traits for your agent
              </FormHelperText>
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bot Configuration
            </Typography>

            <FormControl component="fieldset">
              <FormLabel component="legend">Choose your bot option</FormLabel>
              <RadioGroup
                value={formState.customBotName ? "custom" : "default"}
                onChange={(e) => {
                  updateFormState({
                    customBotName: e.target.value === "custom"
                  });
                }}
              >
                <FormControlLabel 
                  value="default" 
                  control={<Radio />} 
                  label="Use Starfish Labs Bot" 
                />
                <FormControlLabel 
                  value="custom" 
                  control={<Radio />} 
                  label="Use my own bot" 
                />
              </RadioGroup>
            </FormControl>

            {formState.customBotName ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  required
                  label="Bot Token ID"
                  value={formState.botToken}
                  onChange={handleInputChange('botToken')}
                  helperText="Enter your custom Telegram bot token. This was provided by BotFather when you created your bot."
                />
                
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Important: Configure Bot Privacy Settings
                </Typography>
                
                <Typography variant="body1">
                  Before using your bot in a group make sure to follow these steps:
                </Typography>
                
                <Box component="ol" sx={{ pl: 2 }}>
                  <li>
                    <Typography variant="body1" gutterBottom>
                      Open Telegram and message @BotFather
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1" gutterBottom>
                      Send the command /setprivacy
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1" gutterBottom>
                      Select your bot from the list
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1" gutterBottom>
                      Select DISABLE to turn off privacy mode
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1" gutterBottom>
                      Make sure to add the bot to your group with admin privileges
                    </Typography>
                  </li>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Please add the Starfish Labs Bot to your group using this link:
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  href="https://t.me/starfishlabs_bot?startgroup=addme"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add Bot to Group
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Important: Make sure to give the bot admin privileges in your group.
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <TextField
              fullWidth
              required
              label="Telegram Username"
              value={formState.telegramUsername}
              onChange={handleInputChange('telegramUsername')}
              helperText="Enter the Telegram username of the person who will activate the bot (without @)"
              InputProps={{
                startAdornment: <InputAdornment position="start">@</InputAdornment>,
              }}
            />

            {formState.customBotName && !formState.botToken && (
              <Typography color="error" variant="caption">
                Bot Token is required when using a custom bot
              </Typography>
            )}
            {!formState.telegramUsername && (
              <Typography color="error" variant="caption">
                Telegram username is required
              </Typography>
            )}
          </Box>
        );
      case 2:
        return (
          <FormControl component="fieldset">
            <FormLabel component="legend">
              How much time do you want to keep the bot active?
            </FormLabel>
            <RadioGroup
              value={formState.duration}
              onChange={handleInputChange('duration')}
            >
              <FormControlLabel 
                value="4" 
                control={<Radio />} 
                label={`4 hours - ${BLOCKCHAIN_CONFIG.TRANSACTION.AGENT_CREATION_COST['4']} ETH`} 
              />
              <FormControlLabel 
                value="12" 
                control={<Radio />} 
                label={`12 hours - ${BLOCKCHAIN_CONFIG.TRANSACTION.AGENT_CREATION_COST['12']} ETH`} 
              />
              <FormControlLabel 
                value="24" 
                control={<Radio />} 
                label={`24 hours - ${BLOCKCHAIN_CONFIG.TRANSACTION.AGENT_CREATION_COST['24']} ETH`} 
              />
            </RadioGroup>
          </FormControl>
        );
      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Please review your agent configuration
            </Typography>
            
            <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Basic Configuration
              </Typography>
              <SummaryItem label="Token Name" value={formState.name} />
              <SummaryItem label="Personality Description" value={formState.description} />
              {formState.selectedTraits && formState.selectedTraits.length > 0 && (
                <SummaryItem 
                  label="Personality Traits" 
                  value={formState.selectedTraits.join(', ')} 
                />
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom color="primary">
                Telegram Configuration
              </Typography>
              <SummaryItem 
                label="Bot Type" 
                value={formState.customBotName ? "Custom Bot" : "Starfish Labs Bot"} 
              />
              {formState.customBotName && (
                <SummaryItem label="Bot Token" value={formState.botToken} />
              )}
              <SummaryItem label="Telegram Username" value={formState.telegramUsername} />
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom color="primary">
                Duration Settings
              </Typography>
              <SummaryItem label="Active Duration" value={`${formState.duration} hours`} />
              <SummaryItem 
                label="Cost" 
                value={`${BLOCKCHAIN_CONFIG.TRANSACTION.AGENT_CREATION_COST[formState.duration as keyof typeof BLOCKCHAIN_CONFIG.TRANSACTION.AGENT_CREATION_COST]} ETH`} 
              />
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom color="primary">
                Wallet Information
              </Typography>
              <SummaryItem label="Connected Wallet" value={formState.walletAddress || 'Not connected'} />
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Please review all the information above. You can go back to any step to make changes if needed.
              </Typography>
            </Box>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ 
        mt: 6, 
        mb: 8,
        position: 'relative',
      }}>
        <Box sx={{ 
          position: 'absolute',
          top: '-3rem',
          left: 0,
        }}>
          <StyledButton
            onClick={handleBackToHome}
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

        <PageTitle variant="h1" align="center">
          Create AI Agent
        </PageTitle>

        <StyledStepper 
          activeStep={activeStep} 
          alternativeLabel
          sx={{ mb: 6 }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </StyledStepper>

        <StyledPaper>
          <StyledFormSection>
            {activeStep === steps.length ? (
              <Box sx={{ 
                textAlign: 'center',
                py: 4,
              }}>
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{ 
                    color: 'success.main',
                    fontWeight: 600,
                    mb: 3,
                  }}
                >
                  Your AI Agent has been created successfully!
                </Typography>
                {verificationCode && (
                  <Box sx={{ mt: 2, mb: 3 }}>
                    <Typography variant="body1" gutterBottom>
                      Your Verification Code:
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontFamily: 'monospace',
                        bgcolor: 'background.paper',
                        p: 2,
                        borderRadius: 1,
                        border: '1px dashed',
                        display: 'inline-block'
                      }}
                    >
                      {verificationCode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Please Save the code, go to the bot's Telegram group, type /activation, and follow its instructions.
                    </Typography>
                  </Box>
                )}
                {transactionHash && (
                  <Box sx={{ mt: 2, mb: 3 }}>
                    <Typography variant="body1" gutterBottom>
                      Transaction Hash:
                    </Typography>
                    <Link 
                      href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {transactionHash}
                    </Link>
                  </Box>
                )}
                <Button 
                  onClick={() => {
                    resetForm();
                    setActiveStep(0);
                    setTransactionHash(null);
                  }}
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  Create Another Agent
                </Button>
              </Box>
            ) : (
              <>
                {error && (
                  <Box 
                    sx={{ 
                      p: 2,
                      mb: 3,
                      borderRadius: 1,
                      backgroundColor: (theme) => 
                        error.includes('Waiting') || error.includes('Preparing')
                          ? theme.palette.info.light
                          : theme.palette.error.light,
                      color: (theme) =>
                        error.includes('Waiting') || error.includes('Preparing')
                          ? theme.palette.info.contrastText
                          : theme.palette.error.contrastText,
                    }}
                  >
                    <Typography sx={{ whiteSpace: 'pre-line' }}>
                      {error}
                    </Typography>
                  </Box>
                )}

                {getStepContent(activeStep)}
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end',
                  gap: 2,
                  mt: 4,
                  pt: 3,
                  borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                }}>
                  <StyledButton
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    variant="outlined"
                    sx={{
                      opacity: activeStep === 0 ? 0.5 : 1,
                      transition: 'opacity 0.2s ease-in-out',
                    }}
                  >
                    Back
                  </StyledButton>
                  {activeStep === steps.length - 1 ? (
                    <StyledButton
                      variant="contained"
                      onClick={handleCreateAgent}
                      disabled={isProcessing}
                      sx={{
                        opacity: isProcessing ? 0.5 : 1,
                        transition: 'opacity 0.2s ease-in-out',
                        minWidth: 150
                      }}
                    >
                      {isProcessing ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={20} color="inherit" />
                          Processing...
                        </Box>
                      ) : (
                        'Create Agent'
                      )}
                    </StyledButton>
                  ) : (
                    <StyledButton
                      variant="contained"
                      onClick={handleNext}
                      disabled={!isStepValid(activeStep)}
                      sx={{
                        opacity: !isStepValid(activeStep) ? 0.5 : 1,
                        transition: 'opacity 0.2s ease-in-out',
                      }}
                    >
                      Next
                    </StyledButton>
                  )}
                </Box>
              </>
            )}
          </StyledFormSection>
        </StyledPaper>
      </Box>
    </Container>
  );
};

export default CreateAgent;