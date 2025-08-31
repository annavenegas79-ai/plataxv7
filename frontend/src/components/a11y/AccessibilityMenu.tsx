import React, { useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  Typography,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  Slider,
  Tooltip,
  Fab,
  useMediaQuery,
  Theme,
} from '@mui/material';
import {
  Accessibility,
  Close,
  TextIncrease,
  TextDecrease,
  FormatLineSpacing,
  Contrast,
  FontDownload,
} from '@mui/icons-material';

interface AccessibilitySettings {
  fontSize: number;
  lineSpacing: number;
  highContrast: boolean;
  reducedMotion: boolean;
  dyslexicFont: boolean;
}

/**
 * A component that provides accessibility options for users
 */
const AccessibilityMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  
  // Default settings
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 100, // percentage
    lineSpacing: 1.5, // multiplier
    highContrast: false,
    reducedMotion: false,
    dyslexicFont: false,
  });
  
  const toggleDrawer = () => {
    setOpen(!open);
  };
  
  // Apply font size
  const handleFontSizeChange = (_event: Event, newValue: number | number[]) => {
    const value = newValue as number;
    setSettings({ ...settings, fontSize: value });
    document.documentElement.style.setProperty('--a11y-font-scale', `${value / 100}`);
  };
  
  // Apply line spacing
  const handleLineSpacingChange = (_event: Event, newValue: number | number[]) => {
    const value = newValue as number;
    setSettings({ ...settings, lineSpacing: value });
    document.documentElement.style.setProperty('--a11y-line-height', `${value}`);
  };
  
  // Toggle high contrast
  const handleHighContrastChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSettings({ ...settings, highContrast: checked });
    
    if (checked) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };
  
  // Toggle reduced motion
  const handleReducedMotionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSettings({ ...settings, reducedMotion: checked });
    
    if (checked) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  };
  
  // Toggle dyslexic font
  const handleDyslexicFontChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSettings({ ...settings, dyslexicFont: checked });
    
    if (checked) {
      document.documentElement.classList.add('dyslexic-font');
    } else {
      document.documentElement.classList.remove('dyslexic-font');
    }
  };
  
  // Reset all settings
  const resetSettings = () => {
    setSettings({
      fontSize: 100,
      lineSpacing: 1.5,
      highContrast: false,
      reducedMotion: false,
      dyslexicFont: false,
    });
    
    document.documentElement.style.removeProperty('--a11y-font-scale');
    document.documentElement.style.removeProperty('--a11y-line-height');
    document.documentElement.classList.remove('high-contrast', 'reduced-motion', 'dyslexic-font');
  };
  
  return (
    <>
      {/* Floating action button to open the menu */}
      <Tooltip title="Opciones de accesibilidad" placement="left">
        <Fab
          color="primary"
          aria-label="Opciones de accesibilidad"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: isMobile ? 24 : 96, // Position to the left of theme customizer if present
            zIndex: (theme) => theme.zIndex.drawer - 1,
          }}
          onClick={toggleDrawer}
        >
          <Accessibility />
        </Fab>
      </Tooltip>
      
      {/* Accessibility menu drawer */}
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
            <Accessibility sx={{ mr: 1 }} /> Accesibilidad
          </Typography>
          <IconButton onClick={toggleDrawer} aria-label="Cerrar">
            <Close />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Font size control */}
        <Typography id="font-size-slider" gutterBottom>
          Tamaño de texto
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TextDecrease sx={{ mr: 2 }} />
          <Slider
            value={settings.fontSize}
            onChange={handleFontSizeChange}
            aria-labelledby="font-size-slider"
            min={75}
            max={200}
            step={5}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}%`}
          />
          <TextIncrease sx={{ ml: 2 }} />
        </Box>
        
        {/* Line spacing control */}
        <Typography id="line-spacing-slider" gutterBottom>
          Espaciado de línea
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <FormatLineSpacing sx={{ mr: 2 }} />
          <Slider
            value={settings.lineSpacing}
            onChange={handleLineSpacingChange}
            aria-labelledby="line-spacing-slider"
            min={1}
            max={3}
            step={0.1}
            valueLabelDisplay="auto"
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* High contrast mode */}
        <FormControlLabel
          control={
            <Switch
              checked={settings.highContrast}
              onChange={handleHighContrastChange}
              name="highContrast"
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Contrast sx={{ mr: 1 }} />
              <Typography>Alto contraste</Typography>
            </Box>
          }
          sx={{ mb: 2 }}
        />
        
        {/* Reduced motion */}
        <FormControlLabel
          control={
            <Switch
              checked={settings.reducedMotion}
              onChange={handleReducedMotionChange}
              name="reducedMotion"
              color="primary"
            />
          }
          label="Movimiento reducido"
          sx={{ mb: 2 }}
        />
        
        {/* Dyslexic font */}
        <FormControlLabel
          control={
            <Switch
              checked={settings.dyslexicFont}
              onChange={handleDyslexicFontChange}
              name="dyslexicFont"
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FontDownload sx={{ mr: 1 }} />
              <Typography>Fuente para dislexia</Typography>
            </Box>
          }
          sx={{ mb: 3 }}
        />
        
        <Divider sx={{ my: 2 }} />
        
        {/* Reset button */}
        <Button
          variant="outlined"
          color="primary"
          onClick={resetSettings}
          fullWidth
        >
          Restablecer ajustes
        </Button>
      </Drawer>
    </>
  );
};

export default AccessibilityMenu;