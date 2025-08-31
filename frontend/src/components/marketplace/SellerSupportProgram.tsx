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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Store,
  School,
  MonetizationOn,
  Handshake,
  People,
  LocationOn,
  CheckCircle,
  ArrowForward,
  Business,
  Language,
  LocalShipping,
  Payments,
  AccountBalance,
  Laptop,
  Translate,
  EmojiPeople,
  Diversity3,
  Visibility,
  CameraAlt,
} from '@mui/icons-material';

// Types for seller support program
interface SupportBenefit {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface SupportProgram {
  id: string;
  name: string;
  description: string;
  eligibility: string[];
  benefits: SupportBenefit[];
  imageUrl: string;
}

// Props interface
interface SellerSupportProgramProps {
  onApply?: (programId: string, formData: any) => void;
}

/**
 * Component for seller support program for vulnerable communities
 */
const SellerSupportProgram: React.FC<SellerSupportProgramProps> = ({
  onApply,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    location: '',
    community: '',
    description: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    agreeTerms: false,
  });
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showProgramDetails, setShowProgramDetails] = useState<boolean>(false);
  const [detailProgram, setDetailProgram] = useState<SupportProgram | null>(null);
  
  // Sample support programs
  const supportPrograms: SupportProgram[] = [
    {
      id: 'indigenous',
      name: 'Programa para Comunidades Indígenas',
      description: 'Apoyo a emprendedores y artesanos de comunidades indígenas para comercializar sus productos tradicionales.',
      eligibility: [
        'Pertenecer a una comunidad indígena reconocida',
        'Producir artesanías o productos tradicionales',
        'Tener un negocio establecido o en proceso de formalización',
        'Compromiso de mantener técnicas tradicionales y sostenibles',
      ],
      benefits: [
        {
          id: 'b1',
          title: 'Comisiones reducidas',
          description: 'Comisiones de venta reducidas al 5% durante los primeros 12 meses.',
          icon: <MonetizationOn />,
        },
        {
          id: 'b2',
          title: 'Capacitación especializada',
          description: 'Acceso a cursos de fotografía de productos, descripción y marketing digital adaptados culturalmente.',
          icon: <School />,
        },
        {
          id: 'b3',
          title: 'Logística subsidiada',
          description: 'Subsidio del 50% en costos de envío para los primeros 100 pedidos.',
          icon: <LocalShipping />,
        },
        {
          id: 'b4',
          title: 'Traducción de contenido',
          description: 'Servicio gratuito de traducción de descripciones de productos a múltiples idiomas.',
          icon: <Translate />,
        },
      ],
      imageUrl: '/images/programs/indigenous.jpg',
    },
    {
      id: 'rural',
      name: 'Programa para Zonas Rurales',
      description: 'Apoyo a emprendedores de zonas rurales con acceso limitado a mercados y tecnología.',
      eligibility: [
        'Residir en una zona rural con población menor a 5,000 habitantes',
        'Tener un negocio establecido o en proceso de formalización',
        'Demostrar dificultades de acceso a mercados tradicionales',
        'Compromiso de reinversión en la comunidad local',
      ],
      benefits: [
        {
          id: 'b1',
          title: 'Acceso a internet',
          description: 'Subsidio para conexión a internet durante 12 meses para gestionar tu tienda en línea.',
          icon: <Laptop />,
        },
        {
          id: 'b2',
          title: 'Capacitación digital',
          description: 'Programa completo de alfabetización digital y gestión de negocios en línea.',
          icon: <School />,
        },
        {
          id: 'b3',
          title: 'Fotografía de productos',
          description: 'Servicio gratuito de fotografía profesional para tus primeros 50 productos.',
          icon: <CameraAlt />,
        },
        {
          id: 'b4',
          title: 'Gestión logística',
          description: 'Apoyo en la coordinación de recogida de productos en zonas de difícil acceso.',
          icon: <LocalShipping />,
        },
      ],
      imageUrl: '/images/programs/rural.jpg',
    },
    {
      id: 'women',
      name: 'Programa para Mujeres Emprendedoras',
      description: 'Apoyo a mujeres emprendedoras en situación de vulnerabilidad económica o social.',
      eligibility: [
        'Negocio liderado por mujeres (mínimo 51% de propiedad)',
        'Demostrar situación de vulnerabilidad económica o social',
        'Tener un negocio establecido o en proceso de formalización',
        'Compromiso de participar en programas de mentoría',
      ],
      benefits: [
        {
          id: 'b1',
          title: 'Financiamiento inicial',
          description: 'Acceso a microcréditos sin intereses para inversión en inventario y equipamiento.',
          icon: <AccountBalance />,
        },
        {
          id: 'b2',
          title: 'Mentoría personalizada',
          description: 'Programa de mentoría con empresarias exitosas durante 6 meses.',
          icon: <People />,
        },
        {
          id: 'b3',
          title: 'Visibilidad destacada',
          description: 'Promoción destacada en secciones especiales de la plataforma.',
          icon: <Visibility />,
        },
        {
          id: 'b4',
          title: 'Procesamiento de pagos',
          description: 'Tarifas reducidas en procesamiento de pagos durante 12 meses.',
          icon: <Payments />,
        },
      ],
      imageUrl: '/images/programs/women.jpg',
    },
    {
      id: 'disability',
      name: 'Programa para Emprendedores con Discapacidad',
      description: 'Apoyo a emprendedores con discapacidad para superar barreras en el comercio electrónico.',
      eligibility: [
        'Emprendedor con discapacidad o negocio que emplee principalmente a personas con discapacidad',
        'Tener un negocio establecido o en proceso de formalización',
        'Demostrar barreras específicas para el comercio electrónico relacionadas con la discapacidad',
        'Compromiso de participar en iniciativas de inclusión',
      ],
      benefits: [
        {
          id: 'b1',
          title: 'Tecnología adaptativa',
          description: 'Subsidio para adquisición de tecnología adaptativa según necesidades específicas.',
          icon: <Laptop />,
        },
        {
          id: 'b2',
          title: 'Asistencia personalizada',
          description: 'Asistente virtual dedicado para la gestión de tu tienda en línea.',
          icon: <EmojiPeople />,
        },
        {
          id: 'b3',
          title: 'Logística accesible',
          description: 'Servicio de recogida a domicilio de productos sin costo adicional.',
          icon: <LocalShipping />,
        },
        {
          id: 'b4',
          title: 'Capacitación especializada',
          description: 'Cursos adaptados a diferentes tipos de discapacidad para gestión de negocios en línea.',
          icon: <School />,
        },
      ],
      imageUrl: '/images/programs/disability.jpg',
    },
  ];
  
  // Handle program selection
  const handleProgramSelect = (programId: string) => {
    setSelectedProgram(programId);
    
    // Move to next step
    handleNext();
  };
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value, checked } = e.target as HTMLInputElement;
    
    setFormData({
      ...formData,
      [name as string]: name === 'agreeTerms' ? checked : value,
    });
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
    setFormData({
      businessName: '',
      businessType: '',
      location: '',
      community: '',
      description: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      agreeTerms: false,
    });
    setShowSuccess(false);
  };
  
  // Handle submit
  const handleSubmit = () => {
    if (onApply) {
      onApply(selectedProgram, formData);
    }
    
    // Show success dialog
    setShowSuccess(true);
  };
  
  // Open program details
  const handleOpenDetails = (program: SupportProgram) => {
    setDetailProgram(program);
    setShowProgramDetails(true);
  };
  
  // Close program details
  const handleCloseDetails = () => {
    setShowProgramDetails(false);
  };
  
  // Get selected program
  const getSelectedProgram = () => {
    return supportPrograms.find(program => program.id === selectedProgram);
  };
  
  // Steps for the application process
  const steps = [
    {
      label: 'Selecciona un programa',
      description: 'Elige el programa de apoyo que mejor se adapte a tus necesidades.',
      content: (
        <Grid container spacing={3}>
          {supportPrograms.map((program) => (
            <Grid item xs={12} md={6} key={program.id}>
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
                  
                  <Box sx={{ mt: 'auto' }}>
                    <Button 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetails(program);
                      }}
                    >
                      Ver detalles
                    </Button>
                    
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
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ),
    },
    {
      label: 'Completa tu información',
      description: 'Proporciona información sobre tu negocio y comunidad.',
      content: (
        <Box>
          {getSelectedProgram() && (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                Estás aplicando al programa: <strong>{getSelectedProgram()?.name}</strong>
              </Alert>
              
              <Typography variant="subtitle1" gutterBottom>
                Información del negocio
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nombre del negocio"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Tipo de negocio</InputLabel>
                    <Select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      label="Tipo de negocio"
                    >
                      <MenuItem value="artesania">Artesanía</MenuItem>
                      <MenuItem value="alimentos">Alimentos y bebidas</MenuItem>
                      <MenuItem value="textil">Textil y moda</MenuItem>
                      <MenuItem value="agricultura">Productos agrícolas</MenuItem>
                      <MenuItem value="servicios">Servicios</MenuItem>
                      <MenuItem value="otro">Otro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ubicación"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    placeholder="Ciudad, Estado, País"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Comunidad o grupo vulnerable"
                    name="community"
                    value={formData.community}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    placeholder="Ej. Comunidad indígena, zona rural, etc."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Descripción del negocio"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    rows={4}
                    required
                    placeholder="Describe tu negocio, productos y cómo beneficia a tu comunidad"
                  />
                </Grid>
              </Grid>
              
              <Typography variant="subtitle1" gutterBottom>
                Información de contacto
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nombre completo"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Correo electrónico"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    type="email"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Teléfono"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>
              
              <FormControlLabel
                control={
                  <Checkbox
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    color="primary"
                  />
                }
                label="Acepto los términos y condiciones del programa y confirmo que la información proporcionada es verídica."
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                <Button onClick={handleBack}>
                  Atrás
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={
                    !formData.businessName ||
                    !formData.businessType ||
                    !formData.location ||
                    !formData.community ||
                    !formData.description ||
                    !formData.contactName ||
                    !formData.contactEmail ||
                    !formData.contactPhone ||
                    !formData.agreeTerms
                  }
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
      label: 'Revisa y confirma',
      description: 'Revisa tu solicitud antes de enviarla.',
      content: (
        <Box>
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
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
                  Información del negocio:
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Nombre:</strong> {formData.businessName}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Tipo:</strong> {formData.businessType}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Ubicación:</strong> {formData.location}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Comunidad:</strong> {formData.community}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Información de contacto:
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Nombre:</strong> {formData.contactName}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Correo:</strong> {formData.contactEmail}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Teléfono:</strong> {formData.contactPhone}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Descripción del negocio:
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {formData.description}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Una vez enviada tu solicitud, nuestro equipo la revisará y te contactará en un plazo máximo de 5 días hábiles para continuar con el proceso.
          </Alert>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleBack}>
              Atrás
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
            >
              Enviar solicitud
            </Button>
          </Box>
        </Box>
      ),
    },
  ];
  
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Programa de Apoyo a Vendedores
      </Typography>
      
      <Typography variant="body1" paragraph>
        Nuestro programa de apoyo a vendedores está diseñado para ayudar a emprendedores de comunidades vulnerables a acceder al comercio electrónico y expandir sus negocios.
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Diversity3 color="primary" sx={{ fontSize: 40, mr: 2 }} />
        <Typography variant="h5">
          Inclusión y oportunidades para todos
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
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
      </Paper>
      
      {/* Program details dialog */}
      <Dialog
        open={showProgramDetails}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        {detailProgram && (
          <>
            <DialogTitle>
              {detailProgram.name}
            </DialogTitle>
            
            <DialogContent>
              <Box 
                component="img"
                src={detailProgram.imageUrl}
                alt={detailProgram.name}
                sx={{ 
                  width: '100%', 
                  height: 200, 
                  objectFit: 'cover',
                  borderRadius: 1,
                  mb: 3,
                }}
              />
              
              <Typography variant="body1" paragraph>
                {detailProgram.description}
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Requisitos de elegibilidad
              </Typography>
              
              <List>
                {detailProgram.eligibility.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Beneficios del programa
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {detailProgram.benefits.map((benefit) => (
                  <Grid item xs={12} sm={6} key={benefit.id}>
                    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Box sx={{ mr: 2, color: 'primary.main' }}>
                          {benefit.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            {benefit.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {benefit.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ mt: 4, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Proceso de aplicación
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Paso 1
                      </Typography>
                      <Typography variant="body2">
                        Completar solicitud
                      </Typography>
                      <ArrowForward sx={{ display: { xs: 'none', sm: 'block' }, mx: 'auto', my: 1, color: 'action.disabled' }} />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Paso 2
                      </Typography>
                      <Typography variant="body2">
                        Revisión y entrevista
                      </Typography>
                      <ArrowForward sx={{ display: { xs: 'none', sm: 'block' }, mx: 'auto', my: 1, color: 'action.disabled' }} />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Paso 3
                      </Typography>
                      <Typography variant="body2">
                        Capacitación inicial
                      </Typography>
                      <ArrowForward sx={{ display: { xs: 'none', sm: 'block' }, mx: 'auto', my: 1, color: 'action.disabled' }} />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Paso 4
                      </Typography>
                      <Typography variant="body2">
                        Lanzamiento de tienda
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={handleCloseDetails}>
                Cerrar
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  handleCloseDetails();
                  handleProgramSelect(detailProgram.id);
                }}
              >
                Aplicar a este programa
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
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
            ¡Solicitud enviada con éxito!
          </Typography>
          
          <Typography variant="body1" paragraph>
            Gracias por tu interés en nuestro programa de apoyo a vendedores.
          </Typography>
          
          <Typography variant="body2" paragraph>
            Hemos recibido tu solicitud y nuestro equipo la revisará en los próximos 5 días hábiles. Te contactaremos a través del correo electrónico proporcionado para informarte sobre los siguientes pasos.
          </Typography>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Número de referencia:
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              APP-{Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}
            </Typography>
          </Box>
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
            Iniciar nueva solicitud
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellerSupportProgram;