import React, { useEffect, useRef } from 'react';
import ConnectWallet from '../components/ConnectWallet';
import { useWallet } from '../context/WalletContext';
import { FeatureCard as FeatureCardType } from '../types/types';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Button, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import { animationService } from '../services/animationService';
import { Global } from '@emotion/react';
import { animationStyles } from '../styles/animations';

// Add styled button component for consistency
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

// Add styled grid container
const StyledGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: theme.spacing(3),
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: theme.spacing(2),
}));

// Add styled components for the brand title
const BrandContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(8),
  position: 'relative',
  padding: theme.spacing(4),
}));

const BrandTitle = styled(Typography)({
  fontSize: '4rem',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  color: 'var(--primary-color)',
  marginBottom: '1rem',
  '@media (max-width: 768px)': {
    fontSize: '3rem',
  },
});

const BrandSubtitle = styled(Typography)({
  fontSize: '1.3rem',
  color: 'var(--text-light)',
  maxWidth: '600px',
  margin: '0 auto',
  lineHeight: 1.6,
  '@media (max-width: 768px)': {
    fontSize: '1.15rem',
  },
});

const features: FeatureCardType[] = [
  {
    id: 1,
    title: "Create AI Telegram Agents",
    description: "Design a bot that reflects your meme identity and let it interact with your Telegram community",
    icon: "🤖"
  },
  {
    id: 2,
    title: "Create Website",
    description: "Create your meme website with just one click",
    icon: "🌐"
  }
];

const Home: React.FC = () => {
  const { isConnected } = useWallet();
  const navigate = useNavigate();
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
        document.querySelector('.features'),
        document.querySelector('.cta-section'),
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

  const handleFeatureClick = (featureId: number) => {
    console.log(`Clicked feature ${featureId}`);
  };

  const handleGetStarted = (type: string) => {
    if (type === 'Create AI Telegram Agents') {
      navigate('/create-agent');
    } else if (type === 'Create Website') {
      navigate('/web-generator');
    }
  };

  return (
    <>
      <Global styles={animationStyles} />
      <div ref={backgroundRef} className="background-animation" />
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        {/* Wallet Container */}
        <Box className="wallet-container">
          <ConnectWallet />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            py: 8,
          }}
        >
          <BrandContainer>
            <BrandTitle variant="h1">
              Starfish Labs
            </BrandTitle>
            <BrandSubtitle variant="subtitle1">
              AI Agents for Your Community in one click
            </BrandSubtitle>
          </BrandContainer>
          
          {isConnected ? (
            <>
              <StyledGrid>
                {features.map((feature) => (
                  <Box 
                    key={feature.id}
                    className="feature-card"
                    onClick={() => handleFeatureClick(feature.id)}
                  >
                    <span className="feature-icon">{feature.icon}</span>
                    <Typography variant="h3" component="h3">
                      {feature.title}
                    </Typography>
                    <Typography variant="body1">
                      {feature.description}
                    </Typography>
                    <StyledButton
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetStarted(feature.title);
                      }}
                      sx={{ mt: 'auto' }}
                    >
                      Get Started
                    </StyledButton>
                  </Box>
                ))}
              </StyledGrid>

              <StyledButton
                variant="outlined"
                onClick={() => navigate("/profile")}
                sx={{ mt: 4 }}
              >
                Go to Profile
              </StyledButton>
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
                mt: 4,
              }}
            >
              <Typography variant="body1">
                Please connect your wallet to access Starfish Labs features
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </>
  );
};

export default Home; 