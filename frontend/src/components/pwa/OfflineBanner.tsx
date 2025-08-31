import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Typography, Box, Button } from '@mui/material';
import { WifiOff, Wifi } from '@mui/icons-material';
import { setupOnlineOfflineListeners, isOnline } from '../../utils/pwa';

/**
 * Component that shows a banner when the app goes offline or comes back online
 */
const OfflineBanner: React.FC = () => {
  const [online, setOnline] = useState(isOnline());
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [showOnlineBanner, setShowOnlineBanner] = useState(false);
  
  useEffect(() => {
    // Set up online/offline listeners
    const cleanup = setupOnlineOfflineListeners(
      // Online handler
      () => {
        setOnline(true);
        setShowOfflineBanner(false);
        setShowOnlineBanner(true);
        
        // Hide the online banner after 3 seconds
        setTimeout(() => {
          setShowOnlineBanner(false);
        }, 3000);
      },
      // Offline handler
      () => {
        setOnline(false);
        setShowOnlineBanner(false);
        setShowOfflineBanner(true);
      }
    );
    
    // Initial check
    setOnline(isOnline());
    
    return cleanup;
  }, []);
  
  // Handle closing the offline banner
  const handleCloseOfflineBanner = () => {
    setShowOfflineBanner(false);
  };
  
  // Handle closing the online banner
  const handleCloseOnlineBanner = () => {
    setShowOnlineBanner(false);
  };
  
  return (
    <>
      {/* Offline banner */}
      <Snackbar
        open={showOfflineBanner}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ 
          bottom: { xs: 16, sm: 24 },
          width: { xs: '100%', sm: 'auto' },
          maxWidth: { xs: 'calc(100% - 32px)', sm: 400 }
        }}
      >
        <Alert
          severity="warning"
          icon={<WifiOff />}
          sx={{
            width: '100%',
            boxShadow: 3,
            '.MuiAlert-message': {
              width: '100%',
            },
          }}
          onClose={handleCloseOfflineBanner}
        >
          <Typography variant="subtitle2">
            Sin conexión a Internet
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Estás navegando en modo sin conexión. Algunas funciones pueden no estar disponibles.
          </Typography>
        </Alert>
      </Snackbar>
      
      {/* Online banner */}
      <Snackbar
        open={showOnlineBanner}
        autoHideDuration={3000}
        onClose={handleCloseOnlineBanner}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ 
          bottom: { xs: 16, sm: 24 },
          width: { xs: '100%', sm: 'auto' },
          maxWidth: { xs: 'calc(100% - 32px)', sm: 400 }
        }}
      >
        <Alert
          severity="success"
          icon={<Wifi />}
          sx={{
            width: '100%',
            boxShadow: 3,
          }}
          onClose={handleCloseOnlineBanner}
        >
          <Typography variant="subtitle2">
            Conexión restablecida
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Ahora estás conectado a Internet.
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
};

export default OfflineBanner;