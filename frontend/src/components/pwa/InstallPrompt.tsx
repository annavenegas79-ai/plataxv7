import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Theme,
} from '@mui/material';
import {
  GetApp,
  Home,
  Speed,
  WifiOff,
  Notifications,
  Close,
  Check,
} from '@mui/icons-material';

import { 
  isAppInstalled, 
  canInstallApp, 
  setupInstallPrompt, 
  showInstallPrompt 
} from '../../utils/pwa';

/**
 * Component that handles PWA installation prompts
 */
const InstallPrompt: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [installable, setInstallable] = useState(false);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  
  useEffect(() => {
    // Don't show install prompts if the app is already installed
    if (isAppInstalled()) {
      return;
    }
    
    // Set up the install prompt event handler
    setupInstallPrompt();
    
    // Listen for the appInstallable event
    const handleAppInstallable = () => {
      setInstallable(true);
      
      // Show the banner after a delay
      setTimeout(() => {
        setShowBanner(true);
      }, 3000);
    };
    
    // Listen for the appInstalled event
    const handleAppInstalled = () => {
      setInstallable(false);
      setShowBanner(false);
      setShowDialog(false);
    };
    
    window.addEventListener('appInstallable', handleAppInstallable);
    window.addEventListener('appInstalled', handleAppInstalled);
    
    // Check if the app can be installed
    canInstallApp().then((result) => {
      setInstallable(result);
      
      // Show the banner after a delay if installable
      if (result) {
        setTimeout(() => {
          setShowBanner(true);
        }, 3000);
      }
    });
    
    return () => {
      window.removeEventListener('appInstallable', handleAppInstallable);
      window.removeEventListener('appInstalled', handleAppInstalled);
    };
  }, []);
  
  // Handle the install button click
  const handleInstall = async () => {
    setShowBanner(false);
    
    try {
      const installed = await showInstallPrompt();
      
      if (installed) {
        // The app was installed successfully
        console.log('App installed successfully');
      } else {
        // The user declined the installation
        console.log('App installation declined');
        
        // Show the banner again after a delay
        setTimeout(() => {
          setShowBanner(true);
        }, 86400000); // 24 hours
      }
    } catch (error) {
      console.error('Error installing app:', error);
    }
  };
  
  // Handle the "Learn More" button click
  const handleLearnMore = () => {
    setShowBanner(false);
    setShowDialog(true);
  };
  
  // Handle closing the dialog
  const handleCloseDialog = () => {
    setShowDialog(false);
  };
  
  // If the app is not installable, don't render anything
  if (!installable) {
    return null;
  }
  
  return (
    <>
      {/* Install banner */}
      <Snackbar
        open={showBanner}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ 
          bottom: { xs: 16, sm: 24 },
          width: { xs: '100%', sm: 'auto' },
          maxWidth: { xs: 'calc(100% - 32px)', sm: 400 }
        }}
      >
        <Alert
          severity="info"
          sx={{
            width: '100%',
            boxShadow: 3,
            alignItems: 'center',
            '.MuiAlert-message': {
              width: '100%',
            },
          }}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                color="inherit"
                size="small"
                onClick={() => setShowBanner(false)}
                sx={{ mr: 1 }}
              >
                <Close fontSize="small" />
              </Button>
            </Box>
          }
        >
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">
              Instala PlataMX en tu dispositivo
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Button
              size="small"
              onClick={handleLearnMore}
              color="info"
            >
              Más información
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={handleInstall}
              startIcon={<GetApp />}
            >
              Instalar
            </Button>
          </Box>
        </Alert>
      </Snackbar>
      
      {/* Install dialog with more information */}
      <Dialog
        open={showDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          Instala PlataMX en tu dispositivo
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" paragraph>
            Instala PlataMX como una aplicación en tu dispositivo para disfrutar de estas ventajas:
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <Home color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Acceso directo desde tu pantalla de inicio" 
                secondary="Sin necesidad de abrir el navegador"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <Speed color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Carga más rápida" 
                secondary="Mejor rendimiento que en el navegador"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <WifiOff color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Funciona sin conexión" 
                secondary="Accede a contenido guardado incluso sin internet"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <Notifications color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Recibe notificaciones" 
                secondary="Mantente al día con tus pedidos y ofertas"
              />
            </ListItem>
          </List>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            La instalación no ocupa espacio adicional en tu dispositivo y puedes desinstalarla en cualquier momento.
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Ahora no
          </Button>
          <Button 
            onClick={handleInstall} 
            variant="contained" 
            color="primary"
            startIcon={<GetApp />}
          >
            Instalar ahora
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InstallPrompt;