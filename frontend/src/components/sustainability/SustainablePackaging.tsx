import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Divider,
  Chip,
  Grid,
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Eco,
  Recycling,
  Compost,
  DeleteOutline,
  Info,
} from '@mui/icons-material';

// Types for packaging options
interface PackagingOption {
  id: string;
  name: string;
  description: string;
  type: 'biodegradable' | 'recycled' | 'minimal' | 'standard';
  additionalCost: number;
  co2Reduction: number;
  imageUrl: string;
  icon: React.ReactNode;
}

// Props interface
interface SustainablePackagingProps {
  onSelectPackaging?: (optionId: string) => void;
  defaultOption?: string;
  standalone?: boolean;
}

/**
 * Component for sustainable packaging options
 */
const SustainablePackaging: React.FC<SustainablePackagingProps> = ({
  onSelectPackaging,
  defaultOption = 'standard',
  standalone = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [selectedOption, setSelectedOption] = useState<string>(defaultOption);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [infoOption, setInfoOption] = useState<PackagingOption | null>(null);
  
  // Sample packaging options
  const packagingOptions: PackagingOption[] = [
    {
      id: 'biodegradable',
      name: 'Embalaje Biodegradable',
      description: 'Embalaje fabricado con materiales biodegradables que se descomponen naturalmente en menos de 6 meses.',
      type: 'biodegradable',
      additionalCost: 1.99,
      co2Reduction: 75,
      imageUrl: '/images/packaging/biodegradable.jpg',
      icon: <Compost />,
    },
    {
      id: 'recycled',
      name: 'Embalaje Reciclado',
      description: 'Embalaje fabricado con materiales 100% reciclados y totalmente reciclables.',
      type: 'recycled',
      additionalCost: 0.99,
      co2Reduction: 60,
      imageUrl: '/images/packaging/recycled.jpg',
      icon: <Recycling />,
    },
    {
      id: 'minimal',
      name: 'Embalaje Mínimo',
      description: 'Opción que reduce al mínimo el material de embalaje manteniendo la protección del producto.',
      type: 'minimal',
      additionalCost: 0,
      co2Reduction: 40,
      imageUrl: '/images/packaging/minimal.jpg',
      icon: <Eco />,
    },
    {
      id: 'standard',
      name: 'Embalaje Estándar',
      description: 'Embalaje convencional que garantiza la protección del producto durante el envío.',
      type: 'standard',
      additionalCost: 0,
      co2Reduction: 0,
      imageUrl: '/images/packaging/standard.jpg',
      icon: <DeleteOutline />,
    },
  ];
  
  // Handle option change
  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedOption(value);
    
    if (onSelectPackaging) {
      onSelectPackaging(value);
    }
  };
  
  // Open info dialog
  const handleOpenInfo = (option: PackagingOption) => {
    setInfoOption(option);
    setShowInfo(true);
  };
  
  // Close info dialog
  const handleCloseInfo = () => {
    setShowInfo(false);
  };
  
  // Get selected option
  const getSelectedOption = () => {
    return packagingOptions.find(option => option.id === selectedOption);
  };
  
  // Get option icon by type
  const getOptionIcon = (type: string) => {
    switch (type) {
      case 'biodegradable':
        return <Compost />;
      case 'recycled':
        return <Recycling />;
      case 'minimal':
        return <Eco />;
      case 'standard':
        return <DeleteOutline />;
      default:
        return <Eco />;
    }
  };
  
  // Render standalone version (for sustainability page)
  if (standalone) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Opciones de Embalaje Sostenible
        </Typography>
        
        <Typography variant="body1" paragraph>
          Elige entre nuestras opciones de embalaje sostenible para reducir el impacto ambiental de tus compras.
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {packagingOptions.map((option) => (
            <Grid item xs={12} sm={6} md={3} key={option.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <Box 
                  sx={{ 
                    height: 140, 
                    position: 'relative',
                    bgcolor: 'grey.200',
                    backgroundImage: `url(${option.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <Chip
                    icon={getOptionIcon(option.type)}
                    label={option.type === 'biodegradable' ? 'Biodegradable' : 
                           option.type === 'recycled' ? 'Reciclado' :
                           option.type === 'minimal' ? 'Mínimo' : 'Estándar'}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    }}
                  />
                </Box>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {option.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {option.description}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    {option.additionalCost > 0 ? (
                      <Chip 
                        label={`+$${option.additionalCost.toFixed(2)}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                    ) : (
                      <Chip 
                        label="Sin costo adicional" 
                        size="small" 
                        color="success" 
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                    )}
                    
                    {option.co2Reduction > 0 && (
                      <Chip 
                        icon={<Eco />}
                        label={`-${option.co2Reduction}% CO₂`} 
                        size="small" 
                        color="success"
                        sx={{ mr: 1 }}
                      />
                    )}
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => handleOpenInfo(option)}
                  >
                    Más información
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Info dialog */}
        <Dialog
          open={showInfo}
          onClose={handleCloseInfo}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          {infoOption && (
            <>
              <DialogTitle>
                {infoOption.name}
              </DialogTitle>
              
              <DialogContent>
                <Box 
                  sx={{ 
                    height: 200, 
                    borderRadius: 1,
                    mb: 2,
                    bgcolor: 'grey.200',
                    backgroundImage: `url(${infoOption.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                
                <Typography variant="body1" paragraph>
                  {infoOption.description}
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Detalles
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Eco sx={{ mr: 1, color: 'success.main' }} />
                        <Typography variant="body2">
                          Tipo: {infoOption.type === 'biodegradable' ? 'Biodegradable' : 
                                 infoOption.type === 'recycled' ? 'Reciclado' :
                                 infoOption.type === 'minimal' ? 'Mínimo' : 'Estándar'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Info sx={{ mr: 1, color: 'info.main' }} />
                        <Typography variant="body2">
                          Costo adicional: ${infoOption.additionalCost.toFixed(2)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Impacto Ambiental
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Recycling sx={{ mr: 1, color: 'success.main' }} />
                        <Typography variant="body2">
                          Reducción de CO₂: {infoOption.co2Reduction}%
                        </Typography>
                      </Box>
                      
                      {infoOption.type === 'biodegradable' && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Compost sx={{ mr: 1, color: 'success.main' }} />
                          <Typography variant="body2">
                            Se descompone en menos de 6 meses
                          </Typography>
                        </Box>
                      )}
                      
                      {infoOption.type === 'recycled' && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Recycling sx={{ mr: 1, color: 'success.main' }} />
                          <Typography variant="body2">
                            Fabricado con materiales 100% reciclados
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </DialogContent>
              
              <DialogActions>
                <Button onClick={handleCloseInfo}>
                  Cerrar
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    );
  }
  
  // Render checkout version (for cart/checkout)
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Eco color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Opciones de Embalaje
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Elige cómo quieres recibir tu pedido. Las opciones sostenibles ayudan a reducir el impacto ambiental.
        </Typography>
        
        <FormControl component="fieldset" sx={{ width: '100%' }}>
          <RadioGroup
            aria-label="packaging-options"
            name="packaging-options"
            value={selectedOption}
            onChange={handleOptionChange}
          >
            {packagingOptions.map((option) => (
              <Paper
                key={option.id}
                variant="outlined"
                sx={{
                  mb: 1,
                  p: 1,
                  border: '1px solid',
                  borderColor: selectedOption === option.id ? 'primary.main' : 'divider',
                  bgcolor: selectedOption === option.id ? 'action.hover' : 'background.paper',
                }}
              >
                <FormControlLabel
                  value={option.id}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography variant="subtitle2" sx={{ mr: 1 }}>
                        {option.name}
                      </Typography>
                      
                      {option.additionalCost > 0 && (
                        <Chip 
                          label={`+$${option.additionalCost.toFixed(2)}`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                      )}
                      
                      {option.co2Reduction > 0 && (
                        <Chip 
                          icon={<Eco />}
                          label={`-${option.co2Reduction}% CO₂`} 
                          size="small" 
                          color="success"
                          sx={{ mr: 1 }}
                        />
                      )}
                      
                      <Tooltip title="Más información">
                        <Button 
                          size="small" 
                          onClick={(e) => {
                            e.preventDefault();
                            handleOpenInfo(option);
                          }}
                        >
                          <Info fontSize="small" />
                        </Button>
                      </Tooltip>
                    </Box>
                  }
                  sx={{ width: '100%', m: 0 }}
                />
                
                <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                  {option.description}
                </Typography>
              </Paper>
            ))}
          </RadioGroup>
        </FormControl>
      </CardContent>
      
      {/* Info dialog */}
      <Dialog
        open={showInfo}
        onClose={handleCloseInfo}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        {infoOption && (
          <>
            <DialogTitle>
              {infoOption.name}
            </DialogTitle>
            
            <DialogContent>
              <Box 
                sx={{ 
                  height: 200, 
                  borderRadius: 1,
                  mb: 2,
                  bgcolor: 'grey.200',
                  backgroundImage: `url(${infoOption.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              
              <Typography variant="body1" paragraph>
                {infoOption.description}
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Detalles
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Eco sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="body2">
                        Tipo: {infoOption.type === 'biodegradable' ? 'Biodegradable' : 
                               infoOption.type === 'recycled' ? 'Reciclado' :
                               infoOption.type === 'minimal' ? 'Mínimo' : 'Estándar'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Info sx={{ mr: 1, color: 'info.main' }} />
                      <Typography variant="body2">
                        Costo adicional: ${infoOption.additionalCost.toFixed(2)}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Impacto Ambiental
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Recycling sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="body2">
                        Reducción de CO₂: {infoOption.co2Reduction}%
                      </Typography>
                    </Box>
                    
                    {infoOption.type === 'biodegradable' && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Compost sx={{ mr: 1, color: 'success.main' }} />
                        <Typography variant="body2">
                          Se descompone en menos de 6 meses
                        </Typography>
                      </Box>
                    )}
                    
                    {infoOption.type === 'recycled' && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Recycling sx={{ mr: 1, color: 'success.main' }} />
                        <Typography variant="body2">
                          Fabricado con materiales 100% reciclados
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={handleCloseInfo}>
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Card>
  );
};

export default SustainablePackaging;