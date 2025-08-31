import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Eco,
  Recycling,
  VolunteerActivism,
  ShoppingBag,
  Diversity3,
  VerifiedUser,
  Payments,
  Accessibility,
} from '@mui/icons-material';

// Import sustainability components
import EcoFriendlyBadge from '../components/sustainability/EcoFriendlyBadge';
import CarbonOffsetProgram from '../components/sustainability/CarbonOffsetProgram';
import SustainablePackaging from '../components/sustainability/SustainablePackaging';
import SecondHandMarketplace from '../components/sustainability/SecondHandMarketplace';
import RecyclingProgram from '../components/sustainability/RecyclingProgram';
import DonationSystem from '../components/sustainability/DonationSystem';
import BlockchainTraceability from '../components/transparency/BlockchainTraceability';
import AuthenticityVerification from '../components/transparency/AuthenticityVerification';
import SellerSupportProgram from '../components/marketplace/SellerSupportProgram';
import AccessibilityPanel from '../components/accessibility/AccessibilityPanel';
import InclusivePaymentOptions from '../components/checkout/InclusivePaymentOptions';

/**
 * Sustainability page component
 */
const Sustainability: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [tabValue, setTabValue] = useState(0);
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Sostenibilidad y Responsabilidad
        </Typography>
        
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Nuestro compromiso con un comercio más sostenible, inclusivo y responsable
        </Typography>
      </Box>
      
      {/* Hero section */}
      <Paper
        sx={{
          position: 'relative',
          mb: 6,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(/images/sustainability/hero.jpg)',
          color: '#fff',
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <Box sx={{ position: 'relative', textAlign: 'center', p: 3 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Construyendo un futuro más sostenible
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            Trabajamos para minimizar nuestro impacto ambiental, promover la inclusión y fomentar prácticas comerciales responsables.
          </Typography>
          
          <Button variant="contained" color="primary" size="large">
            Conoce nuestras iniciativas
          </Button>
        </Box>
      </Paper>
      
      {/* Tabs navigation */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons="auto"
        sx={{ mb: 4 }}
      >
        <Tab icon={<Eco />} label="Sostenibilidad" />
        <Tab icon={<ShoppingBag />} label="Economía Circular" />
        <Tab icon={<Diversity3 />} label="Inclusión" />
        <Tab icon={<VerifiedUser />} label="Transparencia" />
      </Tabs>
      
      {/* Tab content */}
      <Box sx={{ mb: 6 }}>
        {/* Sustainability tab */}
        {tabValue === 0 && (
          <Box>
            <Typography variant="h4" gutterBottom>
              Comercio Sostenible
            </Typography>
            
            <Typography variant="body1" paragraph>
              Promovemos prácticas comerciales sostenibles que reducen el impacto ambiental y fomentan un consumo más responsable.
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image="/images/sustainability/eco_friendly.jpg"
                    alt="Productos eco-friendly"
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Etiquetas para productos eco-friendly
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Identificamos productos que cumplen con criterios de sostenibilidad para ayudarte a tomar decisiones de compra más conscientes.
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <EcoFriendlyBadge type="eco_friendly" />
                      <EcoFriendlyBadge type="carbon_neutral" />
                      <EcoFriendlyBadge type="recycled" />
                      <EcoFriendlyBadge type="sustainable_packaging" />
                    </Box>
                    
                    <Button variant="outlined" size="small">
                      Ver criterios de certificación
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image="/images/sustainability/carbon_offset.jpg"
                    alt="Compensación de carbono"
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Programa de compensación de carbono
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Compensa la huella de carbono de tus compras apoyando proyectos certificados de reducción de emisiones.
                    </Typography>
                    
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => setTabValue(0)}
                    >
                      Conocer el programa
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image="/images/sustainability/packaging.jpg"
                    alt="Embalaje sostenible"
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Opciones de embalaje sostenible
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Ofrecemos alternativas de embalaje biodegradable, reciclado y de mínimo impacto para reducir los residuos.
                    </Typography>
                    
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => setTabValue(0)}
                    >
                      Ver opciones
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 6 }} />
            
            {/* Carbon offset program */}
            <CarbonOffsetProgram standalone={true} />
            
            <Divider sx={{ my: 6 }} />
            
            {/* Sustainable packaging */}
            <SustainablePackaging standalone={true} />
          </Box>
        )}
        
        {/* Circular economy tab */}
        {tabValue === 1 && (
          <Box>
            <Typography variant="h4" gutterBottom>
              Economía Circular
            </Typography>
            
            <Typography variant="body1" paragraph>
              Promovemos la reutilización, el reciclaje y la extensión de la vida útil de los productos para reducir el desperdicio y el consumo de recursos.
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image="/images/sustainability/second_hand.jpg"
                    alt="Productos de segunda mano"
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Marketplace de segunda mano
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Compra y vende productos usados en buen estado. Una forma sostenible de darle una segunda vida a los productos.
                    </Typography>
                    
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => setTabValue(1)}
                    >
                      Explorar marketplace
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image="/images/sustainability/recycling.jpg"
                    alt="Programa de reciclaje"
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Programas de reciclaje y retoma
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Recicla tus productos usados, contribuye al medio ambiente y obtén recompensas.
                    </Typography>
                    
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => setTabValue(1)}
                    >
                      Participar
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image="/images/sustainability/donation.jpg"
                    alt="Sistema de donaciones"
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Sistema de donaciones
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Dona productos que ya no utilizas a organizaciones benéficas o apoya causas sociales y ambientales.
                    </Typography>
                    
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => setTabValue(1)}
                    >
                      Conocer más
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 6 }} />
            
            {/* Second-hand marketplace */}
            <SecondHandMarketplace />
            
            <Divider sx={{ my: 6 }} />
            
            {/* Recycling program */}
            <RecyclingProgram />
            
            <Divider sx={{ my: 6 }} />
            
            {/* Donation system */}
            <DonationSystem standalone={true} />
          </Box>
        )}
        
        {/* Inclusion tab */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h4" gutterBottom>
              Inclusión y Accesibilidad
            </Typography>
            
            <Typography variant="body1" paragraph>
              Trabajamos para crear una plataforma inclusiva y accesible para todos, eliminando barreras y promoviendo la diversidad.
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image="/images/sustainability/accessibility.jpg"
                    alt="Accesibilidad"
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Mejoras de accesibilidad
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Implementamos estándares WCAG 2.1 para hacer nuestra plataforma accesible para personas con discapacidades.
                    </Typography>
                    
                    <Button 
                      variant="outlined" 
                      size="small"
                      startIcon={<Accessibility />}
                      onClick={() => setTabValue(2)}
                    >
                      Opciones de accesibilidad
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image="/images/sustainability/sellers.jpg"
                    alt="Vendedores"
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Apoyo a vendedores de comunidades vulnerables
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Programas especiales para emprendedores de comunidades indígenas, rurales y grupos vulnerables.
                    </Typography>
                    
                    <Button 
                      variant="outlined" 
                      size="small"
                      startIcon={<Diversity3 />}
                      onClick={() => setTabValue(2)}
                    >
                      Conocer programas
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image="/images/sustainability/payments.jpg"
                    alt="Pagos inclusivos"
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Opciones de pago inclusivas
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Múltiples métodos de pago para adaptarnos a diferentes necesidades, incluyendo opciones sin acceso a servicios bancarios tradicionales.
                    </Typography>
                    
                    <Button 
                      variant="outlined" 
                      size="small"
                      startIcon={<Payments />}
                      onClick={() => setTabValue(2)}
                    >
                      Ver opciones
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 6 }} />
            
            {/* Seller support program */}
            <SellerSupportProgram />
            
            <Divider sx={{ my: 6 }} />
            
            {/* Inclusive payment options */}
            <Typography variant="h5" gutterBottom>
              Opciones de Pago Inclusivas
            </Typography>
            
            <Typography variant="body1" paragraph>
              Ofrecemos múltiples opciones de pago para adaptarnos a tus necesidades, incluyendo métodos que no requieren acceso a internet o servicios bancarios tradicionales.
            </Typography>
            
            <Paper sx={{ p: 3, mb: 6 }}>
              <InclusivePaymentOptions amount={1299.99} />
            </Paper>
          </Box>
        )}
        
        {/* Transparency tab */}
        {tabValue === 3 && (
          <Box>
            <Typography variant="h4" gutterBottom>
              Transparencia y Confianza
            </Typography>
            
            <Typography variant="body1" paragraph>
              Promovemos la transparencia en nuestras operaciones y en la cadena de suministro para generar confianza y permitir decisiones de compra informadas.
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image="/images/sustainability/privacy.jpg"
                    alt="Privacidad"
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Políticas de privacidad mejoradas
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Transparencia en la recolección y uso de datos, con opciones claras para el control de tu información personal.
                    </Typography>
                    
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => setTabValue(3)}
                    >
                      Ver políticas
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image="/images/sustainability/blockchain.jpg"
                    alt="Blockchain"
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Trazabilidad blockchain
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Verificación del origen y la cadena de suministro de productos mediante tecnología blockchain.
                    </Typography>
                    
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => setTabValue(3)}
                    >
                      Verificar productos
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image="/images/sustainability/authenticity.jpg"
                    alt="Autenticidad"
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Verificación de autenticidad
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Sistemas avanzados para verificar la autenticidad de los productos y combatir la falsificación.
                    </Typography>
                    
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => setTabValue(3)}
                    >
                      Verificar autenticidad
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 6 }} />
            
            {/* Blockchain traceability */}
            <BlockchainTraceability standalone={true} />
            
            <Divider sx={{ my: 6 }} />
            
            {/* Authenticity verification */}
            <AuthenticityVerification standalone={true} />
          </Box>
        )}
      </Box>
      
      {/* Impact metrics */}
      <Paper sx={{ p: 4, mb: 6, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <Typography variant="h5" gutterBottom align="center">
          Nuestro impacto hasta ahora
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" component="div">
                15K+
              </Typography>
              <Typography variant="body2">
                Toneladas de CO₂ compensadas
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" component="div">
                250K+
              </Typography>
              <Typography variant="body2">
                Productos reciclados
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" component="div">
                500+
              </Typography>
              <Typography variant="body2">
                Vendedores de comunidades vulnerables
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" component="div">
                $1.2M
              </Typography>
              <Typography variant="body2">
                Donados a causas sociales y ambientales
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Call to action */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Únete a nuestro compromiso con la sostenibilidad
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ maxWidth: 700, mx: 'auto' }}>
          Cada pequeña acción cuenta. Juntos podemos construir un futuro más sostenible, inclusivo y responsable.
        </Typography>
        
        <Button variant="contained" color="primary" size="large">
          Conoce cómo participar
        </Button>
      </Box>
    </Container>
  );
};

export default Sustainability;