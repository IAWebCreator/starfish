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
  InputAdornment,
  CircularProgress,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, CloudUpload, Twitter as TwitterIcon, Telegram as TelegramIcon, Instagram as InstagramIcon, YouTube as YouTubeIcon } from '@mui/icons-material';
import { useWallet } from '../context/WalletContext';
import { webGeneratorService } from '../services/webGeneratorService';
import { blockchainService } from '../services/blockchainService';
import ConnectWallet from '../components/ConnectWallet';

const steps = ['Basic Information', 'Social Media', 'Review'];

// Reuse the same styled components from CreateAgent for consistency
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  margin: theme.spacing(3, 0),
  borderRadius: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  background: theme.palette.background.paper,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, rgba(25, 118, 210, 0.7), rgba(25, 118, 210, 0.4))',
  },
}));

const StyledStepper = styled(Stepper)(({ theme }) => ({
  '.MuiStepLabel-root': {
    '.MuiStepLabel-label': {
      fontWeight: 500,
      '&.Mui-active': {
        color: theme.palette.primary.main,
        fontWeight: 600,
      },
      '&.Mui-completed': {
        color: theme.palette.success.main,
        fontWeight: 600,
      },
    },
  },
  '.MuiStepIcon-root': {
    '&.Mui-active': {
      color: theme.palette.primary.main,
    },
    '&.Mui-completed': {
      color: theme.palette.success.main,
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(1.5),
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  transition: 'all 0.2s ease',
}));

const StyledFormSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
  padding: theme.spacing(2, 0),
  '& .MuiTypography-h6': {
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(1),
  },
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ImagePreview = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '200px',
  borderRadius: theme.spacing(1),
  border: `2px dashed ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(25, 118, 210, 0.08)'
      : 'rgba(25, 118, 210, 0.04)',
  },
}));

const SummaryItem = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ display: 'flex', mb: 2 }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', minWidth: '200px' }}>
      {label}:
    </Typography>
    <Typography variant="body1">
      {value || 'Not provided'}
    </Typography>
  </Box>
);

interface FormState {
  tokenName: string;
  tokenTicker: string;
  tokenDescription: string;
  contractAddress: string;
  logoUrl: string;
  logoFile: File | null;
  twitterUrl: string;
  telegramUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
}

const TikTokIcon = () => (
  <Box
    component="svg"
    sx={{ width: 24, height: 24 }}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 015.9 5.82s-.51.5 0 0z" />
    <path d="M19 10.5V8.9h-2v9.3c0 1.3-1.2 2.3-2.5 2.3s-2.5-1-2.5-2.3 1.2-2.3 2.5-2.3c.3 0 .6.1.9.2v-2.1c-1.8-.3-3.4.7-3.4 2.5v.2c0 1.8 1.6 3.2 3.4 3.2s3.4-1.4 3.4-3.2v-4.3c.9.7 2.1 1.2 3.4 1.2v-2.1c-1.3 0-2.5-.5-3.4-1.2z" />
  </Box>
);

const validateSocialMediaUrl = (url: string, type: string): string => {
  if (!url) return '';
  
  const patterns = {
    twitter: /^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9_]{1,15}$/,
    telegram: /^https?:\/\/(t\.me|telegram\.me)\/[a-zA-Z0-9_]{5,}$/,
    instagram: /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]{1,30}$/,
    youtube: /^https?:\/\/(www\.)?youtube\.com\/@[a-zA-Z0-9_-]+$/,
    tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9_.]{2,24}$/
  };

  const pattern = patterns[type as keyof typeof patterns];
  if (!pattern.test(url)) {
    return `Invalid ${type} URL format`;
  }
  return '';
};

const WebGenerator = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useWallet();
  const [activeStep, setActiveStep] = useState(0);
  const [formState, setFormState] = useState<FormState>({
    tokenName: '',
    tokenTicker: '',
    tokenDescription: '',
    contractAddress: '',
    logoUrl: '',
    logoFile: null,
    twitterUrl: '',
    telegramUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    tiktokUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleInputChange = (field: keyof FormState) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'image/png') {
        alert('Please upload a PNG file only');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setFormState(prev => ({
        ...prev,
        logoUrl: imageUrl,
        logoFile: file
      }));
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(
          formState.tokenName &&
          formState.tokenTicker &&
          formState.tokenDescription &&
          formState.contractAddress &&
          formState.logoFile
        );
      case 1:
        return true; // Social media is optional
      case 2:
        return true; // Review is always valid
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  const resetForm = () => {
    setFormState({
      tokenName: '',
      tokenTicker: '',
      tokenDescription: '',
      contractAddress: '',
      logoUrl: '',
      logoFile: null,
      twitterUrl: '',
      telegramUrl: '',
      instagramUrl: '',
      youtubeUrl: '',
      tiktokUrl: '',
    });
    setTransactionHash(null);
    setProcessingStatus('');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setProcessingStatus('Initializing...');
    
    try {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!formState.logoFile) {
        throw new Error('Logo file is required');
      }

      // Validate social media URLs if provided
      const socialMediaErrors = {
        twitter: validateSocialMediaUrl(formState.twitterUrl, 'twitter'),
        telegram: validateSocialMediaUrl(formState.telegramUrl, 'telegram'),
        instagram: validateSocialMediaUrl(formState.instagramUrl, 'instagram'),
        youtube: validateSocialMediaUrl(formState.youtubeUrl, 'youtube'),
        tiktok: validateSocialMediaUrl(formState.tiktokUrl, 'tiktok')
      };

      const errors = Object.entries(socialMediaErrors)
        .filter(([_, error]) => error)
        .map(([type, error]) => `${type}: ${error}`);

      if (errors.length > 0) {
        throw new Error(`Invalid social media URLs:\n${errors.join('\n')}`);
      }

      // Get signer and check network
      setProcessingStatus('Checking network...');
      const isCorrectNetwork = await blockchainService.checkNetwork();
      if (!isCorrectNetwork) {
        throw new Error('Please connect to Sepolia network');
      }

      const signer = await blockchainService.getSigner();

      // Process blockchain transaction
      setProcessingStatus('Processing payment...');
      const txHash = await webGeneratorService.processWebsiteGeneration(signer);
      setTransactionHash(txHash);

      // Upload logo
      setProcessingStatus('Uploading logo...');
      const logoUrl = await webGeneratorService.uploadLogo(formState.logoFile, address);

      // Save data to database
      setProcessingStatus('Saving website data...');
      await webGeneratorService.saveWebData({
        wallet_address: address,
        token_name: formState.tokenName,
        token_ticker: formState.tokenTicker,
        token_description: formState.tokenDescription,
        token_contract_number: formState.contractAddress,
        twitter_url: formState.twitterUrl || undefined,
        telegram_url: formState.telegramUrl || undefined,
        youtube_url: formState.youtubeUrl || undefined,
        tiktok_url: formState.tiktokUrl || undefined,
        logo_url: logoUrl,
        transaction_id: txHash
      });

      // Show success dialog
      setShowSuccessDialog(true);
      resetForm();

    } catch (error: any) {
      console.error('Error submitting form:', error);
      alert(error.message || 'Error saving website data');
    } finally {
      setIsSubmitting(false);
      setProcessingStatus('');
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">Basic Information</Typography>

            <TextField
              required
              fullWidth
              label="Token Name"
              value={formState.tokenName}
              onChange={handleInputChange('tokenName')}
              helperText="Enter the name of your token"
            />

            <TextField
              required
              fullWidth
              label="Token Ticker"
              value={formState.tokenTicker}
              onChange={handleInputChange('tokenTicker')}
              helperText="Enter your token's ticker symbol"
            />

            <TextField
              required
              fullWidth
              label="Token Description"
              value={formState.tokenDescription}
              onChange={handleInputChange('tokenDescription')}
              multiline
              rows={4}
              helperText="Provide a description of your token"
            />

            <TextField
              required
              fullWidth
              label="Contract Address"
              value={formState.contractAddress}
              onChange={handleInputChange('contractAddress')}
              helperText="Enter your token's contract address"
            />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Token Logo*
              </Typography>
              <label htmlFor="logo-upload">
                <ImagePreview>
                  {formState.logoUrl ? (
                    <Box
                      component="img"
                      src={formState.logoUrl}
                      alt="Token logo preview"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        p: 2
                      }}
                    />
                  ) : (
                    <>
                      <CloudUpload sx={{ fontSize: 40, color: 'text.secondary' }} />
                      <Typography variant="body1" color="text.secondary">
                        Click or drag to upload logo
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Supported format: PNG only (Max 5MB)
                      </Typography>
                    </>
                  )}
                </ImagePreview>
              </label>
              <VisuallyHiddenInput
                id="logo-upload"
                type="file"
                accept=".png,image/png"
                onChange={handleLogoUpload}
              />
              {formState.logoFile && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Selected file: {formState.logoFile.name}
                </Typography>
              )}
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">Social Media Links (Optional)</Typography>

            <TextField
              fullWidth
              label="X (Twitter) URL"
              value={formState.twitterUrl}
              onChange={handleInputChange('twitterUrl')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TwitterIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              placeholder="twitter.com/youraccount"
            />

            <TextField
              fullWidth
              label="Telegram URL"
              value={formState.telegramUrl}
              onChange={handleInputChange('telegramUrl')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TelegramIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              placeholder="t.me/youraccount"
            />

            <TextField
              fullWidth
              label="Instagram URL"
              value={formState.instagramUrl}
              onChange={handleInputChange('instagramUrl')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <InstagramIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              placeholder="instagram.com/youraccount"
            />

            <TextField
              fullWidth
              label="YouTube URL"
              value={formState.youtubeUrl}
              onChange={handleInputChange('youtubeUrl')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <YouTubeIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              placeholder="youtube.com/@yourchannel"
            />

            <TextField
              fullWidth
              label="TikTok URL"
              value={formState.tiktokUrl}
              onChange={handleInputChange('tiktokUrl')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TikTokIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="tiktok.com/@youraccount"
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">Review Your Information</Typography>
            
            <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Basic Information
              </Typography>
              {formState.logoUrl && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Logo Preview:
                  </Typography>
                  <Box
                    component="img"
                    src={formState.logoUrl}
                    alt="Token logo"
                    sx={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'contain',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                </Box>
              )}
              <SummaryItem label="Token Name" value={formState.tokenName} />
              <SummaryItem label="Token Ticker" value={formState.tokenTicker} />
              <SummaryItem label="Description" value={formState.tokenDescription} />
              <SummaryItem label="Contract Address" value={formState.contractAddress} />
              <SummaryItem label="Logo URL" value={formState.logoUrl} />

              <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
                Social Media Links
              </Typography>
              {formState.twitterUrl && <SummaryItem label="X (Twitter)" value={formState.twitterUrl} />}
              {formState.telegramUrl && <SummaryItem label="Telegram" value={formState.telegramUrl} />}
              {formState.instagramUrl && <SummaryItem label="Instagram" value={formState.instagramUrl} />}
              {formState.youtubeUrl && <SummaryItem label="YouTube" value={formState.youtubeUrl} />}
              {formState.tiktokUrl && <SummaryItem label="TikTok" value={formState.tiktokUrl} />}

              {transactionHash && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Transaction Details
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Transaction Hash:
                    </Typography>
                    <Link 
                      href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        wordBreak: 'break-all',
                        color: 'primary.main'
                      }}
                    >
                      {transactionHash}
                    </Link>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <>
      <Container maxWidth="md">
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
              onClick={handleBackToHome}
              startIcon={<ArrowBack />}
              variant="outlined"
            >
              Back
            </StyledButton>
            <Typography 
              variant="h4" 
              component="h1"
              sx={{ 
                fontWeight: 600,
                background: 'linear-gradient(90deg, #1976d2, #64b5f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Website Generator
            </Typography>
          </Box>

          {isConnected ? (
            <>
              <StyledStepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </StyledStepper>

              <StyledPaper>
                <StyledFormSection>
                  {getStepContent(activeStep)}
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end',
                    gap: 2,
                    mt: 4,
                    pt: 3,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}>
                    <StyledButton
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      variant="outlined"
                    >
                      Back
                    </StyledButton>
                    {activeStep === steps.length - 1 ? (
                      <StyledButton
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                            {processingStatus || 'Processing...'}
                          </>
                        ) : (
                          'Generate Website'
                        )}
                      </StyledButton>
                    ) : (
                      <StyledButton
                        variant="contained"
                        onClick={handleNext}
                        disabled={!isStepValid(activeStep)}
                      >
                        Next
                      </StyledButton>
                    )}
                  </Box>
                </StyledFormSection>
              </StyledPaper>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom color="text.secondary">
                Please connect your wallet to access the Website Generator
              </Typography>
              <ConnectWallet />
            </Box>
          )}
        </Box>
      </Container>

      <Dialog
        open={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          setActiveStep(0);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          pb: 1,
          color: 'success.main',
          display: 'flex',
          alignItems: 'center',
          gap: 1 
        }}>
          <Box component="span" sx={{ fontSize: '1.5rem' }}>🎉</Box>
          Website Generation Started
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body1">
              The process of generating the web page has started. Please wait a few minutes for it to complete. 
              You can check your profile to view the page once it's ready.
            </Typography>
            {transactionHash && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Transaction Hash:
                </Typography>
                <Link
                  href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    wordBreak: 'break-all',
                    color: 'primary.main'
                  }}
                >
                  {transactionHash}
                </Link>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <StyledButton
            variant="outlined"
            onClick={() => setShowSuccessDialog(false)}
          >
            Close
          </StyledButton>
          <StyledButton
            variant="contained"
            onClick={handleGoToProfile}
            color="primary"
          >
            Go to Profile
          </StyledButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WebGenerator; 