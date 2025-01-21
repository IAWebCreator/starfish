import { IconButton } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <IconButton 
      onClick={toggleTheme}
      sx={{ 
        color: 'var(--text-color)',
        '&:hover': {
          color: 'var(--primary-color)',
        }
      }}
    >
      {isDark ? <LightMode /> : <DarkMode />}
    </IconButton>
  );
};

export default ThemeToggle; 