import { useState, useEffect, useRef } from 'react';
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
import { animationService } from '../services/animationService';
import { Global } from '@emotion/react';
import { animationStyles } from '../styles/animations';

const steps = ['Basic Information', 'Social Media', 'Review'];

// Add styled components at the top
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

const ImagePreview = styled(Box)({
  width: '100%',
  height: '200px',
  border: '2px dashed rgba(0, 0, 0, 0.1)',
  borderRadius: 'var(--border-radius)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'var(--transition)',
  background: 'var(--background-soft)',
  '&:hover': {
    borderColor: 'var(--primary-color)',
    background: 'rgba(0, 0, 0, 0.02)',
  },
});

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
  
  // Remove trailing slashes and clean URL
  let cleanUrl = url.trim().replace(/\/+$/, '');
  
  // For Instagram, add https:// if missing
  if (type === 'instagram' && !cleanUrl.startsWith('http')) {
    cleanUrl = 'https://' + cleanUrl;
  }
  
  const patterns = {
    twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]{1,15}$/,
    // Updated telegram pattern to support invitation links with plus signs and random strings
    telegram: /^https?:\/\/(www\.)?(t\.me|telegram\.me|telegram\.dog)\/(\+[a-zA-Z0-9_-]+|[a-zA-Z0-9_]{5,})$/,
    // Simplified Instagram pattern to be more flexible
    instagram: /^(?:https?:\/\/)?((?:www\.)?instagram\.com\/[a-zA-Z0-9._]+)\/?$/,
    youtube: /^https?:\/\/(www\.)?(youtube\.com\/@[a-zA-Z0-9_-]+|youtube\.com\/channel\/[a-zA-Z0-9_-]+|youtube\.com\/c\/[a-zA-Z0-9_-]+)$/,
    tiktok: /^https?:\/\/(www\.)?(tiktok\.com\/@[a-zA-Z0-9_.]{2,24}|vm\.tiktok\.com\/[a-zA-Z0-9]+)$/
  };

  const pattern = patterns[type as keyof typeof patterns];
  
  if (!pattern.test(cleanUrl)) {
    return `Invalid ${type} URL format`;
  }
  return '';
};

// Add StyledDialog component
const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: 'var(--border-radius)',
    background: 'var(--background-soft)',
    backdropFilter: 'blur(10px)',
    '-webkit-backdrop-filter': 'blur(10px)',
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

// Update the StyledButton component
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
  const backgroundRef = useRef<HTMLDivElement>(null);
  
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
        document.querySelector('.form-section'),
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
              placeholder="twitter.com/username or x.com/username"
              helperText="Enter your X (Twitter) profile URL"
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
              placeholder="t.me/username or telegram.me/username"
              helperText="Enter your Telegram channel or group URL"
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
              placeholder="youtube.com/@channel or youtube.com/c/channel"
              helperText="Enter your YouTube channel URL"
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
              placeholder="tiktok.com/@username"
              helperText="Enter your TikTok profile URL"
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
      <Global styles={animationStyles} />
      <div ref={backgroundRef} className="background-animation" />
      <Container maxWidth="md">
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

          {/* Title */}
          <StyledTitle variant="h1" align="center">
            Website Generator
          </StyledTitle>

          {isConnected ? (
            <>
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
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        sx={{
                          opacity: isSubmitting ? 0.5 : 1,
                          transition: 'opacity 0.2s ease-in-out',
                        }}
                      >
                        {isSubmitting ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={20} color="inherit" />
                            {processingStatus || 'Processing...'}
                          </Box>
                        ) : (
                          'Generate Website'
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
                </StyledFormSection>
              </StyledPaper>
            </>
          ) : (
            <Box 
              className="connect-prompt"
              sx={{
                background: 'var(--background-soft)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                maxWidth: '600px',
                width: '100%',
                margin: '0 auto',
                mt: 4,
                p: 4,
                borderRadius: 'var(--border-radius)',
                textAlign: 'center',
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: 'var(--text-light)',
                  mb: 3,
                }}
              >
                Please connect your wallet to access the Website Generator
              </Typography>
              <ConnectWallet />
            </Box>
          )}
        </Box>

        {/* Success Dialog */}
        <StyledDialog
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
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            gap: 1 
          }}>
            <Box component="span" sx={{ fontSize: '1.5rem' }}>🎉</Box>
            Website Generation Started
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body1" sx={{ color: 'var(--text-color)' }}>
                The process of generating the web page has started. Please wait a few minutes for it to complete. 
                You can check your profile to view the page once it's ready.
              </Typography>
              {transactionHash && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: 'var(--text-light)' }} gutterBottom>
                    Transaction Hash:
                  </Typography>
                  <Link
                    href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      wordBreak: 'break-all',
                      color: 'var(--primary-color)',
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
            >
              Go to Profile
            </StyledButton>
          </DialogActions>
        </StyledDialog>
      </Container>
    </>
  );
};

export default WebGenerator; 