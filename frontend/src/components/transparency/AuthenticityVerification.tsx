import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search,
  QrCode,
  CheckCircle,
  Cancel,
  VerifiedUser,
  Security,
  Fingerprint,
  PhotoCamera,
  Compare,
  Info,
  Warning,
  OpenInNew,
  ContentCopy,
  CameraAlt,
} from '@mui/icons-material';

// Types for authenticity verification
interface VerificationFeature {
  id: string;
  name: string;
  description: string;
  verified: boolean;
  verificationMethod: string;
  image?: string;
}

interface ProductDetails {
  id: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  manufactureDate: string;
  imageUrl: string;
  authenticityScore: number;
  verificationFeatures: VerificationFeature[];
}

// Props interface
interface AuthenticityVerificationProps {
  standalone?: boolean;
}

/**
 * Component for product authenticity verification
 */
const AuthenticityVerification: React.FC<AuthenticityVerificationProps> = ({
  standalone = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<ProductDetails | null>(null);
  const [showFeatureDetails, setShowFeatureDetails] = useState<boolean>(false);
  const [selectedFeature, setSelectedFeature] = useState<VerificationFeature | null>(null);
  const [showCamera, setShowCamera] = useState<boolean>(false);
  
  // Sample product details
  const sampleProduct: ProductDetails = {
    id: 'PROD-12345',
    name: 'Smartphone Galaxy S21',
    brand: 'Samsung',
    model: 'SM-G991B',
    serialNumber: 'SN12345678',
    manufactureDate: '20/02/2023',
    imageUrl: '/images/products/smartphone.jpg',
    authenticityScore: 98,
    verificationFeatures: [
      {
        id: 'feature1',
        name: 'Código QR único',
        description: 'Código QR único con firma digital que verifica la autenticidad del producto.',
        verified: true,
        verificationMethod: 'Escaneo de código QR y verificación criptográfica',
        image: '/images/verification/qr_code.jpg',
      },
      {
        id: 'feature2',
        name: 'Holograma de seguridad',
        description: 'Holograma con elementos de seguridad que cambian según el ángulo de visión.',
        verified: true,
        verificationMethod: 'Análisis de imagen y patrones holográficos',
        image: '/images/verification/hologram.jpg',
      },
      {
        id: 'feature3',
        name: 'Etiqueta NFC',
        description: 'Etiqueta NFC con firma digital que contiene información del producto.',
        verified: true,
        verificationMethod: 'Lectura NFC y verificación de firma digital',
        image: '/images/verification/nfc_tag.jpg',
      },
      {
        id: 'feature4',
        name: 'Registro en blockchain',
        description: 'Registro del producto en blockchain para verificar su autenticidad y trazabilidad.',
        verified: true,
        verificationMethod: 'Verificación en cadena de bloques',
        image: '/images/verification/blockchain.jpg',
      },
      {
        id: 'feature5',
        name: 'Sello de seguridad',
        description: 'Sello de seguridad que muestra evidencia de manipulación si ha sido abierto.',
        verified: false,
        verificationMethod: 'Inspección visual y análisis de patrones',
        image: '/images/verification/security_seal.jpg',
      },
    ],
  };
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle search submit
  const handleSearchSubmit = () => {
    if (!searchQuery) return;
    
    setIsVerifying(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
      setVerificationResult(sampleProduct);
      setIsVerifying(false);
    }, 2000);
  };
  
  // Handle feature details
  const handleFeatureDetails = (feature: VerificationFeature) => {
    setSelectedFeature(feature);
    setShowFeatureDetails(true);
  };
  
  // Handle camera open
  const handleCameraOpen = () => {
    setShowCamera(true);
  };
  
  // Handle camera close
  const handleCameraClose = () => {
    setShowCamera(false);
  };
  
  // Copy to clipboard
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  // Calculate authenticity score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };
  
  // Render standalone version (for transparency page)
  if (standalone) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Verificación de Autenticidad
        </Typography>
        
        <Typography variant="body1" paragraph>
          Verifica la autenticidad de tus productos utilizando nuestro sistema de verificación multicapa.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Verificar producto
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Ingresa el código de producto, número de serie o escanea el código QR para verificar la autenticidad del producto.
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TextField
              label="Código de producto o número de serie"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Ej. PROD-12345 o SN12345678"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearchSubmit} disabled={isVerifying}>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              variant="outlined"
              startIcon={<QrCode />}
              onClick={handleCameraOpen}
              disabled={isVerifying}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Escanear QR
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearchSubmit}
              disabled={!searchQuery || isVerifying}
              startIcon={isVerifying ? <CircularProgress size={20} /> : <VerifiedUser />}
            >
              {isVerifying ? 'Verificando...' : 'Verificar autenticidad'}
            </Button>
          </Box>
        </Paper>
        
        {verificationResult && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={verificationResult.imageUrl}
                  alt={verificationResult.name}
                  sx={{ objectFit: 'contain', p: 2 }}
                />
                
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {verificationResult.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      <strong>Marca:</strong>
                    </Typography>
                    <Typography variant="body2">
                      {verificationResult.brand}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      <strong>Modelo:</strong>
                    </Typography>
                    <Typography variant="body2">
                      {verificationResult.model}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      <strong>Número de serie:</strong>
                    </Typography>
                    <Typography variant="body2">
                      {verificationResult.serialNumber}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleCopyToClipboard(verificationResult.serialNumber)}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      <strong>Fecha de fabricación:</strong>
                    </Typography>
                    <Typography variant="body2">
                      {verificationResult.manufactureDate}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Puntuación de autenticidad
                    </Typography>
                    
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress
                        variant="determinate"
                        value={verificationResult.authenticityScore}
                        size={80}
                        thickness={4}
                        color={getScoreColor(verificationResult.authenticityScore) as any}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="div"
                          color={getScoreColor(verificationResult.authenticityScore) as any}
                        >
                          {verificationResult.authenticityScore}%
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      color={getScoreColor(verificationResult.authenticityScore) as any}
                      sx={{ mt: 1, fontWeight: 'bold' }}
                    >
                      {verificationResult.authenticityScore >= 90 
                        ? 'Producto auténtico' 
                        : verificationResult.authenticityScore >= 70 
                          ? 'Verificación parcial' 
                          : 'Posible falsificación'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Security color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Características de seguridad verificadas
                  </Typography>
                </Box>
                
                <Stepper orientation="vertical" sx={{ mb: 2 }}>
                  {verificationResult.verificationFeatures.map((feature) => (
                    <Step 
                      key={feature.id} 
                      active={true} 
                      completed={feature.verified}
                    >
                      <StepLabel 
                        StepIconComponent={() => 
                          feature.verified 
                            ? <CheckCircle color="success" /> 
                            : <Cancel color="error" />
                        }
                      >
                        <Typography variant="subtitle1">{feature.name}</Typography>
                      </StepLabel>
                      <StepContent>
                        <Typography variant="body2" paragraph>
                          {feature.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            <strong>Método de verificación:</strong>
                          </Typography>
                          <Typography variant="body2">
                            {feature.verificationMethod}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            <strong>Estado:</strong>
                          </Typography>
                          <Chip
                            label={feature.verified ? 'Verificado' : 'No verificado'}
                            color={feature.verified ? 'success' : 'error'}
                            size="small"
                          />
                        </Box>
                        
                        <Button
                          size="small"
                          startIcon={<Info />}
                          onClick={() => handleFeatureDetails(feature)}
                        >
                          Más detalles
                        </Button>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
                
                {verificationResult.authenticityScore < 100 && (
                  <Alert 
                    severity={verificationResult.authenticityScore >= 90 ? "info" : "warning"}
                    sx={{ mt: 2 }}
                  >
                    {verificationResult.authenticityScore >= 90 
                      ? "Algunas características de seguridad no pudieron ser verificadas completamente, pero el producto parece auténtico." 
                      : "Varias características de seguridad no pudieron ser verificadas. Recomendamos contactar con atención al cliente para una verificación adicional."}
                  </Alert>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
        
        {/* Feature details dialog */}
        <Dialog
          open={showFeatureDetails}
          onClose={() => setShowFeatureDetails(false)}
          maxWidth="sm"
          fullWidth
        >
          {selectedFeature && (
            <>
              <DialogTitle>
                {selectedFeature.name}
              </DialogTitle>
              
              <DialogContent>
                {selectedFeature.image && (
                  <Box 
                    component="img"
                    src={selectedFeature.image}
                    alt={selectedFeature.name}
                    sx={{ 
                      width: '100%', 
                      maxHeight: 200, 
                      objectFit: 'contain',
                      mb: 2,
                      borderRadius: 1,
                    }}
                  />
                )}
                
                <Typography variant="body1" paragraph>
                  {selectedFeature.description}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  Método de verificación
                </Typography>
                
                <Typography variant="body2" paragraph>
                  {selectedFeature.verificationMethod}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Chip
                    icon={selectedFeature.verified ? <CheckCircle /> : <Cancel />}
                    label={selectedFeature.verified ? 'Verificado' : 'No verificado'}
                    color={selectedFeature.verified ? 'success' : 'error'}
                  />
                </Box>
                
                {!selectedFeature.verified && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Esta característica de seguridad no pudo ser verificada. Esto puede deberse a daños en el producto, manipulación o problemas con el sistema de verificación.
                  </Alert>
                )}
              </DialogContent>
              
              <DialogActions>
                <Button onClick={() => setShowFeatureDetails(false)}>
                  Cerrar
                </Button>
                {selectedFeature.id === 'feature4' && (
                  <Button 
                    variant="outlined" 
                    startIcon={<OpenInNew />}
                    onClick={() => window.open('/blockchain-verification', '_blank')}
                  >
                    Ver en blockchain
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
        
        {/* Camera dialog */}
        <Dialog
          open={showCamera}
          onClose={handleCameraClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Escanear código QR
          </DialogTitle>
          
          <DialogContent>
            <Box sx={{ position: 'relative', width: '100%', height: 300, bgcolor: 'black', borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" color="white" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                Vista previa de la cámara
              </Typography>
              
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                width: 200,
                height: 200,
                border: '2px solid white',
                borderRadius: 1,
              }} />
            </Box>
            
            <Typography variant="body2" color="text.secondary" align="center">
              Coloca el código QR dentro del recuadro para escanearlo automáticamente.
            </Typography>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCameraClose}>
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<CameraAlt />}
              onClick={() => {
                handleCameraClose();
                setSearchQuery('PROD-12345');
                handleSearchSubmit();
              }}
            >
              Capturar manualmente
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
  
  // Render product detail version
  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <VerifiedUser color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Verificación de autenticidad
          </Typography>
        </Box>
        
        <Typography variant="body2" paragraph>
          Este producto cuenta con múltiples características de seguridad que garantizan su autenticidad.
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Fingerprint color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Código único: PROD-12345
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => handleCopyToClipboard('PROD-12345')}
            sx={{ ml: 1 }}
          >
            <ContentCopy fontSize="small" />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Security color="success" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Autenticidad verificada: 100%
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<Compare />}
            onClick={() => window.open('/authenticity-verification', '_blank')}
          >
            Verificar autenticidad
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<QrCode />}
            onClick={handleCameraOpen}
          >
            Escanear QR
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AuthenticityVerification;