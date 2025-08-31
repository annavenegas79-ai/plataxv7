import React, { useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  Typography,
  IconButton,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Tooltip,
  Fab,
  useMediaQuery,
  Theme,
} from '@mui/material';
import { Settings, Close, Palette, Refresh } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

// Predefined color options
const primaryColorOptions = [
  { name: 'Default', value: undefined, color: '#2D3277' },
  { name: 'Blue', value: '#1976d2', color: '#1976d2' },
  { name: 'Purple', value: '#9c27b0', color: '#9c27b0' },
  { name: 'Green', value: '#2e7d32', color: '#2e7d32' },
  { name: 'Red', value: '#d32f2f', color: '#d32f2f' },
  { name: 'Orange', value: '#ed6c02', color: '#ed6c02' },
];

const secondaryColorOptions = [
  { name: 'Default', value: undefined, color: '#FFE600' },
  { name: 'Pink', value: '#f50057', color: '#f50057' },
  { name: 'Teal', value: '#00796b', color: '#00796b' },
  { name: 'Amber', value: '#ff8f00', color: '#ff8f00' },
  { name: 'Cyan', value: '#0097a7', color: '#0097a7' },
  { name: 'Lime', value: '#c0ca33', color: '#c0ca33' },
];

/**
 * A component that allows users to customize the theme
 */
const ThemeCustomizer: React.FC = () => {
  const { mode, toggleColorMode, setPrimaryColor, setSecondaryColor, resetColors } = useTheme();
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  
  const toggleDrawer = () => {
    setOpen(!open);
  };
  
  return (
    <>
      {/* Floating action button to open the customizer */}
      <Tooltip title="Personalizar tema" placement="left">
        <Fab
          color="primary"
          aria-label="Personalizar tema"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: (theme) => theme.zIndex.drawer - 1,
          }}
          onClick={toggleDrawer}
        >
          <Settings />
        </Fab>
      </Tooltip>
      
      {/* Theme customizer drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: isMobile ? '100%' : 320,
            padding: 3,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
            <Palette sx={{ mr: 1 }} /> Personalización
          </Typography>
          <IconButton onClick={toggleDrawer} aria-label="Cerrar">
            <Close />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Mode selection */}
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">Modo</FormLabel>
          <RadioGroup
            value={mode}
            onChange={(e) => toggleColorMode()}
            row
          >
            <FormControlLabel value="light" control={<Radio />} label="Claro" />
            <FormControlLabel value="dark" control={<Radio />} label="Oscuro" />
          </RadioGroup>
        </FormControl>
        
        {/* Primary color selection */}
        <Typography variant="subtitle1" gutterBottom>
          Color primario
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {primaryColorOptions.map((option) => (
            <Tooltip key={option.name} title={option.name}>
              <Box
                onClick={() => setPrimaryColor(option.value || '')}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: option.color,
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: 'transparent',
                  '&:hover': {
                    borderColor: 'divider',
                  },
                }}
              />
            </Tooltip>
          ))}
        </Box>
        
        {/* Secondary color selection */}
        <Typography variant="subtitle1" gutterBottom>
          Color secundario
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {secondaryColorOptions.map((option) => (
            <Tooltip key={option.name} title={option.name}>
              <Box
                onClick={() => setSecondaryColor(option.value || '')}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: option.color,
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: 'transparent',
                  '&:hover': {
                    borderColor: 'divider',
                  },
                }}
              />
            </Tooltip>
          ))}
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Reset button */}
        <Button
          variant="outlined"
          color="primary"
          onClick={resetColors}
          startIcon={<Refresh />}
          fullWidth
        >
          Restablecer colores
        </Button>
      </Drawer>
    </>
  );
};

export default ThemeCustomizer;