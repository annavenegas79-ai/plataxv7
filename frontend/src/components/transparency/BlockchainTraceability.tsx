import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Link,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  useTheme,
  useMediaQuery,
  Alert,
} from '@mui/material';
import {
  Verified,
  VerifiedUser,
  LocalShipping,
  Inventory,
  Factory,
  Agriculture,
  QrCode,
  Search,
  Timeline,
  Info,
  OpenInNew,
  ContentCopy,
  CheckCircle,
  WarningAmber,
  Fingerprint,
  Visibility,
  LocationOn,
  CalendarToday,
  Person,
} from '@mui/icons-material';

// Types for product traceability
interface TraceabilityStep {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  verifiedBy: string;
  transactionHash: string;
  additionalInfo?: {
    label: string;
    value: string;
  }[];
}

interface ProductOrigin {
  producer: string;
  location: string;
  date: string;
  certifications: string[];
  materials: {
    name: string;
    source: string;
    sustainable: boolean;
  }[];
}

// Props interface
interface BlockchainTraceabilityProps {
  productId?: string;
  productName?: string;
  productImageUrl?: string;
  standalone?: boolean;
}

/**
 * Component for blockchain product traceability
 */
const BlockchainTraceability: React.FC<BlockchainTraceabilityProps> = ({
  productId = 'PROD-12345',
  productName = 'Smartphone Galaxy S21',
  productImageUrl = '/images/products/smartphone.jpg',
  standalone = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOrigin, setShowOrigin] = useState<boolean>(false);
  const [showTransaction, setShowTransaction] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string>('');
  const [verificationSuccess, setVerificationSuccess] = useState<boolean | null>(null);
  
  // Sample traceability data
  const traceabilitySteps: TraceabilityStep[] = [
    {
      id: 'step1',
      title: 'Producción de materias primas',
      description: 'Extracción y procesamiento de materiales para componentes electrónicos.',
      location: 'Múltiples ubicaciones',
      date: '15/01/2023',
      verifiedBy: 'RawMaterials Certification Inc.',
      transactionHash: '0x8a7d953f45d5d6df3e3f68c9e0545c7e5a9c5d9b2e1f8a7d4c5b2e1f8a7d4c5b',
      additionalInfo: [
        { label: 'Certificación de minerales', value: 'Conflict-Free Minerals' },
        { label: 'Huella de carbono', value: '12.5 kg CO₂e' },
      ],
    },
    {
      id: 'step2',
      title: 'Fabricación de componentes',
      description: 'Producción de componentes electrónicos y ensamblaje de placas.',
      location: 'Shenzhen, China',
      date: '03/02/2023',
      verifiedBy: 'Electronics Manufacturing Standards',
      transactionHash: '0x3e1f8a7d4c5b2e1f8a7d4c5b2e1f8a7d4c5b2e1f8a7d4c5b2e1f8a7d4c5b2e1f',
      additionalInfo: [
        { label: 'Estándar de calidad', value: 'ISO 9001:2015' },
        { label: 'Condiciones laborales', value: 'Fair Labor Association Certified' },
      ],
    },
    {
      id: 'step3',
      title: 'Ensamblaje final',
      description: 'Ensamblaje final del producto y pruebas de calidad.',
      location: 'Busan, Corea del Sur',
      date: '20/02/2023',
      verifiedBy: 'Samsung Electronics Co.',
      transactionHash: '0x5b2e1f8a7d4c5b2e1f8a7d4c5b2e1f8a7d4c5b2e1f8a7d4c5b2e1f8a7d4c5b2e',
      additionalInfo: [
        { label: 'Pruebas realizadas', value: '142 puntos de control' },
        { label: 'Eficiencia energética', value: 'Energy Star 6.0' },
      ],
    },
    {
      id: 'step4',
      title: 'Distribución internacional',
      description: 'Transporte desde la fábrica al centro de distribución internacional.',
      location: 'Ruta: Busan → Rotterdam',
      date: '05/03/2023',
      verifiedBy: 'Global Logistics Partners',
      transactionHash: '0x1f8a7d4c5b2e1f8a7d4c5b2e1f8a7d4c5b2e1f8a7d4c5b2e1f8a7d4c5b2e1f8a',
      additionalInfo: [
        { label: 'Método de transporte', value: 'Marítimo - Bajo carbono' },
        { label: 'Huella de carbono', value: '3.2 kg CO₂e' },
      ],
    },
    {
      id: 'step5',
      title: 'Centro de distribución regional',
      description: 'Procesamiento y preparación para distribución local.',
      location: 'Madrid, España',
      date: '18/03/2023',
      verifiedBy: 'European Distribution Center',
      transactionHash: '0x7d4c5b2e1f8a7d4c5b2e1f8a7d4c5b2e1f8a7d4c5b2e1f8a7d4c5b2e1f8a7d4c',
      additionalInfo: [
        { label: 'Control de calidad', value: 'Aprobado' },
        { label: 'Condiciones de almacenamiento', value: 'Temperatura controlada' },
      ],
    },
    {
      id: 'step6',
      title: 'Distribución al minorista',
      description: 'Transporte desde el centro de distribución al minorista.',
      location: 'Ciudad de México, México',
      date: '25/03/2023',
      verifiedBy: 'MX Logistics',
      transactionHash: '0x4c5b2e1f8a7d4c5b2e1f8a7d4c5b2e1f8a7d4c5b2e1f8a7d4c5b2e1f8a7d4c5b',
      additionalInfo: [
        { label: 'Método de transporte', value: 'Terrestre' },
        { label: 'Tiempo de tránsito', value: '2 días' },
      ],
    },
    {
      id: 'step7',
      title: 'Verificación final y venta',
      description: 'Verificación final del producto y venta al cliente.',
      location: 'Ciudad de México, México',
      date: '28/03/2023',
      verifiedBy: 'PlataMX',
      transactionHash: '0x2e1f8a7d4c5b2e1f8a7d4c5b2e1f8a7d4c5b2e1f8a7d4c5b2e1f8a7d4c5b2e1f',
      additionalInfo: [
        { label: 'Garantía activada', value: '2 años' },
        { label: 'Programa de reciclaje', value: 'Disponible' },
      ],
    },
  ];
  
  // Sample product origin data
  const productOrigin: ProductOrigin = {
    producer: 'Samsung Electronics Co., Ltd.',
    location: 'Busan, Corea del Sur',
    date: '20/02/2023',
    certifications: ['ISO 14001', 'Fair Trade Certified', 'Energy Star'],
    materials: [
      {
        name: 'Aluminio (Carcasa)',
        source: 'Australia',
        sustainable: true,
      },
      {
        name: 'Litio (Batería)',
        source: 'Chile',
        sustainable: true,
      },
      {
        name: 'Cobalto (Batería)',
        source: 'República Democrática del Congo',
        sustainable: false,
      },
      {
        name: 'Vidrio (Pantalla)',
        source: 'Japón',
        sustainable: true,
      },
      {
        name: 'Silicio (Procesador)',
        source: 'Estados Unidos',
        sustainable: true,
      },
    ],
  };
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle search submit
  const handleSearchSubmit = () => {
    // In a real implementation, this would verify the product ID
    // For this example, we just simulate a verification
    
    if (searchQuery === productId) {
      setVerificationSuccess(true);
    } else {
      setVerificationSuccess(false);
    }
  };
  
  // Handle transaction click
  const handleTransactionClick = (hash: string) => {
    setSelectedTransaction(hash);
    setShowTransaction(true);
  };
  
  // Copy to clipboard
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  // Render standalone version (for transparency page)
  if (standalone) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Trazabilidad Blockchain
        </Typography>
        
        <Typography variant="body1" paragraph>
          Verifica la autenticidad y trazabilidad de tus productos utilizando nuestra tecnología blockchain.
        </Typography>
        
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Verificar producto
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Ingresa el código de producto o escanea el código QR para verificar su autenticidad y ver su historial completo.
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TextField
              label="Código de producto"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Ej. PROD-12345"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearchSubmit}>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              variant="outlined"
              startIcon={<QrCode />}
              onClick={() => {}}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Escanear QR
            </Button>
          </Box>
          
          {verificationSuccess !== null && (
            <Box sx={{ mt: 2, mb: 3 }}>
              {verificationSuccess ? (
                <Alert 
                  icon={<CheckCircle fontSize="inherit" />} 
                  severity="success"
                  sx={{ mb: 2 }}
                >
                  Producto verificado. Este es un producto auténtico registrado en nuestra blockchain.
                </Alert>
              ) : (
                <Alert 
                  icon={<WarningAmber fontSize="inherit" />} 
                  severity="error"
                  sx={{ mb: 2 }}
                >
                  No se pudo verificar el producto. El código ingresado no coincide con ningún producto registrado.
                </Alert>
              )}
            </Box>
          )}
        </Paper>
        
        {verificationSuccess && (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={productImageUrl}
                    alt={productName}
                    sx={{ objectFit: 'contain', p: 2 }}
                  />
                  
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {productName}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Fingerprint color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        ID: {productId}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleCopyToClipboard(productId)}
                        sx={{ ml: 1 }}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <VerifiedUser color="success" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Autenticidad verificada
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarToday color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Fecha de fabricación: {productOrigin.date}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Info />}
                        onClick={() => setShowOrigin(true)}
                        fullWidth
                      >
                        Ver origen y materiales
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Timeline color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Historial de trazabilidad
                    </Typography>
                  </Box>
                  
                  <Stepper orientation="vertical" sx={{ mb: 2 }}>
                    {traceabilitySteps.map((step) => (
                      <Step key={step.id} active={true} completed={true}>
                        <StepLabel>
                          <Typography variant="subtitle1">{step.title}</Typography>
                        </StepLabel>
                        <StepContent>
                          <Typography variant="body2" paragraph>
                            {step.description}
                          </Typography>
                          
                          <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <LocationOn color="action" sx={{ mr: 1, fontSize: 20 }} />
                                <Typography variant="body2">
                                  {step.location}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarToday color="action" sx={{ mr: 1, fontSize: 20 }} />
                                <Typography variant="body2">
                                  {step.date}
                                </Typography>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Person color="action" sx={{ mr: 1, fontSize: 20 }} />
                                <Typography variant="body2">
                                  Verificado por: {step.verifiedBy}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Fingerprint color="primary" sx={{ mr: 1, fontSize: 20 }} />
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    cursor: 'pointer',
                                    '&:hover': { textDecoration: 'underline' },
                                    maxWidth: '200px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                  onClick={() => handleTransactionClick(step.transactionHash)}
                                >
                                  {step.transactionHash.substring(0, 10)}...
                                </Typography>
                                <Tooltip title="Ver en blockchain">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleTransactionClick(step.transactionHash)}
                                  >
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Grid>
                          </Grid>
                          
                          {step.additionalInfo && (
                            <Box sx={{ mt: 1 }}>
                              {step.additionalInfo.map((info, index) => (
                                <Chip
                                  key={index}
                                  label={`${info.label}: ${info.value}`}
                                  size="small"
                                  sx={{ mr: 1, mb: 1 }}
                                />
                              ))}
                            </Box>
                          )}
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </Paper>
              </Grid>
            </Grid>
            
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Todos los datos de trazabilidad están asegurados mediante tecnología blockchain, garantizando su inmutabilidad y transparencia.
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<OpenInNew />}
                onClick={() => window.open('#', '_blank')}
              >
                Más información sobre nuestra tecnología blockchain
              </Button>
            </Box>
          </>
        )}
        
        {/* Origin dialog */}
        <Dialog
          open={showOrigin}
          onClose={() => setShowOrigin(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Origen y materiales del producto
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Información del fabricante
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Factory color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      {productOrigin.producer}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {productOrigin.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarToday color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Fecha de fabricación: {productOrigin.date}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="subtitle1" gutterBottom>
                  Certificaciones
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  {productOrigin.certifications.map((cert, index) => (
                    <Chip
                      key={index}
                      icon={<Verified />}
                      label={cert}
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Materiales y origen
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  {productOrigin.materials.map((material, index) => (
                    <Paper
                      key={index}
                      variant="outlined"
                      sx={{ p: 2, mb: 2 }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2">
                          {material.name}
                        </Typography>
                        
                        <Chip
                          label={material.sustainable ? 'Sostenible' : 'No sostenible'}
                          color={material.sustainable ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn color="action" sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          Origen: {material.source}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" color="text.secondary">
              Todos los datos de origen y materiales están verificados y registrados en blockchain para garantizar su autenticidad.
            </Typography>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setShowOrigin(false)}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Transaction dialog */}
        <Dialog
          open={showTransaction}
          onClose={() => setShowTransaction(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Detalles de la transacción blockchain
          </DialogTitle>
          
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Hash de transacción
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                bgcolor: 'background.paper', 
                p: 2, 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}>
                <Typography variant="body2" sx={{ wordBreak: 'break-all', flexGrow: 1 }}>
                  {selectedTransaction}
                </Typography>
                
                <IconButton 
                  size="small" 
                  onClick={() => handleCopyToClipboard(selectedTransaction)}
                  sx={{ ml: 1 }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Información de la blockchain
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Red:</strong> Ethereum
                  </Typography>
                  <Typography variant="body2">
                    <strong>Bloque:</strong> 16,842,753
                  </Typography>
                  <Typography variant="body2">
                    <strong>Timestamp:</strong> 2023-03-28 14:32:15 UTC
                  </Typography>
                  <Typography variant="body2">
                    <strong>Confirmaciones:</strong> 245,631
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Datos verificados
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Producto ID:</strong> {productId}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Operación:</strong> Registro de etapa de trazabilidad
                  </Typography>
                  <Typography variant="body2">
                    <strong>Verificador:</strong> PlataMX Blockchain Verifier
                  </Typography>
                  <Typography variant="body2">
                    <strong>Estado:</strong> Verificado
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<OpenInNew />}
                onClick={() => window.open(`https://etherscan.io/tx/${selectedTransaction}`, '_blank')}
              >
                Ver en Etherscan
              </Button>
            </Box>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setShowTransaction(false)}>
              Cerrar
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
          Este producto cuenta con verificación blockchain que garantiza su autenticidad y permite rastrear su origen y cadena de suministro.
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Fingerprint color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2">
            ID: {productId}
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => handleCopyToClipboard(productId)}
            sx={{ ml: 1 }}
          >
            <ContentCopy fontSize="small" />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Factory color="action" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Fabricante: {productOrigin.producer}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn color="action" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Origen: {productOrigin.location}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<Timeline />}
            onClick={() => window.open(`/product/traceability/${productId}`, '_blank')}
          >
            Ver trazabilidad completa
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<QrCode />}
            onClick={() => {}}
          >
            Verificar con QR
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BlockchainTraceability;