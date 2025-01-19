import { Box, Typography, Paper } from "@mui/material";
import { FeatureCardProps } from '../types/types';
import { alpha } from '@mui/material/styles';

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  feature, 
  onClick, 
  onGetStarted,
  StyledButton 
}) => {
  return (
    <Paper
      onClick={onClick}
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        padding: 3,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.05)' 
          : theme.palette.background.paper,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0, 0, 0, 0.5)'
            : '0 4px 20px rgba(0, 0, 0, 0.15)',
          backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.08)'
            : theme.palette.background.paper,
        },
        minHeight: '280px',
        position: 'relative',
        overflow: 'hidden',
      })}
    >
      <Box
        className="icon-container"
        sx={{
          width: '60px',
          height: '60px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
          transition: 'all 0.3s ease',
        }}
      >
        <Typography 
          variant="h3" 
          sx={{ 
            fontSize: '2rem',
            lineHeight: 1,
          }}
        >
          {feature.icon}
        </Typography>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 1,
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {feature.title}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            lineHeight: 1.6,
            mb: 2,
          }}
        >
          {feature.description}
        </Typography>
      </Box>

      <StyledButton
        variant="contained"
        onClick={(e) => {
          e.stopPropagation();
          onGetStarted();
        }}
        sx={{
          alignSelf: 'flex-start',
          mt: 'auto',
        }}
      >
        Get Started
      </StyledButton>
    </Paper>
  );
};

export default FeatureCard; 