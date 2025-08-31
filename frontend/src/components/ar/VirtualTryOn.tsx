import React, { useState, useRef, useEffect } from 'react';
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
  Tabs,
  Tab,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CameraAlt,
  Fullscreen,
  FullscreenExit,
  ZoomIn,
  ZoomOut,
  RestartAlt,
  Close,
  PhotoCamera,
  Share,
  Download,
  Palette,
} from '@mui/icons-material';

// Check if the browser supports getUserMedia
const isUserMediaSupported = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

interface VirtualTryOnProps {
  productId: string;
  productName: string;
  productType: 'glasses' | 'hat' | 'jewelry' | 'makeup';
  variants: {
    id: string;
    name: string;
    color: string;
    imageUrl: string;
    modelUrl?: string;
  }[];
  onClose?: () => void;
}

/**
 * Virtual Try-On component for trying products using AR
 */
const VirtualTryOn: React.FC<VirtualTryOnProps> = ({
  productId,
  productName,
  productType,
  variants,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(variants[0]?.id || '');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [tabValue, setTabValue] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Initialize camera
  useEffect(() => {
    if (!isUserMediaSupported()) {
      setError('Tu navegador no es compatible con la cámara. Intenta con Chrome o Safari.');
      setLoading(false);
      return;
    }
    
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setLoading(false);
            setCameraActive(true);
          };
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('No se pudo acceder a la cámara. Verifica los permisos.');
        setLoading(false);
      }
    };
    
    startCamera();
    
    // Clean up function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        
        tracks.forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);
  
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
    setZoom(newValue as number);
  };
  
  // Reset position and zoom
  const resetPosition = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Capture image
  const captureImage = () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // TODO: Draw the virtual try-on overlay on the canvas
    // This would require implementing face tracking and model positioning
    
    // Convert canvas to image
    const imageDataUrl = canvas.toDataURL('image/png');
    setCapturedImage(imageDataUrl);
    
    // Switch to the captured image tab
    setTabValue(1);
  };
  
  // Share captured image
  const shareImage = async () => {
    if (!capturedImage) return;
    
    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share({
          title: `${productName} - Virtual Try-On`,
          text: `¡Mira cómo me queda este ${productName} de PlataMX!`,
          files: [new File([blob], 'virtual-try-on.png', { type: 'image/png' })],
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'virtual-try-on.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  };
  
  // Download captured image
  const downloadImage = () => {
    if (!capturedImage) return;
    
    const a = document.createElement('a');
    a.href = capturedImage;
    a.download = `platamx-${productName.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Get the selected variant
  const getSelectedVariant = () => {
    return variants.find((variant) => variant.id === selectedVariant) || variants[0];
  };
  
  // If user media is not supported, show an error
  if (!isUserMediaSupported() && !loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Tu navegador no es compatible con la función de probador virtual.
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
            zIndex: 10,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <CircularProgress color="primary" size={60} />
          <Typography variant="body1" color="white" sx={{ mt: 2 }}>
            Iniciando cámara...
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
            zIndex: 10,
            p: 3,
          }}
        >
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          {onClose && (
            <Button variant="contained" onClick={onClose}>
              Cerrar
            </Button>
          )}
        </Box>
      )}
      
      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 5,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
        }}
        centered
      >
        <Tab label="Cámara" icon={<CameraAlt />} />
        <Tab label="Captura" icon={<PhotoCamera />} disabled={!capturedImage} />
      </Tabs>
      
      {/* Camera view */}
      {tabValue === 0 && (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${zoom})`,
            }}
          />
          
          {/* Virtual try-on overlay would go here */}
          {/* This would require implementing face tracking and model positioning */}
          {cameraActive && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${zoom})`,
                pointerEvents: 'none',
              }}
            >
              {/* Placeholder for the virtual try-on overlay */}
              {/* In a real implementation, this would be replaced with the actual AR overlay */}
              <img
                src={getSelectedVariant()?.imageUrl}
                alt={getSelectedVariant()?.name}
                style={{
                  maxWidth: '100%',
                  opacity: 0.8,
                }}
              />
            </Box>
          )}
        </Box>
      )}
      
      {/* Captured image view */}
      {tabValue === 1 && capturedImage && (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'black',
          }}
        >
          <img
            src={capturedImage}
            alt="Captured"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        </Box>
      )}
      
      {/* Hidden canvas for capturing images */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
      
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
          zIndex: 5,
        }}
      >
        {/* Product name */}
        <Typography variant="subtitle1" color="white" sx={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}>
          {productName} - {getSelectedVariant()?.name}
        </Typography>
        
        {/* Camera view controls */}
        {tabValue === 0 && (
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
              
              {/* Reset position */}
              <Tooltip title="Restablecer vista">
                <IconButton onClick={resetPosition} sx={{ color: 'white' }}>
                  <RestartAlt />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Capture button */}
              <Button
                variant="contained"
                color="primary"
                startIcon={<PhotoCamera />}
                onClick={captureImage}
                size={isMobile ? "small" : "medium"}
              >
                {isMobile ? "Capturar" : "Tomar foto"}
              </Button>
              
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
        )}
        
        {/* Captured image controls */}
        {tabValue === 1 && capturedImage && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setTabValue(0)}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
            >
              Volver a la cámara
            </Button>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Share button */}
              <Tooltip title="Compartir">
                <IconButton onClick={shareImage} sx={{ color: 'white' }}>
                  <Share />
                </IconButton>
              </Tooltip>
              
              {/* Download button */}
              <Tooltip title="Descargar">
                <IconButton onClick={downloadImage} sx={{ color: 'white' }}>
                  <Download />
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
        )}
      </Box>
      
      {/* Variant selector */}
      {tabValue === 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 48,
            left: 0,
            right: 0,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
            zIndex: 5,
          }}
        >
          <Typography variant="subtitle2" color="white">
            Selecciona una variante:
          </Typography>
          
          <Grid container spacing={1}>
            {variants.map((variant) => (
              <Grid item key={variant.id}>
                <Tooltip title={variant.name}>
                  <Box
                    onClick={() => setSelectedVariant(variant.id)}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: variant.color,
                      border: '2px solid',
                      borderColor: selectedVariant === variant.id ? 'white' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': {
                        borderColor: 'rgba(255,255,255,0.5)',
                      },
                    }}
                  >
                    {selectedVariant === variant.id && (
                      <Palette sx={{ color: 'white', fontSize: 20 }} />
                    )}
                  </Box>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default VirtualTryOn;