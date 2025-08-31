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
  Notifications,
  NotificationsActive,
  LocalShipping,
  LocalOffer,
  ShoppingCart,
  Close,
} from '@mui/icons-material';

import { 
  supportsPushNotifications, 
  requestNotificationPermission,
  registerServiceWorker,
  subscribeToPushNotifications
} from '../../utils/pwa';

/**
 * Component that handles notification permission requests
 */
const NotificationPermission: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  
  useEffect(() => {
    // Check if the browser supports notifications
    if (!supportsPushNotifications()) {
      return;
    }
    
    // Get the current permission state
    setPermissionState(Notification.permission);
    
    // If permission is already granted or denied, don't show the banner
    if (Notification.permission !== 'default') {
      return;
    }
    
    // Show the banner after a delay
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle the enable notifications button click
  const handleEnableNotifications = async () => {
    setShowBanner(false);
    
    try {
      // Request permission
      const permission = await requestNotificationPermission();
      setPermissionState(permission);
      
      if (permission === 'granted') {
        // Register service worker if not already registered
        const registration = await registerServiceWorker();
        
        if (registration) {
          // Subscribe to push notifications
          await subscribeToPushNotifications(registration);
          
          // Show a test notification
          showWelcomeNotification();
        }
      } else if (permission === 'denied') {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
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
  
  // Show a welcome notification
  const showWelcomeNotification = () => {
    if (Notification.permission === 'granted') {
      const notification = new Notification('¡Bienvenido a PlataMX!', {
        body: 'Gracias por activar las notificaciones. Te mantendremos informado sobre tus pedidos y ofertas especiales.',
        icon: '/icons/android-chrome-192x192.png',
        badge: '/icons/badge-72x72.png',
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };
  
  // If notifications are not supported or permission is not default, don't render the banner
  if (!supportsPushNotifications() || permissionState !== 'default') {
    return null;
  }
  
  return (
    <>
      {/* Notification permission banner */}
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
              Activa las notificaciones
            </Typography>
            <Typography variant="body2">
              Recibe actualizaciones sobre tus pedidos y ofertas especiales
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
              onClick={handleEnableNotifications}
              startIcon={<Notifications />}
            >
              Activar
            </Button>
          </Box>
        </Alert>
      </Snackbar>
      
      {/* Notification permission dialog with more information */}
      <Dialog
        open={showDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          Activa las notificaciones
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" paragraph>
            Al activar las notificaciones, podrás recibir:
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <LocalShipping color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Actualizaciones de envío" 
                secondary="Seguimiento en tiempo real de tus pedidos"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <LocalOffer color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Ofertas exclusivas" 
                secondary="Descuentos y promociones personalizadas"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <ShoppingCart color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Recordatorios de carrito" 
                secondary="Avisos sobre productos en tu carrito"
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <NotificationsActive color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Alertas de precio" 
                secondary="Notificaciones cuando baje el precio de tus productos favoritos"
              />
            </ListItem>
          </List>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Puedes desactivar las notificaciones en cualquier momento desde la configuración de tu navegador.
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Ahora no
          </Button>
          <Button 
            onClick={handleEnableNotifications} 
            variant="contained" 
            color="primary"
            startIcon={<Notifications />}
          >
            Activar notificaciones
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NotificationPermission;