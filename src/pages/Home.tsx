import React from 'react';
import FeatureCard from '../components/FeatureCard';
import ConnectWallet from '../components/ConnectWallet';
import { useWallet } from '../context/WalletContext';
import { FeatureCard as FeatureCardType } from '../types/types';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Button, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';

// Add styled button component for consistency
const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 4),
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontSize: '1rem',
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(25, 118, 210, 0.15)'
    : 'rgba(25, 118, 210, 0.85)',
  color: theme.palette.mode === 'dark' ? '#90caf9' : '#ffffff',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(25, 118, 210, 0.25)'
      : 'rgba(25, 118, 210, 0.95)',
  },
  minWidth: '160px',
}));

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
  marginBottom: theme.spacing(6),
  position: 'relative',
  padding: theme.spacing(2),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60px',
    height: '4px',
    background: 'linear-gradient(90deg, #1976d2, #64b5f6)',
    borderRadius: '2px',
  }
}));

const BrandTitle = styled(Typography)(({ theme }) => ({
  fontSize: '3.5rem',
  fontWeight: 700,
  letterSpacing: '0.02em',
  marginBottom: theme.spacing(1),
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #90caf9 0%, #42a5f5 50%, #90caf9 100%)'
    : 'linear-gradient(135deg, #1976d2 0%, #64b5f6 50%, #1976d2 100%)',
  backgroundSize: '200% auto',
  color: 'transparent',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  animation: 'shine 3s ease-in-out infinite',
  '@keyframes shine': {
    '0%': {
      backgroundPosition: '0% center',
    },
    '50%': {
      backgroundPosition: '100% center',
    },
    '100%': {
      backgroundPosition: '0% center',
    },
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '2.5rem',
  },
}));

const BrandSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  color: theme.palette.text.secondary,
  maxWidth: '600px',
  margin: '0 auto',
  marginTop: theme.spacing(2),
}));

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

const ConnectPrompt = styled('div')(({ theme }) => ({
  textAlign: 'center',
  marginTop: '4rem',
  padding: '3rem',
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)'
    : theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  '& p': {
    color: theme.palette.text.secondary,
    fontSize: '1.25rem',
    margin: 0,
  },
}));

const Home: React.FC = () => {
  const { isConnected } = useWallet();
  const navigate = useNavigate();
  
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
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          my: 4,
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

        <ConnectWallet />
        
        {isConnected ? (
          <>
            <StyledGrid>
              {features.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  onClick={() => handleFeatureClick(feature.id)}
                  onGetStarted={() => handleGetStarted(feature.title)}
                  StyledButton={StyledButton}
                />
              ))}
            </StyledGrid>

            <StyledButton
              variant="contained"
              onClick={() => navigate("/profile")}
            >
              Go to Profile
            </StyledButton>
          </>
        ) : (
          <ConnectPrompt>
            <p>Please connect your wallet to access Starfish Labs features</p>
          </ConnectPrompt>
        )}
      </Box>
    </Container>
  );
};

export default Home; 