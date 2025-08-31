import React from 'react';
import { IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  tooltipPlacement?: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * A toggle button for switching between light and dark themes
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'medium',
  tooltipPlacement = 'bottom',
}) => {
  const { mode, toggleColorMode } = useTheme();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  // Determine if the current theme matches the system preference
  const matchesSystemPreference = 
    (prefersDarkMode && mode === 'dark') || 
    (!prefersDarkMode && mode === 'light');
  
  // Tooltip text based on current mode and system preference
  const getTooltipText = () => {
    if (matchesSystemPreference) {
      return mode === 'light' 
        ? 'Cambiar a modo oscuro' 
        : 'Cambiar a modo claro';
    } else {
      return mode === 'light' 
        ? 'Cambiar a modo oscuro (Sistema: oscuro)' 
        : 'Cambiar a modo claro (Sistema: claro)';
    }
  };
  
  return (
    <Tooltip title={getTooltipText()} placement={tooltipPlacement}>
      <IconButton
        onClick={toggleColorMode}
        color="inherit"
        size={size}
        aria-label={mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;