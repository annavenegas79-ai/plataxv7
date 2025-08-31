import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Recycling,
  LocalShipping,
  Store,
  Redeem,
  VolunteerActivism,
  CheckCircle,
  QrCode,
  Print,
  LocationOn,
} from '@mui/icons-material';

// Types for recycling programs
interface RecyclingProgram {
  id: string;
  name: string;
  description: string;
  acceptedItems: string[];
  rewardType: 'credit' | 'discount' | 'donation';
  rewardValue: number;
  imageUrl: string;
}

// Types for recycling locations
interface RecyclingLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  hours: string;
  acceptedItems: string[];
  imageUrl: string;
}

// Props interface
interface RecyclingProgramProps {
  onProgramSelect?: (programId: string) => void;
}

/**
 * Component for recycling and take-back programs
 */
const RecyclingProgram: React.FC<RecyclingProgramProps> = ({
  onProgramSelect,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [donateReward, setDonateReward] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showLocations, setShowLocations] = useState<boolean>(false);
  
  // Sample recycling programs
  const recyclingPrograms: RecyclingProgram[] = [
    {
      id: 'rp1',
      name: 'Programa de Reciclaje de Electrónicos',
      description: 'Recicla tus dispositivos electrónicos antiguos y recibe crédito para compras futuras.',
      acceptedItems: ['Smartphones', 'Tablets', 'Laptops', 'Monitores', 'Periféricos'],
      rewardType: 'credit',
      rewardValue: 500,
      imageUrl: '/images/recycling/electronics.jpg',
    },
    {
      id: 'rp2',
      name: 'Programa de Retoma de Electrodomésticos',
      description: 'Entrega tus electrodomésticos antiguos al comprar nuevos y obtén un descuento inmediato.',
      acceptedItems: ['Refrigeradores', 'Lavadoras', 'Secadoras', 'Hornos', 'Microondas'],
      rewardType: 'discount',
      rewardValue: 15,
      imageUrl: '/images/recycling/appliances.jpg',
    },
    {
      id: 'rp3',
      name: 'Reciclaje de Empaques',
      description: 'Devuelve los empaques de tus compras para su reciclaje y apoya programas de reforestación.',
      acceptedItems: ['Cajas de cartón', 'Embalajes de plástico', 'Bolsas', 'Protectores de espuma'],
      rewardType: 'donation',
      rewardValue: 50,
      imageUrl: '/images/recycling/packaging.jpg',
    },
  ];
  
  // Sample recycling locations
  const recyclingLocations: RecyclingLocation[] = [
    {
      id: 'rl1',
      name: 'Centro de Reciclaje Norte',
      address: 'Av. Insurgentes Norte 123',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '07700',
      hours: 'Lun-Sáb: 9:00 - 18:00',
      acceptedItems: ['Smartphones', 'Tablets', 'Laptops', 'Monitores', 'Periféricos', 'Cajas de cartón', 'Embalajes de plástico'],
      imageUrl: '/images/recycling/center1.jpg',
    },
    {
      id: 'rl2',
      name: 'Centro de Reciclaje Sur',
      address: 'Av. Universidad 456',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '04500',
      hours: 'Lun-Sáb: 10:00 - 19:00, Dom: 10:00 - 14:00',
      acceptedItems: ['Smartphones', 'Tablets', 'Laptops', 'Refrigeradores', 'Lavadoras', 'Secadoras', 'Cajas de cartón'],
      imageUrl: '/images/recycling/center2.jpg',
    },
    {
      id: 'rl3',
      name: 'Punto Verde Polanco',
      address: 'Calle Horacio 789',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '11550',
      hours: 'Lun-Vie: 9:00 - 20:00, Sáb: 10:00 - 18:00',
      acceptedItems: ['Smartphones', 'Tablets', 'Cajas de cartón', 'Embalajes de plástico', 'Bolsas', 'Protectores de espuma'],
      imageUrl: '/images/recycling/center3.jpg',
    },
  ];
  
  // Handle program selection
  const handleProgramSelect = (programId: string) => {
    setSelectedProgram(programId);
    
    if (onProgramSelect) {
      onProgramSelect(programId);
    }
    
    // Reset selected items
    setSelectedItems([]);
    
    // Move to next step
    handleNext();
  };
  
  // Handle item selection
  const handleItemSelect = (item: string) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };
  
  // Handle method selection
  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    
    // If mail-in selected, move to next step
    if (method === 'mail') {
      handleNext();
    }
  };
  
  // Handle location selection
  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId);
    setShowLocations(false);
    
    // Move to next step
    handleNext();
  };
  
  // Handle next step
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Handle reset
  const handleReset = () => {
    setActiveStep(0);
    setSelectedProgram('');
    setSelectedItems([]);
    setSelectedMethod('');
    setSelectedLocation('');
    setDonateReward(false);
    setShowSuccess(false);
  };
  
  // Handle submit
  const handleSubmit = () => {
    // Show success dialog
    setShowSuccess(true);
  };
  
  // Get selected program
  const getSelectedProgram = () => {
    return recyclingPrograms.find(program => program.id === selectedProgram);
  };
  
  // Get selected location
  const getSelectedLocation = () => {
    return recyclingLocations.find(location => location.id === selectedLocation);
  };
  
  // Get reward text
  const getRewardText = (program: RecyclingProgram) => {
    switch (program.rewardType) {
      case 'credit':
        return `Recibe $${program.rewardValue} en crédito para compras futuras`;
      case 'discount':
        return `Obtén ${program.rewardValue}% de descuento en tu próxima compra`;
      case 'donation':
        return `Contribuye con $${program.rewardValue} a programas de reforestación`;
      default:
        return '';
    }
  };
  
  // Steps for the recycling process
  const steps = [
    {
      label: 'Selecciona un programa',
      description: 'Elige el programa de reciclaje que mejor se adapte a tus necesidades.',
      content: (
        <Grid container spacing={3}>
          {recyclingPrograms.map((program) => (
            <Grid item xs={12} md={4} key={program.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                  border: selectedProgram === program.id ? `2px solid ${theme.palette.primary.main}` : 'none',
                }}
                onClick={() => handleProgramSelect(program.id)}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={program.imageUrl}
                  alt={program.name}
                />
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {program.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {program.description}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Artículos aceptados:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {program.acceptedItems.map((item, index) => (
                      <Chip key={index} label={item} size="small" />
                    ))}
                  </Box>
                  
                  <Chip
                    icon={program.rewardType === 'credit' ? <Redeem /> : 
                          program.rewardType === 'discount' ? <LocalShipping /> : 
                          <VolunteerActivism />}
                    label={getRewardText(program)}
                    color="primary"
                    variant="outlined"
                  />
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProgramSelect(program.id);
                    }}
                  >
                    Seleccionar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ),
    },
    {
      label: 'Selecciona los artículos',
      description: 'Indica qué artículos deseas reciclar o retomar.',
      content: (
        <Box>
          {getSelectedProgram() && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Selecciona los artículos que deseas reciclar:
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {getSelectedProgram()?.acceptedItems.map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: selectedItems.includes(item) ? 'primary.main' : 'divider',
                        bgcolor: selectedItems.includes(item) ? 'action.hover' : 'background.paper',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: selectedItems.includes(item) ? 'action.hover' : 'action.hover',
                        },
                      }}
                      onClick={() => handleItemSelect(item)}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedItems.includes(item)}
                            onChange={() => handleItemSelect(item)}
                            color="primary"
                          />
                        }
                        label={item}
                        sx={{ width: '100%', m: 0 }}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={handleBack}>
                  Atrás
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={selectedItems.length === 0}
                >
                  Continuar
                </Button>
              </Box>
            </>
          )}
        </Box>
      ),
    },
    {
      label: 'Elige el método de entrega',
      description: 'Decide cómo quieres entregar los artículos para reciclaje.',
      content: (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            ¿Cómo prefieres entregar tus artículos?
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                  border: selectedMethod === 'dropoff' ? `2px solid ${theme.palette.primary.main}` : 'none',
                }}
                onClick={() => handleMethodSelect('dropoff')}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Store color="primary" sx={{ fontSize: 40, mr: 2 }} />
                    <Typography variant="h6">
                      Entrega en centro de reciclaje
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" paragraph>
                    Lleva tus artículos a uno de nuestros centros de reciclaje asociados.
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    • Proceso más rápido
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Sin costo de envío
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Recibe tu recompensa al momento
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLocations(true);
                      setSelectedMethod('dropoff');
                    }}
                  >
                    Ver centros cercanos
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                  border: selectedMethod === 'mail' ? `2px solid ${theme.palette.primary.main}` : 'none',
                }}
                onClick={() => handleMethodSelect('mail')}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocalShipping color="primary" sx={{ fontSize: 40, mr: 2 }} />
                    <Typography variant="h6">
                      Envío por correo
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" paragraph>
                    Envía tus artículos utilizando nuestra etiqueta de envío prepagada.
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    • Cómodo, sin salir de casa
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Etiqueta de envío gratuita
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Recibirás tu recompensa una vez procesado
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMethodSelect('mail');
                    }}
                  >
                    Seleccionar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
          
          {/* Locations dialog */}
          <Dialog
            open={showLocations}
            onClose={() => setShowLocations(false)}
            maxWidth="md"
            fullWidth
            fullScreen={isMobile}
          >
            <DialogTitle>
              Centros de reciclaje cercanos
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={2}>
                {recyclingLocations.map((location) => (
                  <Grid item xs={12} sm={6} md={4} key={location.id}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="120"
                        image={location.imageUrl}
                        alt={location.name}
                      />
                      
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {location.name}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                          <LocationOn color="action" sx={{ mt: 0.3, mr: 1 }} />
                          <Typography variant="body2">
                            {location.address}, {location.city}, {location.state} {location.zipCode}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" gutterBottom>
                          <strong>Horario:</strong> {location.hours}
                        </Typography>
                        
                        <Typography variant="subtitle2" gutterBottom>
                          Artículos aceptados:
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {location.acceptedItems.slice(0, 3).map((item, index) => (
                            <Chip key={index} label={item} size="small" />
                          ))}
                          {location.acceptedItems.length > 3 && (
                            <Chip label={`+${location.acceptedItems.length - 3} más`} size="small" />
                          )}
                        </Box>
                      </CardContent>
                      
                      <CardActions>
                        <Button 
                          size="small" 
                          color="primary"
                          onClick={() => handleLocationSelect(location.id)}
                        >
                          Seleccionar
                        </Button>
                        <Button 
                          size="small"
                          startIcon={<LocationOn />}
                          onClick={() => window.open(`https://maps.google.com/?q=${location.address},${location.city},${location.state}`, '_blank')}
                        >
                          Ver en mapa
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setShowLocations(false)}>
                Cancelar
              </Button>
            </DialogActions>
          </Dialog>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleBack}>
              Atrás
            </Button>
          </Box>
        </Box>
      ),
    },
    {
      label: 'Confirma los detalles',
      description: 'Revisa y confirma los detalles de tu solicitud de reciclaje.',
      content: (
        <Box>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resumen de tu solicitud
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Programa seleccionado:
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {getSelectedProgram()?.name}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Artículos a reciclar:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedItems.map((item, index) => (
                    <Chip key={index} label={item} size="small" />
                  ))}
                </Box>
                
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Método de entrega:
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {selectedMethod === 'dropoff' ? 'Entrega en centro de reciclaje' : 'Envío por correo'}
                </Typography>
                
                {selectedMethod === 'dropoff' && getSelectedLocation() && (
                  <>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Centro seleccionado:
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {getSelectedLocation()?.name}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {getSelectedLocation()?.address}, {getSelectedLocation()?.city}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Horario: {getSelectedLocation()?.hours}
                    </Typography>
                  </>
                )}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Recompensa estimada:
                </Typography>
                
                {getSelectedProgram() && (
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      icon={getSelectedProgram()?.rewardType === 'credit' ? <Redeem /> : 
                            getSelectedProgram()?.rewardType === 'discount' ? <LocalShipping /> : 
                            <VolunteerActivism />}
                      label={getRewardText(getSelectedProgram()!)}
                      color="primary"
                    />
                  </Box>
                )}
                
                {getSelectedProgram()?.rewardType !== 'donation' && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={donateReward}
                        onChange={(e) => setDonateReward(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Donar mi recompensa a programas de reforestación"
                  />
                )}
                
                {selectedMethod === 'mail' && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Opciones de envío:
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<QrCode />}
                        onClick={() => {}}
                      >
                        Generar QR
                      </Button>
                      
                      <Button
                        variant="outlined"
                        startIcon={<Print />}
                        onClick={() => {}}
                      >
                        Imprimir etiqueta
                      </Button>
                    </Box>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Al continuar, aceptas los términos y condiciones del programa de reciclaje.
          </Alert>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleBack}>
              Atrás
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
            >
              Confirmar
            </Button>
          </Box>
        </Box>
      ),
    },
  ];
  
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Programas de Reciclaje y Retoma
      </Typography>
      
      <Typography variant="body1" paragraph>
        Recicla tus productos usados, contribuye al medio ambiente y obtén recompensas.
      </Typography>
      
      <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 4 }}>
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>
              <Typography variant="subtitle1">{step.label}</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                {step.description}
              </Typography>
              {step.content}
            </StepContent>
          </Step>
        ))}
      </Stepper>
      
      {/* Success dialog */}
      <Dialog
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
          
          <Typography variant="h5" gutterBottom>
            ¡Solicitud completada con éxito!
          </Typography>
          
          <Typography variant="body1" paragraph>
            Gracias por contribuir al cuidado del medio ambiente.
          </Typography>
          
          {selectedMethod === 'dropoff' ? (
            <Typography variant="body2" paragraph>
              Lleva tus artículos al centro de reciclaje seleccionado y muestra el código QR que te hemos enviado por correo electrónico.
            </Typography>
          ) : (
            <Typography variant="body2" paragraph>
              Hemos enviado las instrucciones de envío y la etiqueta a tu correo electrónico. Empaca tus artículos y envíalos utilizando la etiqueta proporcionada.
            </Typography>
          )}
          
          <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
            {getSelectedProgram()?.rewardType === 'credit' ? 
              `Recibirás $${getSelectedProgram()?.rewardValue} en crédito una vez procesados tus artículos.` :
             getSelectedProgram()?.rewardType === 'discount' ?
              `Recibirás un cupón con ${getSelectedProgram()?.rewardValue}% de descuento para tu próxima compra.` :
              `Tu contribución ayudará a plantar árboles y conservar áreas naturales.`}
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button onClick={() => setShowSuccess(false)}>
            Cerrar
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleReset}
          >
            Iniciar nuevo reciclaje
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecyclingProgram;