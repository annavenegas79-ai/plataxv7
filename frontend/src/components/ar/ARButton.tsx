import React, { useState } from 'react';
import {
  Button,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Typography,
  Box,
  Tooltip,
  useMediaQuery,
  Theme,
} from '@mui/material';
import { ViewInAr, Close } from '@mui/icons-material';

import ARViewer from './ARViewer';

interface ARButtonProps {
  modelUrl: string;
  modelName: string;
  poster?: string;
  buttonVariant?: 'button' | 'icon';
  buttonSize?: 'small' | 'medium' | 'large';
  buttonColor?: 'primary' | 'secondary' | 'default';
  fullWidth?: boolean;
}

/**
 * Button component that opens an AR viewer in a dialog
 */
const ARButton: React.FC<ARButtonProps> = ({
  modelUrl,
  modelName,
  poster,
  buttonVariant = 'button',
  buttonSize = 'medium',
  buttonColor = 'primary',
  fullWidth = false,
}) => {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  return (
    <>
      {/* AR Button */}
      {buttonVariant === 'button' ? (
        <Button
          variant="contained"
          color={buttonColor}
          startIcon={<ViewInAr />}
          onClick={handleOpen}
          size={buttonSize}
          fullWidth={fullWidth}
        >
          Ver en AR
        </Button>
      ) : (
        <Tooltip title="Ver en realidad aumentada">
          <IconButton
            color={buttonColor}
            onClick={handleOpen}
            size={buttonSize}
            aria-label="Ver en realidad aumentada"
          >
            <ViewInAr />
          </IconButton>
        </Tooltip>
      )}
      
      {/* AR Viewer Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            overflow: 'hidden',
            height: isMobile ? '100%' : 'calc(100% - 64px)',
            m: isMobile ? 0 : 2,
          },
        }}
      >
        {/* Dialog Header */}
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
        }}>
          <Typography variant="h6" component="div">
            {modelName}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        {/* Dialog Content */}
        <DialogContent sx={{ p: 0, height: '100%' }}>
          <ARViewer
            modelUrl={modelUrl}
            modelName={modelName}
            poster={poster}
            onClose={handleClose}
          />
        </DialogContent>
        
        {/* Dialog Footer */}
        <DialogActions sx={{ p: 2 }}>
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Mueve, gira y haz zoom en el modelo con los controles. Haz clic en "Ver en AR" para verlo en tu espacio real.
            </Typography>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ARButton;