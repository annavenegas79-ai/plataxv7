import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Slider,
  Divider,
  Chip,
  LinearProgress,
  Grid,
  Paper,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  NaturePeople,
  LocalFlorist,
  Eco,
  ForestOutlined,
  Opacity,
  Co2,
  VolunteerActivism,
} from '@mui/icons-material';

// Types for carbon offset projects
interface CarbonProject {
  id: string;
  name: string;
  description: string;
  location: string;
  type: 'reforestation' | 'renewable_energy' | 'conservation' | 'waste_management';
  pricePerKg: number;
  totalOffset: number;
  offsetProgress: number;
  imageUrl: string;
  icon: React.ReactNode;
}

// Props interface
interface CarbonOffsetProgramProps {
  cartTotal?: number;
  estimatedEmissions?: number;
  onAddOffset?: (amount: number, projectId: string) => void;
  standalone?: boolean;
}

/**
 * Component for carbon offset program integration
 */
const CarbonOffsetProgram: React.FC<CarbonOffsetProgramProps> = ({
  cartTotal = 0,
  estimatedEmissions = 0,
  onAddOffset,
  standalone = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [offsetAmount, setOffsetAmount] = useState<number>(estimatedEmissions);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [detailProject, setDetailProject] = useState<CarbonProject | null>(null);
  
  // Sample carbon offset projects
  const carbonProjects: CarbonProject[] = [
    {
      id: 'p1',
      name: 'Reforestación Amazónica',
      description: 'Proyecto de reforestación en la selva amazónica que ayuda a restaurar ecosistemas degradados y apoya a comunidades locales.',
      location: 'Brasil',
      type: 'reforestation',
      pricePerKg: 0.05,
      totalOffset: 5000000,
      offsetProgress: 65,
      imageUrl: '/images/projects/amazon.jpg',
      icon: <ForestOutlined />,
    },
    {
      id: 'p2',
      name: 'Energía Solar Comunitaria',
      description: 'Instalación de paneles solares en comunidades rurales para reemplazar generadores diésel y proporcionar energía limpia.',
      location: 'México',
      type: 'renewable_energy',
      pricePerKg: 0.04,
      totalOffset: 3000000,
      offsetProgress: 78,
      imageUrl: '/images/projects/solar.jpg',
      icon: <Eco />,
    },
    {
      id: 'p3',
      name: 'Conservación de Manglares',
      description: 'Protección de ecosistemas de manglares que son sumideros naturales de carbono y hábitats críticos para la biodiversidad.',
      location: 'Colombia',
      type: 'conservation',
      pricePerKg: 0.06,
      totalOffset: 2000000,
      offsetProgress: 42,
      imageUrl: '/images/projects/mangrove.jpg',
      icon: <Opacity />,
    },
  ];
  
  // Handle slider change
  const handleOffsetChange = (_event: Event, newValue: number | number[]) => {
    setOffsetAmount(newValue as number);
  };
  
  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
  };
  
  // Handle adding offset to cart
  const handleAddOffset = () => {
    if (selectedProject && onAddOffset) {
      onAddOffset(offsetAmount, selectedProject);
    }
  };
  
  // Open project details
  const handleOpenDetails = (project: CarbonProject) => {
    setDetailProject(project);
    setShowDetails(true);
  };
  
  // Close project details
  const handleCloseDetails = () => {
    setShowDetails(false);
  };
  
  // Get selected project
  const getSelectedProject = () => {
    return carbonProjects.find(project => project.id === selectedProject);
  };
  
  // Calculate offset cost
  const calculateOffsetCost = () => {
    const project = getSelectedProject();
    if (!project) return 0;
    return offsetAmount * project.pricePerKg;
  };
  
  // Get project icon by type
  const getProjectIcon = (type: string) => {
    switch (type) {
      case 'reforestation':
        return <ForestOutlined />;
      case 'renewable_energy':
        return <Eco />;
      case 'conservation':
        return <NaturePeople />;
      case 'waste_management':
        return <LocalFlorist />;
      default:
        return <Eco />;
    }
  };
  
  // Render standalone version (for sustainability page)
  if (standalone) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Programa de Compensación de Carbono
        </Typography>
        
        <Typography variant="body1" paragraph>
          Compensa la huella de carbono de tus compras apoyando proyectos certificados de reducción de emisiones.
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {carbonProjects.map((project) => (
            <Grid item xs={12} md={4} key={project.id}>
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
                    backgroundImage: `url(${project.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <Chip
                    icon={getProjectIcon(project.type)}
                    label={project.type === 'reforestation' ? 'Reforestación' : 
                           project.type === 'renewable_energy' ? 'Energía Renovable' :
                           project.type === 'conservation' ? 'Conservación' : 'Gestión de Residuos'}
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
                    {project.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {project.description.substring(0, 120)}...
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Progreso de compensación
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={project.offsetProgress} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {project.offsetProgress}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Co2 color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {(project.totalOffset / 1000).toLocaleString()} toneladas compensadas
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => handleOpenDetails(project)}
                  >
                    Ver detalles
                  </Button>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={() => window.open('#', '_blank')}
                  >
                    Apoyar proyecto
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Project details dialog */}
        <Dialog
          open={showDetails}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          {detailProject && (
            <>
              <DialogTitle>
                {detailProject.name}
              </DialogTitle>
              
              <DialogContent>
                <Box 
                  sx={{ 
                    height: 240, 
                    borderRadius: 1,
                    mb: 2,
                    bgcolor: 'grey.200',
                    backgroundImage: `url(${detailProject.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                
                <Typography variant="body1" paragraph>
                  {detailProject.description}
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Detalles del Proyecto
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Eco sx={{ mr: 1, color: 'success.main' }} />
                        <Typography variant="body2">
                          Tipo: {detailProject.type === 'reforestation' ? 'Reforestación' : 
                                 detailProject.type === 'renewable_energy' ? 'Energía Renovable' :
                                 detailProject.type === 'conservation' ? 'Conservación' : 'Gestión de Residuos'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <NaturePeople sx={{ mr: 1, color: 'info.main' }} />
                        <Typography variant="body2">
                          Ubicación: {detailProject.location}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Co2 sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2">
                          Precio por kg CO₂: ${detailProject.pricePerKg.toFixed(2)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Impacto
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progreso de compensación
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={detailProject.offsetProgress} 
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">
                              {detailProject.offsetProgress}%
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ForestOutlined sx={{ mr: 1, color: 'success.main' }} />
                        <Typography variant="body2">
                          {(detailProject.totalOffset / 1000).toLocaleString()} toneladas de CO₂ compensadas
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <VolunteerActivism sx={{ mr: 1, color: 'secondary.main' }} />
                        <Typography variant="body2">
                          Beneficia a más de 500 familias locales
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </DialogContent>
              
              <DialogActions>
                <Button onClick={handleCloseDetails}>
                  Cerrar
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => window.open('#', '_blank')}
                >
                  Apoyar este proyecto
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
          <Co2 color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Compensa tu huella de carbono
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Tu pedido genera aproximadamente <strong>{estimatedEmissions} kg</strong> de emisiones de CO₂. 
          Puedes compensar este impacto apoyando proyectos certificados de reducción de emisiones.
        </Typography>
        
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography id="offset-slider" gutterBottom>
            Cantidad a compensar: <strong>{offsetAmount} kg</strong> de CO₂
          </Typography>
          <Slider
            value={offsetAmount}
            onChange={handleOffsetChange}
            aria-labelledby="offset-slider"
            min={0}
            max={Math.max(estimatedEmissions * 2, 10)}
            step={1}
            marks={[
              { value: 0, label: '0' },
              { value: estimatedEmissions, label: `${estimatedEmissions}` },
              { value: estimatedEmissions * 2, label: `${estimatedEmissions * 2}` },
            ]}
            valueLabelDisplay="auto"
          />
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>
          Selecciona un proyecto para apoyar:
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {carbonProjects.map((project) => (
            <Grid item xs={12} sm={4} key={project.id}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: selectedProject === project.id ? 'primary.main' : 'divider',
                  bgcolor: selectedProject === project.id ? 'primary.light' : 'background.paper',
                  color: selectedProject === project.id ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: selectedProject === project.id ? 'primary.light' : 'action.hover',
                  },
                }}
                onClick={() => handleProjectSelect(project.id)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                    {project.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">
                      {project.name}
                    </Typography>
                    <Typography variant="caption" color={selectedProject === project.id ? 'inherit' : 'text.secondary'}>
                      ${project.pricePerKg.toFixed(2)} por kg de CO₂
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Box>
          {selectedProject && offsetAmount > 0 && (
            <Typography variant="body2">
              Costo total: <strong>${calculateOffsetCost().toFixed(2)}</strong>
            </Typography>
          )}
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          disabled={!selectedProject || offsetAmount <= 0}
          onClick={handleAddOffset}
        >
          Añadir compensación
        </Button>
      </CardActions>
    </Card>
  );
};

export default CarbonOffsetProgram;