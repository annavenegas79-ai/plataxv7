import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CardActions,
  Button,
  Chip,
  Rating,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Slider,
  Badge,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search,
  FilterList,
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  Visibility,
  Sort,
  LocalOffer,
  Refresh,
  Verified,
  Star,
  StarBorder,
  ThumbUp,
  LocationOn,
  AccessTime,
} from '@mui/icons-material';

// Types for second-hand products
interface SecondHandProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  condition: 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable';
  age: number; // in months
  imageUrl: string;
  sellerName: string;
  sellerRating: number;
  sellerVerified: boolean;
  location: string;
  category: string;
  listedDate: Date;
  isFavorite?: boolean;
}

// Props interface
interface SecondHandMarketplaceProps {
  onProductClick?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  onAddToFavorites?: (productId: string, isFavorite: boolean) => void;
}

/**
 * Component for second-hand marketplace
 */
const SecondHandMarketplace: React.FC<SecondHandMarketplaceProps> = ({
  onProductClick,
  onAddToCart,
  onAddToFavorites,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tabValue, setTabValue] = useState<number>(0);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);
  const [conditionFilter, setConditionFilter] = useState<string[]>([]);
  
  // Sample second-hand products
  const secondHandProducts: SecondHandProduct[] = [
    {
      id: 'sh1',
      name: 'iPhone 12 Pro - 128GB',
      price: 8999,
      originalPrice: 14999,
      condition: 'very_good',
      age: 12,
      imageUrl: '/images/products/iphone.jpg',
      sellerName: 'Carlos M.',
      sellerRating: 4.8,
      sellerVerified: true,
      location: 'Ciudad de México',
      category: 'Electrónicos',
      listedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      id: 'sh2',
      name: 'MacBook Air M1 - 2020',
      price: 15999,
      originalPrice: 23999,
      condition: 'like_new',
      age: 6,
      imageUrl: '/images/products/macbook.jpg',
      sellerName: 'Ana L.',
      sellerRating: 5.0,
      sellerVerified: true,
      location: 'Guadalajara',
      category: 'Computadoras',
      listedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      id: 'sh3',
      name: 'Cámara Sony Alpha A7 III',
      price: 24999,
      originalPrice: 34999,
      condition: 'good',
      age: 18,
      imageUrl: '/images/products/camera.jpg',
      sellerName: 'Roberto S.',
      sellerRating: 4.5,
      sellerVerified: false,
      location: 'Monterrey',
      category: 'Fotografía',
      listedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    {
      id: 'sh4',
      name: 'Nintendo Switch con 2 juegos',
      price: 5999,
      originalPrice: 7999,
      condition: 'good',
      age: 24,
      imageUrl: '/images/products/switch.jpg',
      sellerName: 'María F.',
      sellerRating: 4.7,
      sellerVerified: true,
      location: 'Puebla',
      category: 'Videojuegos',
      listedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      id: 'sh5',
      name: 'iPad Pro 11" 2021',
      price: 12999,
      originalPrice: 18999,
      condition: 'like_new',
      age: 8,
      imageUrl: '/images/products/ipad.jpg',
      sellerName: 'Javier R.',
      sellerRating: 4.9,
      sellerVerified: true,
      location: 'Ciudad de México',
      category: 'Tablets',
      listedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      id: 'sh6',
      name: 'Bicicleta de montaña Trek',
      price: 7999,
      originalPrice: 12999,
      condition: 'good',
      age: 36,
      imageUrl: '/images/products/bike.jpg',
      sellerName: 'Laura P.',
      sellerRating: 4.6,
      sellerVerified: false,
      location: 'Querétaro',
      category: 'Deportes',
      listedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
  ];
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle filter menu open
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  // Handle filter menu close
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  
  // Handle sort menu open
  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };
  
  // Handle sort menu close
  const handleSortClose = () => {
    setSortAnchorEl(null);
  };
  
  // Handle category change
  const handleCategoryChange = (event: any) => {
    setSelectedCategory(event.target.value);
  };
  
  // Handle price range change
  const handlePriceRangeChange = (_event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };
  
  // Handle condition filter change
  const handleConditionChange = (condition: string) => {
    if (conditionFilter.includes(condition)) {
      setConditionFilter(conditionFilter.filter(c => c !== condition));
    } else {
      setConditionFilter([...conditionFilter, condition]);
    }
  };
  
  // Handle product click
  const handleProductClick = (productId: string) => {
    if (onProductClick) {
      onProductClick(productId);
    }
  };
  
  // Handle add to cart
  const handleAddToCart = (event: React.MouseEvent, productId: string) => {
    event.stopPropagation();
    if (onAddToCart) {
      onAddToCart(productId);
    }
  };
  
  // Handle add to favorites
  const handleAddToFavorites = (event: React.MouseEvent, productId: string, isFavorite: boolean) => {
    event.stopPropagation();
    if (onAddToFavorites) {
      onAddToFavorites(productId, !isFavorite);
    }
  };
  
  // Filter products based on search, category, price, and condition
  const filteredProducts = secondHandProducts.filter(product => {
    // Search filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (selectedCategory !== 'all' && product.category !== selectedCategory) {
      return false;
    }
    
    // Price filter
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    
    // Condition filter
    if (conditionFilter.length > 0 && !conditionFilter.includes(product.condition)) {
      return false;
    }
    
    return true;
  });
  
  // Get condition label
  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'Nuevo';
      case 'like_new':
        return 'Como nuevo';
      case 'very_good':
        return 'Muy bueno';
      case 'good':
        return 'Bueno';
      case 'acceptable':
        return 'Aceptable';
      default:
        return condition;
    }
  };
  
  // Get condition color
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'success';
      case 'like_new':
        return 'success';
      case 'very_good':
        return 'primary';
      case 'good':
        return 'info';
      case 'acceptable':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
    }
  };
  
  // Calculate savings percentage
  const calculateSavings = (price: number, originalPrice: number) => {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Marketplace de Segunda Mano
      </Typography>
      
      <Typography variant="body1" paragraph>
        Compra y vende productos usados en buen estado. Una forma sostenible de darle una segunda vida a los productos.
      </Typography>
      
      {/* Search and filter bar */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={8}>
            <TextField
              fullWidth
              placeholder="Buscar productos de segunda mano..."
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={handleFilterClick}
            >
              Filtrar
            </Button>
            
            {/* Filter menu */}
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
              PaperProps={{
                sx: { width: 300, maxWidth: '100%', p: 2 },
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Filtros
              </Typography>
              
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Categoría
              </Typography>
              
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="category-select-label">Categoría</InputLabel>
                <Select
                  labelId="category-select-label"
                  value={selectedCategory}
                  label="Categoría"
                  onChange={handleCategoryChange}
                >
                  <MenuItem value="all">Todas las categorías</MenuItem>
                  <MenuItem value="Electrónicos">Electrónicos</MenuItem>
                  <MenuItem value="Computadoras">Computadoras</MenuItem>
                  <MenuItem value="Tablets">Tablets</MenuItem>
                  <MenuItem value="Fotografía">Fotografía</MenuItem>
                  <MenuItem value="Videojuegos">Videojuegos</MenuItem>
                  <MenuItem value="Deportes">Deportes</MenuItem>
                </Select>
              </FormControl>
              
              <Typography variant="subtitle2" gutterBottom>
                Precio
              </Typography>
              
              <Box sx={{ px: 1, mb: 2 }}>
                <Slider
                  value={priceRange}
                  onChange={handlePriceRangeChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={30000}
                  step={1000}
                  marks={[
                    { value: 0, label: '$0' },
                    { value: 15000, label: '$15,000' },
                    { value: 30000, label: '$30,000' },
                  ]}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption">
                    ${priceRange[0].toLocaleString()}
                  </Typography>
                  <Typography variant="caption">
                    ${priceRange[1].toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>
                Condición
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                {['new', 'like_new', 'very_good', 'good', 'acceptable'].map((condition) => (
                  <Chip
                    key={condition}
                    label={getConditionLabel(condition)}
                    color={conditionFilter.includes(condition) ? getConditionColor(condition) as any : 'default'}
                    variant={conditionFilter.includes(condition) ? 'filled' : 'outlined'}
                    onClick={() => handleConditionChange(condition)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  startIcon={<Refresh />}
                  onClick={() => {
                    setSelectedCategory('all');
                    setPriceRange([0, 30000]);
                    setConditionFilter([]);
                  }}
                >
                  Restablecer
                </Button>
                
                <Button
                  variant="contained"
                  onClick={handleFilterClose}
                >
                  Aplicar
                </Button>
              </Box>
            </Menu>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Sort />}
              onClick={handleSortClick}
            >
              Ordenar
            </Button>
            
            {/* Sort menu */}
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleSortClose}
            >
              <MenuItem onClick={handleSortClose}>Más recientes</MenuItem>
              <MenuItem onClick={handleSortClose}>Precio: menor a mayor</MenuItem>
              <MenuItem onClick={handleSortClose}>Precio: mayor a menor</MenuItem>
              <MenuItem onClick={handleSortClose}>Mayor descuento</MenuItem>
              <MenuItem onClick={handleSortClose}>Mejor calificación</MenuItem>
            </Menu>
          </Grid>
        </Grid>
      </Box>
      
      {/* Category tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        <Tab label="Todos" />
        <Tab label="Electrónicos" />
        <Tab label="Computadoras" />
        <Tab label="Fotografía" />
        <Tab label="Videojuegos" />
        <Tab label="Deportes" />
        <Tab label="Hogar" />
      </Tabs>
      
      {/* Product grid */}
      <Grid container spacing={3}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                {/* Favorite button */}
                <IconButton
                  size="small"
                  onClick={(e) => handleAddToFavorites(e, product.id, !!product.isFavorite)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                    zIndex: 1,
                  }}
                >
                  {product.isFavorite ? (
                    <Favorite color="error" fontSize="small" />
                  ) : (
                    <FavoriteBorder fontSize="small" />
                  )}
                </IconButton>
                
                {/* Savings badge */}
                <Chip
                  label={`-${calculateSavings(product.price, product.originalPrice)}%`}
                  color="error"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 1,
                  }}
                />
                
                <CardActionArea 
                  onClick={() => handleProductClick(product.id)}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={product.imageUrl}
                    alt={product.name}
                    sx={{ objectFit: 'contain', p: 1 }}
                  />
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" noWrap>
                      {product.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1 }}>
                      <Typography variant="h6" component="span" fontWeight="bold">
                        ${product.price.toLocaleString()}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        component="span" 
                        sx={{ textDecoration: 'line-through', ml: 1, color: 'text.secondary' }}
                      >
                        ${product.originalPrice.toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      <Chip 
                        label={getConditionLabel(product.condition)} 
                        size="small" 
                        color={getConditionColor(product.condition) as any}
                        variant="outlined"
                      />
                      
                      <Chip 
                        label={`${product.age} ${product.age === 1 ? 'mes' : 'meses'} de uso`} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                    
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                        {product.sellerName.charAt(0)}
                      </Avatar>
                      
                      <Typography variant="body2" sx={{ mr: 0.5 }}>
                        {product.sellerName}
                      </Typography>
                      
                      {product.sellerVerified && (
                        <Tooltip title="Vendedor verificado">
                          <Verified color="primary" fontSize="small" />
                        </Tooltip>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Rating
                        value={product.sellerRating}
                        precision={0.5}
                        size="small"
                        readOnly
                        sx={{ mr: 1 }}
                      />
                      
                      <Typography variant="caption" color="text.secondary">
                        ({product.sellerRating})
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">
                          {product.location}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTime fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(product.listedDate)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
                
                <Divider />
                
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleProductClick(product.id)}
                  >
                    Ver detalles
                  </Button>
                  
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<ShoppingCart />}
                    onClick={(e) => handleAddToCart(e, product.id)}
                  >
                    Comprar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                No se encontraron productos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Intenta con otros filtros o términos de búsqueda
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                sx={{ mt: 2 }}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setPriceRange([0, 30000]);
                  setConditionFilter([]);
                }}
              >
                Restablecer filtros
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
      
      {/* Sell your products CTA */}
      <Box
        sx={{
          mt: 6,
          p: 3,
          borderRadius: 2,
          bgcolor: 'primary.light',
          color: 'primary.contrastText',
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" gutterBottom>
          ¿Tienes productos que ya no usas?
        </Typography>
        
        <Typography variant="body1" paragraph>
          Véndelos en nuestro marketplace de segunda mano y contribuye a la economía circular.
        </Typography>
        
        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={() => {}}
        >
          Vender mis productos
        </Button>
      </Box>
    </Box>
  );
};

export default SecondHandMarketplace;