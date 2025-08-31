import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Slider,
  Switch,
  FormControlLabel,
  Button,
  Tooltip,
  Fab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Accessibility,
  TextFields,
  FormatSize,
  Contrast,
  InvertColors,
  Speed,
  Brightness6,
  Brightness7,
  Translate,
  Close,
  ZoomIn,
  ZoomOut,
  Colorize,
  Animation,
  VolumeUp,
  Keyboard,
  TouchApp,
  Visibility,
  SettingsBackupRestore,
} from '@mui/icons-material';

// Props interface
interface AccessibilityPanelProps {
  onFontSizeChange?: (size: number) => void;
  onContrastChange?: (highContrast: boolean) => void;
  onThemeChange?: (darkMode: boolean) => void;
  onAnimationChange?: (reduceMotion: boolean) => void;
  onLanguageChange?: (language: string) => void;
  darkMode?: boolean;
}

/**
 * Component for accessibility settings panel
 */
const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  onFontSizeChange,
  onContrastChange,
  onThemeChange,
  onAnimationChange,
  onLanguageChange,
  darkMode = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState<number>(100);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(darkMode);
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);
  const [screenReader, setScreenReader] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('es');
  
  // Initialize settings from localStorage on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility_fontSize');
    const savedHighContrast = localStorage.getItem('accessibility_highContrast');
    const savedDarkMode = localStorage.getItem('accessibility_darkMode');
    const savedReduceMotion = localStorage.getItem('accessibility_reduceMotion');
    const savedScreenReader = localStorage.getItem('accessibility_screenReader');
    const savedLanguage = localStorage.getItem('accessibility_language');
    
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedHighContrast) setHighContrast(savedHighContrast === 'true');
    if (savedDarkMode) setIsDarkMode(savedDarkMode === 'true');
    if (savedReduceMotion) setReduceMotion(savedReduceMotion === 'true');
    if (savedScreenReader) setScreenReader(savedScreenReader === 'true');
    if (savedLanguage) setLanguage(savedLanguage);
    
    // Apply settings
    applyFontSize(savedFontSize ? parseInt(savedFontSize) : 100);
    applyHighContrast(savedHighContrast === 'true');
    applyReduceMotion(savedReduceMotion === 'true');
  }, []);
  
  // Toggle panel open/closed
  const togglePanel = () => {
    setOpen(!open);
  };
  
  // Handle font size change
  const handleFontSizeChange = (_event: Event, newValue: number | number[]) => {
    const newSize = newValue as number;
    setFontSize(newSize);
    applyFontSize(newSize);
    
    if (onFontSizeChange) {
      onFontSizeChange(newSize);
    }
    
    localStorage.setItem('accessibility_fontSize', newSize.toString());
  };
  
  // Handle contrast change
  const handleContrastChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setHighContrast(newValue);
    applyHighContrast(newValue);
    
    if (onContrastChange) {
      onContrastChange(newValue);
    }
    
    localStorage.setItem('accessibility_highContrast', newValue.toString());
  };
  
  // Handle dark mode change
  const handleDarkModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setIsDarkMode(newValue);
    
    if (onThemeChange) {
      onThemeChange(newValue);
    }
    
    localStorage.setItem('accessibility_darkMode', newValue.toString());
  };
  
  // Handle animation change
  const handleAnimationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setReduceMotion(newValue);
    applyReduceMotion(newValue);
    
    if (onAnimationChange) {
      onAnimationChange(newValue);
    }
    
    localStorage.setItem('accessibility_reduceMotion', newValue.toString());
  };
  
  // Handle screen reader change
  const handleScreenReaderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setScreenReader(newValue);
    
    // In a real implementation, this would enable/disable screen reader support
    // For this example, we just save the preference
    
    localStorage.setItem('accessibility_screenReader', newValue.toString());
  };
  
  // Handle language change
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
    
    localStorage.setItem('accessibility_language', lang);
  };
  
  // Reset all settings
  const handleResetSettings = () => {
    setFontSize(100);
    setHighContrast(false);
    setReduceMotion(false);
    setScreenReader(false);
    
    applyFontSize(100);
    applyHighContrast(false);
    applyReduceMotion(false);
    
    localStorage.removeItem('accessibility_fontSize');
    localStorage.removeItem('accessibility_highContrast');
    localStorage.removeItem('accessibility_reduceMotion');
    localStorage.removeItem('accessibility_screenReader');
    
    if (onFontSizeChange) onFontSizeChange(100);
    if (onContrastChange) onContrastChange(false);
    if (onAnimationChange) onAnimationChange(false);
  };
  
  // Apply font size to document
  const applyFontSize = (size: number) => {
    document.documentElement.style.fontSize = `${size}%`;
  };
  
  // Apply high contrast to document
  const applyHighContrast = (enabled: boolean) => {
    if (enabled) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  };
  
  // Apply reduce motion to document
  const applyReduceMotion = (enabled: boolean) => {
    if (enabled) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
  };
  
  return (
    <>
      {/* Accessibility button */}
      <Tooltip title="Opciones de accesibilidad">
        <Fab
          color="primary"
          aria-label="Opciones de accesibilidad"
          onClick={togglePanel}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 1000,
          }}
        >
          <Accessibility />
        </Fab>
      </Tooltip>
      
      {/* Accessibility panel */}
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: isMobile ? '100%' : 350,
            p: 2,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="div">
            Opciones de accesibilidad
          </Typography>
          <IconButton onClick={() => setOpen(false)} aria-label="Cerrar panel de accesibilidad">
            <Close />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <List>
          {/* Font size */}
          <ListItem>
            <ListItemIcon>
              <TextFields />
            </ListItemIcon>
            <ListItemText 
              primary="Tamaño de texto" 
              secondary="Ajusta el tamaño del texto en toda la plataforma"
            />
          </ListItem>
          
          <ListItem>
            <Box sx={{ width: '100%', px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ZoomOut />
                <Slider
                  value={fontSize}
                  onChange={handleFontSizeChange}
                  min={75}
                  max={150}
                  step={5}
                  marks={[
                    { value: 75, label: '75%' },
                    { value: 100, label: '100%' },
                    { value: 125, label: '125%' },
                    { value: 150, label: '150%' },
                  ]}
                  sx={{ mx: 2 }}
                />
                <ZoomIn />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Button 
                  size="small" 
                  onClick={() => handleFontSizeChange({} as Event, Math.max(75, fontSize - 5))}
                >
                  <FormatSize sx={{ fontSize: '1rem' }} /> -
                </Button>
                <Typography variant="body2">
                  {fontSize}%
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => handleFontSizeChange({} as Event, Math.min(150, fontSize + 5))}
                >
                  <FormatSize sx={{ fontSize: '1.2rem' }} /> +
                </Button>
              </Box>
            </Box>
          </ListItem>
          
          <Divider sx={{ my: 1 }} />
          
          {/* Contrast */}
          <ListItem>
            <ListItemIcon>
              <Contrast />
            </ListItemIcon>
            <ListItemText 
              primary="Alto contraste" 
              secondary="Mejora la legibilidad con mayor contraste"
            />
            <Switch
              edge="end"
              checked={highContrast}
              onChange={handleContrastChange}
              inputProps={{
                'aria-labelledby': 'high-contrast-switch',
              }}
            />
          </ListItem>
          
          {/* Dark mode */}
          <ListItem>
            <ListItemIcon>
              {isDarkMode ? <Brightness7 /> : <Brightness6 />}
            </ListItemIcon>
            <ListItemText 
              primary="Modo oscuro" 
              secondary="Reduce la fatiga visual en entornos con poca luz"
            />
            <Switch
              edge="end"
              checked={isDarkMode}
              onChange={handleDarkModeChange}
              inputProps={{
                'aria-labelledby': 'dark-mode-switch',
              }}
            />
          </ListItem>
          
          {/* Color blind mode */}
          <ListItem>
            <ListItemIcon>
              <Colorize />
            </ListItemIcon>
            <ListItemText 
              primary="Modo daltónico" 
              secondary="Ajusta los colores para diferentes tipos de daltonismo"
            />
            <Box>
              <Button size="small" onClick={() => {}}>
                Opciones
              </Button>
            </Box>
          </ListItem>
          
          <Divider sx={{ my: 1 }} />
          
          {/* Reduce motion */}
          <ListItem>
            <ListItemIcon>
              <Animation />
            </ListItemIcon>
            <ListItemText 
              primary="Reducir animaciones" 
              secondary="Minimiza las animaciones y efectos visuales"
            />
            <Switch
              edge="end"
              checked={reduceMotion}
              onChange={handleAnimationChange}
              inputProps={{
                'aria-labelledby': 'reduce-motion-switch',
              }}
            />
          </ListItem>
          
          {/* Screen reader */}
          <ListItem>
            <ListItemIcon>
              <VolumeUp />
            </ListItemIcon>
            <ListItemText 
              primary="Compatibilidad con lectores de pantalla" 
              secondary="Mejora la compatibilidad con tecnologías de asistencia"
            />
            <Switch
              edge="end"
              checked={screenReader}
              onChange={handleScreenReaderChange}
              inputProps={{
                'aria-labelledby': 'screen-reader-switch',
              }}
            />
          </ListItem>
          
          <Divider sx={{ my: 1 }} />
          
          {/* Language */}
          <ListItem>
            <ListItemIcon>
              <Translate />
            </ListItemIcon>
            <ListItemText 
              primary="Idioma" 
              secondary="Cambia el idioma de la plataforma"
            />
          </ListItem>
          
          <ListItem>
            <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'center' }}>
              <Button 
                variant={language === 'es' ? 'contained' : 'outlined'} 
                onClick={() => handleLanguageChange('es')}
              >
                Español
              </Button>
              <Button 
                variant={language === 'en' ? 'contained' : 'outlined'} 
                onClick={() => handleLanguageChange('en')}
              >
                English
              </Button>
              <Button 
                variant={language === 'pt' ? 'contained' : 'outlined'} 
                onClick={() => handleLanguageChange('pt')}
              >
                Português
              </Button>
            </Box>
          </ListItem>
          
          <Divider sx={{ my: 1 }} />
          
          {/* Additional options */}
          <ListItem button onClick={() => {}}>
            <ListItemIcon>
              <Keyboard />
            </ListItemIcon>
            <ListItemText 
              primary="Atajos de teclado" 
              secondary="Ver y personalizar atajos de teclado"
            />
          </ListItem>
          
          <ListItem button onClick={() => {}}>
            <ListItemIcon>
              <TouchApp />
            </ListItemIcon>
            <ListItemText 
              primary="Navegación simplificada" 
              secondary="Interfaz simplificada para facilitar la navegación"
            />
          </ListItem>
          
          <ListItem button onClick={() => {}}>
            <ListItemIcon>
              <Visibility />
            </ListItemIcon>
            <ListItemText 
              primary="Guía de accesibilidad" 
              secondary="Aprende a usar las funciones de accesibilidad"
            />
          </ListItem>
        </List>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<SettingsBackupRestore />}
            onClick={handleResetSettings}
          >
            Restablecer configuración
          </Button>
        </Box>
      </Drawer>
      
      {/* CSS for high contrast mode */}
      <style jsx global>{`
        .high-contrast {
          --high-contrast-text: #ffffff;
          --high-contrast-bg: #000000;
          --high-contrast-link: #ffff00;
          --high-contrast-border: #ffffff;
          
          background-color: var(--high-contrast-bg) !important;
          color: var(--high-contrast-text) !important;
        }
        
        .high-contrast .MuiPaper-root {
          background-color: #121212 !important;
          color: var(--high-contrast-text) !important;
          border: 1px solid var(--high-contrast-border) !important;
        }
        
        .high-contrast a {
          color: var(--high-contrast-link) !important;
          text-decoration: underline !important;
        }
        
        .high-contrast button {
          border: 2px solid var(--high-contrast-border) !important;
        }
        
        .reduce-motion * {
          animation: none !important;
          transition: none !important;
        }
      `}</style>
    </>
  );
};

export default AccessibilityPanel;