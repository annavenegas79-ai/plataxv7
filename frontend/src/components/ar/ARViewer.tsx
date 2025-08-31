import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Slider,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ViewInAr,
  CameraAlt,
  Fullscreen,
  FullscreenExit,
  ZoomIn,
  ZoomOut,
  ThreeSixty,
  RestartAlt,
  Close,
} from '@mui/icons-material';

// Check if the browser supports WebXR
const isWebXRSupported = () => {
  return 'xr' in navigator;
};

// Check if the browser supports model-viewer
const isModelViewerSupported = () => {
  return typeof customElements !== 'undefined' && 
         customElements.get('model-viewer') !== undefined;
};

interface ARViewerProps {
  modelUrl: string;
  modelName: string;
  poster?: string;
  alt?: string;
  onClose?: () => void;
  fullscreen?: boolean;
}

/**
 * AR Viewer component for displaying 3D models in AR
 */
const ARViewer: React.FC<ARViewerProps> = ({
  modelUrl,
  modelName,
  poster,
  alt = 'Modelo 3D',
  onClose,
  fullscreen = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const containerRef = useRef<HTMLDivElement>(null);
  const modelViewerRef = useRef<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(fullscreen);
  const [zoom, setZoom] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [arSupported, setArSupported] = useState(false);
  const [modelViewerSupported, setModelViewerSupported] = useState(false);
  
  // Load the model-viewer component dynamically
  useEffect(() => {
    const loadModelViewer = async () => {
      try {
        // Check if model-viewer is already defined
        if (!isModelViewerSupported()) {
          // Import the model-viewer script
          await import('@google/model-viewer');
          
          // Wait for the custom element to be defined
          await customElements.whenDefined('model-viewer');
        }
        
        setModelViewerSupported(true);
      } catch (error) {
        console.error('Failed to load model-viewer:', error);
        setError('No se pudo cargar el visor de modelos 3D.');
      }
    };
    
    loadModelViewer();
  }, []);
  
  // Check if AR is supported
  useEffect(() => {
    const checkARSupport = async () => {
      if (isWebXRSupported()) {
        try {
          // Check if AR is supported
          const supported = await (navigator as any).xr?.isSessionSupported('immersive-ar');
          setArSupported(supported);
        } catch (error) {
          console.error('Error checking AR support:', error);
          setArSupported(false);
        }
      } else {
        setArSupported(false);
      }
    };
    
    checkARSupport();
  }, []);
  
  // Handle model loading events
  useEffect(() => {
    if (!modelViewerRef.current) return;
    
    const handleLoad = () => {
      setLoading(false);
    };
    
    const handleError = () => {
      setLoading(false);
      setError('Error al cargar el modelo 3D. Intenta de nuevo más tarde.');
    };
    
    const modelViewer = modelViewerRef.current;
    
    modelViewer.addEventListener('load', handleLoad);
    modelViewer.addEventListener('error', handleError);
    
    return () => {
      modelViewer.removeEventListener('load', handleLoad);
      modelViewer.removeEventListener('error', handleError);
    };
  }, [modelViewerRef.current]);
  
  // Handle fullscreen mode
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  // Handle zoom change
  const handleZoomChange = (_event: Event, newValue: number | number[]) => {
    const zoomValue = newValue as number;
    setZoom(zoomValue);
    
    if (modelViewerRef.current) {
      modelViewerRef.current.scale = `${zoomValue} ${zoomValue} ${zoomValue}`;
    }
  };
  
  // Toggle auto-rotate
  const toggleAutoRotate = () => {
    setAutoRotate(!autoRotate);
    
    if (modelViewerRef.current) {
      modelViewerRef.current.autoRotate = !autoRotate;
    }
  };
  
  // Reset model position and zoom
  const resetModel = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.resetTurntableRotation();
      modelViewerRef.current.cameraOrbit = 'auto auto auto';
      modelViewerRef.current.cameraTarget = 'auto auto auto';
      setZoom(1);
      modelViewerRef.current.scale = '1 1 1';
    }
  };
  
  // Launch AR mode
  const launchAR = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.activateAR();
    }
  };
  
  // If model-viewer is not supported, show an error
  if (!modelViewerSupported && !loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Tu navegador no es compatible con la visualización de modelos 3D.
        </Alert>
        <Typography variant="body1" gutterBottom>
          Intenta con un navegador más reciente como Chrome o Safari.
        </Typography>
        {onClose && (
          <Button variant="outlined" onClick={onClose} sx={{ mt: 2 }}>
            Cerrar
          </Button>
        )}
      </Paper>
    );
  }
  
  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '100vh' : '500px',
        bgcolor: 'background.paper',
        borderRadius: isFullscreen ? 0 : 2,
        overflow: 'hidden',
      }}
    >
      {/* Loading indicator */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <CircularProgress color="primary" size={60} />
          <Typography variant="body1" color="white" sx={{ mt: 2 }}>
            Cargando modelo 3D...
          </Typography>
        </Box>
      )}
      
      {/* Error message */}
      {error && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            p: 3,
          }}
        >
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </Box>
      )}
      
      {/* Model viewer */}
      <model-viewer
        ref={modelViewerRef}
        src={modelUrl}
        alt={alt}
        poster={poster}
        ar={arSupported}
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate={autoRotate}
        shadow-intensity="1"
        environment-image="neutral"
        exposure="0.5"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: theme.palette.mode === 'dark' ? '#1E1E1E' : '#F5F5F5',
        }}
      ></model-viewer>
      
      {/* Controls overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
          zIndex: 2,
        }}
      >
        {/* Model name */}
        <Typography variant="subtitle1" color="white" sx={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}>
          {modelName}
        </Typography>
        
        {/* Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Zoom controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', width: isMobile ? 120 : 200 }}>
              <Tooltip title="Reducir zoom">
                <IconButton onClick={() => handleZoomChange({} as Event, Math.max(0.5, zoom - 0.1))} size="small" sx={{ color: 'white' }}>
                  <ZoomOut />
                </IconButton>
              </Tooltip>
              
              <Slider
                value={zoom}
                onChange={handleZoomChange}
                min={0.5}
                max={2}
                step={0.1}
                sx={{ 
                  mx: 1,
                  color: 'white',
                  '& .MuiSlider-thumb': {
                    width: 16,
                    height: 16,
                  },
                  '& .MuiSlider-rail': {
                    opacity: 0.5,
                  },
                }}
              />
              
              <Tooltip title="Aumentar zoom">
                <IconButton onClick={() => handleZoomChange({} as Event, Math.min(2, zoom + 0.1))} size="small" sx={{ color: 'white' }}>
                  <ZoomIn />
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* Auto-rotate toggle */}
            <Tooltip title={autoRotate ? "Detener rotación" : "Iniciar rotación"}>
              <IconButton onClick={toggleAutoRotate} sx={{ color: 'white' }}>
                <ThreeSixty />
              </IconButton>
            </Tooltip>
            
            {/* Reset model */}
            <Tooltip title="Restablecer vista">
              <IconButton onClick={resetModel} sx={{ color: 'white' }}>
                <RestartAlt />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* AR button */}
            {arSupported && (
              <Tooltip title="Ver en realidad aumentada">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ViewInAr />}
                  onClick={launchAR}
                  size={isMobile ? "small" : "medium"}
                >
                  {isMobile ? "AR" : "Ver en AR"}
                </Button>
              </Tooltip>
            )}
            
            {/* Fullscreen toggle */}
            <Tooltip title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}>
              <IconButton onClick={toggleFullscreen} sx={{ color: 'white' }}>
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>
            
            {/* Close button */}
            {onClose && (
              <Tooltip title="Cerrar">
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                  <Close />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ARViewer;