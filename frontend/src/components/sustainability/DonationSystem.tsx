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
  Slider,
  TextField,
  FormControlLabel,
  Checkbox,
  Divider,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Avatar,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Favorite,
  VolunteerActivism,
  ForestOutlined,
  ChildCare,
  Pets,
  LocalHospital,
  School,
  Public,
  CheckCircle,
  Share,
  Receipt,
} from '@mui/icons-material';

// Types for donation causes
interface DonationCause {
  id: string;
  name: string;
  description: string;
  category: 'environment' | 'social' | 'education' | 'health' | 'animals';
  goal: number;
  raised: number;
  imageUrl: string;
  icon: React.ReactNode;
  organization: string;
  organizationLogo: string;
  impact: string[];
}

// Props interface
interface DonationSystemProps {
  cartTotal?: number;
  onAddDonation?: (amount: number, causeId: string) => void;
  standalone?: boolean;
}

/**
 * Component for donation system
 */
const DonationSystem: React.FC<DonationSystemProps> = ({
  cartTotal = 0,
  onAddDonation,
  standalone = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [donationAmount, setDonationAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedCause, setSelectedCause] = useState<string>('');
  const [roundUp, setRoundUp] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [detailCause, setDetailCause] = useState<DonationCause | null>(null);
  
  // Sample donation causes
  const donationCauses: DonationCause[] = [
    {
      id: 'dc1',
      name: 'Reforestación de Bosques',
      description: 'Ayuda a plantar árboles y restaurar ecosistemas forestales en áreas degradadas.',
      category: 'environment',
      goal: 100000,
      raised: 67500,
      imageUrl: '/images/donations/forest.jpg',
      icon: <ForestOutlined />,
      organization: 'EcoVerde',
      organizationLogo: '/images/organizations/ecoverde.png',
      impact: [
        'Cada $10 permite plantar 5 árboles',
        'Restauración de hábitats para especies en peligro',
        'Captura de CO₂ y mitigación del cambio climático',
        'Protección de cuencas hidrográficas'
      ],
    },
    {
      id: 'dc2',
      name: 'Apoyo a Comunidades Vulnerables',
      description: 'Proporciona alimentos, educación y atención médica a comunidades en situación de vulnerabilidad.',
      category: 'social',
      goal: 75000,
      raised: 42000,
      imageUrl: '/images/donations/community.jpg',
      icon: <ChildCare />,
      organization: 'Fundación Ayuda',
      organizationLogo: '/images/organizations/fundacion.png',
      impact: [
        'Cada $20 proporciona alimentos a una familia por una semana',
        'Acceso a educación para niños en comunidades marginadas',
        'Atención médica básica para personas sin recursos',
        'Desarrollo de proyectos comunitarios sostenibles'
      ],
    },
    {
      id: 'dc3',
      name: 'Protección de Fauna Silvestre',
      description: 'Contribuye a la conservación y rescate de especies amenazadas y sus hábitats naturales.',
      category: 'animals',
      goal: 50000,
      raised: 28500,
      imageUrl: '/images/donations/wildlife.jpg',
      icon: <Pets />,
      organization: 'Vida Silvestre',
      organizationLogo: '/images/organizations/wildlife.png',
      impact: [
        'Cada $30 ayuda a rescatar y rehabilitar un animal silvestre',
        'Conservación de hábitats naturales',
        'Programas de reproducción de especies en peligro',
        'Educación ambiental y concientización'
      ],
    },
    {
      id: 'dc4',
      name: 'Becas Educativas',
      description: 'Apoya a estudiantes de bajos recursos para que puedan continuar con su educación.',
      category: 'education',
      goal: 80000,
      raised: 35000,
      imageUrl: '/images/donations/education.jpg',
      icon: <School />,
      organization: 'Educación para Todos',
      organizationLogo: '/images/organizations/education.png',
      impact: [
        'Cada $50 cubre materiales escolares para un estudiante por un semestre',
        'Becas para educación primaria, secundaria y universitaria',
        'Programas de mentoría y desarrollo de habilidades',
        'Mejora de infraestructura escolar en zonas marginadas'
      ],
    },
  ];
  
  // Handle donation amount change
  const handleDonationChange = (_event: Event, newValue: number | number[]) => {
    setDonationAmount(newValue as number);
    setCustomAmount('');
  };
  
  // Handle custom amount change
  const handleCustomAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    // Only allow numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
      if (value) {
        setDonationAmount(parseFloat(value));
      }
    }
  };
  
  // Handle cause selection
  const handleCauseSelect = (causeId: string) => {
    setSelectedCause(causeId);
  };
  
  // Handle round up toggle
  const handleRoundUpToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoundUp(event.target.checked);
  };
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle add donation
  const handleAddDonation = () => {
    if (selectedCause && onAddDonation) {
      const amount = roundUp ? getRoundUpAmount() : donationAmount;
      onAddDonation(amount, selectedCause);
    }
    
    // Show success dialog
    setShowSuccess(true);
  };
  
  // Open cause details
  const handleOpenDetails = (cause: DonationCause) => {
    setDetailCause(cause);
    setShowDetails(true);
  };
  
  // Close cause details
  const handleCloseDetails = () => {
    setShowDetails(false);
  };
  
  // Get selected cause
  const getSelectedCause = () => {
    return donationCauses.find(cause => cause.id === selectedCause);
  };
  
  // Get round up amount
  const getRoundUpAmount = () => {
    if (!cartTotal) return 0;
    
    const nextRound = Math.ceil(cartTotal / 10) * 10;
    return nextRound - cartTotal;
  };
  
  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'environment':
        return <ForestOutlined />;
      case 'social':
        return <VolunteerActivism />;
      case 'education':
        return <School />;
      case 'health':
        return <LocalHospital />;
      case 'animals':
        return <Pets />;
      default:
        return <Public />;
    }
  };
  
  // Get category label
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'environment':
        return 'Medio Ambiente';
      case 'social':
        return 'Causas Sociales';
      case 'education':
        return 'Educación';
      case 'health':
        return 'Salud';
      case 'animals':
        return 'Protección Animal';
      default:
        return category;
    }
  };
  
  // Calculate progress percentage
  const calculateProgress = (raised: number, goal: number) => {
    return Math.min(Math.round((raised / goal) * 100), 100);
  };
  
  // Render standalone version (for sustainability page)
  if (standalone) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Programa de Donaciones
        </Typography>
        
        <Typography variant="body1" paragraph>
          Apoya causas sociales y ambientales con tus donaciones. Juntos podemos hacer la diferencia.
        </Typography>
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3 }}
        >
          <Tab label="Todas" />
          <Tab label="Medio Ambiente" />
          <Tab label="Causas Sociales" />
          <Tab label="Educación" />
          <Tab label="Protección Animal" />
        </Tabs>
        
        <Grid container spacing={3}>
          {donationCauses
            .filter(cause => 
              tabValue === 0 || 
              (tabValue === 1 && cause.category === 'environment') ||
              (tabValue === 2 && cause.category === 'social') ||
              (tabValue === 3 && cause.category === 'education') ||
              (tabValue === 4 && cause.category === 'animals')
            )
            .map((cause) => (
              <Grid item xs={12} sm={6} md={3} key={cause.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={cause.imageUrl}
                    alt={cause.name}
                    sx={{ position: 'relative' }}
                  />
                  
                  <Box sx={{ position: 'relative', mt: -3, mx: 2 }}>
                    <Chip
                      icon={getCategoryIcon(cause.category)}
                      label={getCategoryLabel(cause.category)}
                      color="primary"
                      sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                      }}
                    />
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {cause.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {cause.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar
                        src={cause.organizationLogo}
                        alt={cause.organization}
                        sx={{ width: 24, height: 24, mr: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {cause.organization}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Recaudado: ${cause.raised.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Meta: ${cause.goal.toLocaleString()}
                        </Typography>
                      </Box>
                      
                      <LinearProgress 
                        variant="determinate" 
                        value={calculateProgress(cause.raised, cause.goal)} 
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
                        {calculateProgress(cause.raised, cause.goal)}% completado
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                      size="small" 
                      onClick={() => handleOpenDetails(cause)}
                    >
                      Más información
                    </Button>
                    
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="primary"
                      startIcon={<Favorite />}
                      onClick={() => {
                        setSelectedCause(cause.id);
                        setShowSuccess(true);
                      }}
                    >
                      Donar
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
        </Grid>
        
        {/* Cause details dialog */}
        <Dialog
          open={showDetails}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          {detailCause && (
            <>
              <DialogTitle>
                {detailCause.name}
              </DialogTitle>
              
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box 
                      component="img"
                      src={detailCause.imageUrl}
                      alt={detailCause.name}
                      sx={{ 
                        width: '100%', 
                        borderRadius: 1,
                        mb: 2,
                      }}
                    />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        src={detailCause.organizationLogo}
                        alt={detailCause.organization}
                        sx={{ width: 40, height: 40, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="subtitle1">
                          {detailCause.organization}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Organización verificada
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body1" paragraph>
                      {detailCause.description}
                    </Typography>
                    
                    <Chip
                      icon={getCategoryIcon(detailCause.category)}
                      label={getCategoryLabel(detailCause.category)}
                      color="primary"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Progreso de la campaña
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Recaudado: ${detailCause.raised.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Meta: ${detailCause.goal.toLocaleString()}
                        </Typography>
                      </Box>
                      
                      <LinearProgress 
                        variant="determinate" 
                        value={calculateProgress(detailCause.raised, detailCause.goal)} 
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                      
                      <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', fontWeight: 'bold' }}>
                        {calculateProgress(detailCause.raised, detailCause.goal)}% completado
                      </Typography>
                    </Paper>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Impacto de tu donación
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      {detailCause.impact.map((impact, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckCircle color="success" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {impact}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Haz una donación
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Grid container spacing={1}>
                        {[10, 20, 50, 100].map((amount) => (
                          <Grid item xs={3} key={amount}>
                            <Button
                              variant={donationAmount === amount ? 'contained' : 'outlined'}
                              color="primary"
                              fullWidth
                              onClick={() => {
                                setDonationAmount(amount);
                                setCustomAmount('');
                              }}
                            >
                              ${amount}
                            </Button>
                          </Grid>
                        ))}
                      </Grid>
                      
                      <TextField
                        label="Otra cantidad"
                        variant="outlined"
                        fullWidth
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        margin="normal"
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                        }}
                      />
                    </Box>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      startIcon={<Favorite />}
                      onClick={() => {
                        setSelectedCause(detailCause.id);
                        setShowSuccess(true);
                      }}
                      sx={{ mb: 2 }}
                    >
                      Donar ${customAmount || donationAmount}
                    </Button>
                  </Grid>
                </Grid>
              </DialogContent>
              
              <DialogActions>
                <Button onClick={handleCloseDetails}>
                  Cerrar
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
              ¡Gracias por tu donación!
            </Typography>
            
            <Typography variant="body1" paragraph>
              Tu contribución ayudará a hacer una diferencia real.
            </Typography>
            
            <Typography variant="body2" paragraph>
              Hemos enviado un recibo de tu donación a tu correo electrónico.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={() => {}}
              >
                Compartir
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Receipt />}
                onClick={() => {}}
              >
                Ver recibo
              </Button>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ pb: 3, px: 3 }}>
            <Button onClick={() => setShowSuccess(false)}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
  
  // Render checkout version (for cart/checkout)
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <VolunteerActivism color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Dona a una buena causa
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Redondea tu compra o agrega una donación para apoyar causas sociales y ambientales.
        </Typography>
        
        {cartTotal > 0 && (
          <FormControlLabel
            control={
              <Checkbox
                checked={roundUp}
                onChange={handleRoundUpToggle}
                color="primary"
              />
            }
            label={`Redondear mi compra (+ $${getRoundUpAmount().toFixed(2)})`}
            sx={{ mb: 2 }}
          />
        )}
        
        {!roundUp && (
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>
              Cantidad a donar: ${donationAmount}
            </Typography>
            
            <Slider
              value={donationAmount}
              onChange={handleDonationChange}
              min={5}
              max={100}
              step={5}
              marks={[
                { value: 5, label: '$5' },
                { value: 25, label: '$25' },
                { value: 50, label: '$50' },
                { value: 100, label: '$100' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `$${value}`}
            />
            
            <TextField
              label="Otra cantidad"
              variant="outlined"
              fullWidth
              value={customAmount}
              onChange={handleCustomAmountChange}
              margin="normal"
              size="small"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Box>
        )}
        
        <Typography variant="subtitle2" gutterBottom>
          Selecciona una causa para apoyar:
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {donationCauses.map((cause) => (
            <Grid item xs={12} sm={6} key={cause.id}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: selectedCause === cause.id ? 'primary.main' : 'divider',
                  bgcolor: selectedCause === cause.id ? 'action.hover' : 'background.paper',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: selectedCause === cause.id ? 'action.hover' : 'action.hover',
                  },
                }}
                onClick={() => handleCauseSelect(cause.id)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                    {cause.icon}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2">
                      {cause.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {cause.description.substring(0, 60)}...
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={calculateProgress(cause.raised, cause.goal)} 
                    sx={{ height: 4, borderRadius: 2 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
                    {calculateProgress(cause.raised, cause.goal)}% completado
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
        <Button
          variant="contained"
          color="primary"
          disabled={!selectedCause || (donationAmount <= 0 && !roundUp)}
          onClick={handleAddDonation}
          startIcon={<Favorite />}
        >
          Agregar donación
        </Button>
      </CardActions>
      
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
            ¡Gracias por tu donación!
          </Typography>
          
          <Typography variant="body1" paragraph>
            Tu contribución de ${roundUp ? getRoundUpAmount().toFixed(2) : donationAmount.toFixed(2)} ayudará a hacer una diferencia real.
          </Typography>
          
          {getSelectedCause() && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                {getSelectedCause()?.icon}
              </Avatar>
              <Typography variant="subtitle1">
                {getSelectedCause()?.name}
              </Typography>
            </Box>
          )}
          
          <Typography variant="body2" color="text.secondary">
            Recibirás un recibo de tu donación junto con la confirmación de tu pedido.
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowSuccess(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default DonationSystem;