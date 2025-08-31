import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Skeleton,
  Chip,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  TrendingUp,
  LocalOffer,
  Visibility,
  ShoppingCart,
  ThumbUp,
} from '@mui/icons-material';

// Types for recommendations
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  category: string;
  tags: string[];
  isNew?: boolean;
  isFavorite?: boolean;
}

interface RecommendationEngineProps {
  userId?: string;
  currentProductId?: string;
  currentCategoryId?: string;
  recentlyViewedIds?: string[];
  limit?: number;
  title?: string;
  showReason?: boolean;
  onProductClick?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
  onAddToFavorites?: (productId: string, isFavorite: boolean) => void;
}

/**
 * AI-powered recommendation engine component
 */
const RecommendationEngine: React.FC<RecommendationEngineProps> = ({
  userId,
  currentProductId,
  currentCategoryId,
  recentlyViewedIds = [],
  limit = 4,
  title = 'Recomendaciones para ti',
  showReason = true,
  onProductClick,
  onAddToCart,
  onAddToFavorites,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [recommendationReason, setRecommendationReason] = useState<string>('');
  
  // Fetch recommendations based on props
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      
      try {
        // In a real implementation, this would be an API call to your recommendation service
        // For this example, we'll simulate a delay and return mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Determine recommendation type based on available context
        let reason = '';
        let mockProducts: Product[] = [];
        
        if (currentProductId) {
          // Product detail page - show similar products
          reason = 'Basado en el producto que estás viendo';
          mockProducts = getMockSimilarProducts(currentProductId);
        } else if (currentCategoryId) {
          // Category page - show popular in category
          reason = 'Productos populares en esta categoría';
          mockProducts = getMockPopularInCategory(currentCategoryId);
        } else if (recentlyViewedIds.length > 0) {
          // Based on recently viewed
          reason = 'Basado en productos que has visto recientemente';
          mockProducts = getMockBasedOnRecentlyViewed(recentlyViewedIds);
        } else if (userId) {
          // Personalized for user
          reason = 'Recomendaciones personalizadas para ti';
          mockProducts = getMockPersonalizedRecommendations(userId);
        } else {
          // Default trending products
          reason = 'Productos populares en PlataMX';
          mockProducts = getMockTrendingProducts();
        }
        
        // Limit the number of recommendations
        const limitedProducts = mockProducts.slice(0, limit);
        
        setRecommendations(limitedProducts);
        setRecommendationReason(reason);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Fallback to trending products on error
        setRecommendations(getMockTrendingProducts().slice(0, limit));
        setRecommendationReason('Productos que podrían interesarte');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [userId, currentProductId, currentCategoryId, recentlyViewedIds, limit]);
  
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
  
  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(limit).fill(0).map((_, index) => (
      <Grid item xs={6} sm={4} md={3} key={`skeleton-${index}`}>
        <Card>
          <Skeleton variant="rectangular" height={140} />
          <CardContent>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </CardContent>
        </Card>
      </Grid>
    ));
  };
  
  // Render product cards
  const renderProductCards = () => {
    return recommendations.map((product) => (
      <Grid item xs={6} sm={4} md={3} key={product.id}>
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
          
          {/* New badge */}
          {product.isNew && (
            <Chip
              label="Nuevo"
              color="primary"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                zIndex: 1,
              }}
            />
          )}
          
          <CardActionArea 
            onClick={() => handleProductClick(product.id)}
            sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
          >
            <CardMedia
              component="img"
              height="140"
              image={product.imageUrl}
              alt={product.name}
              sx={{ objectFit: 'contain', p: 1 }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" noWrap>
                {product.name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1 }}>
                <Typography variant="h6" component="span" fontWeight="bold">
                  ${product.price.toFixed(2)}
                </Typography>
                
                {product.originalPrice && (
                  <Typography 
                    variant="body2" 
                    component="span" 
                    sx={{ textDecoration: 'line-through', ml: 1, color: 'text.secondary' }}
                  >
                    ${product.originalPrice.toFixed(2)}
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {Array(5).fill(0).map((_, i) => (
                    <Box
                      key={i}
                      component="span"
                      sx={{
                        color: i < Math.round(product.rating) ? 'warning.main' : 'action.disabled',
                        fontSize: '1rem',
                      }}
                    >
                      ★
                    </Box>
                  ))}
                </Box>
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  ({product.reviewCount})
                </Typography>
              </Box>
              
              <Box sx={{ mt: 1 }}>
                <Chip 
                  label={product.category} 
                  size="small" 
                  variant="outlined"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
                {product.tags.slice(0, 1).map(tag => (
                  <Chip 
                    key={tag} 
                    label={tag} 
                    size="small" 
                    variant="outlined"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            </CardContent>
          </CardActionArea>
          
          <Divider />
          
          <Box sx={{ p: 1 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="small"
              startIcon={<ShoppingCart />}
              onClick={(e) => handleAddToCart(e, product.id)}
            >
              Agregar
            </Button>
          </Box>
        </Card>
      </Grid>
    ));
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          {title}
        </Typography>
        
        {showReason && !loading && (
          <Chip
            icon={<ThumbUp />}
            label={recommendationReason}
            variant="outlined"
            color="primary"
            size="small"
          />
        )}
      </Box>
      
      <Grid container spacing={2}>
        {loading ? renderSkeletons() : renderProductCards()}
      </Grid>
    </Box>
  );
};

// Mock data functions
const getMockTrendingProducts = (): Product[] => [
  {
    id: 'p1',
    name: 'Smartphone Galaxy S21',
    price: 14999,
    originalPrice: 16999,
    imageUrl: '/images/products/smartphone.jpg',
    rating: 4.5,
    reviewCount: 128,
    category: 'Electrónicos',
    tags: ['Smartphone', 'Samsung'],
    isNew: true,
  },
  {
    id: 'p2',
    name: 'Laptop Lenovo ThinkPad X1',
    price: 24999,
    imageUrl: '/images/products/laptop.jpg',
    rating: 4.8,
    reviewCount: 56,
    category: 'Computadoras',
    tags: ['Laptop', 'Lenovo'],
  },
  {
    id: 'p3',
    name: 'Audífonos Sony WH-1000XM4',
    price: 6999,
    originalPrice: 7999,
    imageUrl: '/images/products/headphones.jpg',
    rating: 4.9,
    reviewCount: 203,
    category: 'Audio',
    tags: ['Audífonos', 'Sony'],
  },
  {
    id: 'p4',
    name: 'Smartwatch Apple Watch Series 7',
    price: 8999,
    imageUrl: '/images/products/smartwatch.jpg',
    rating: 4.7,
    reviewCount: 89,
    category: 'Wearables',
    tags: ['Smartwatch', 'Apple'],
    isNew: true,
  },
  {
    id: 'p5',
    name: 'Cámara Sony Alpha A7 III',
    price: 34999,
    imageUrl: '/images/products/camera.jpg',
    rating: 4.8,
    reviewCount: 42,
    category: 'Fotografía',
    tags: ['Cámara', 'Sony'],
  },
  {
    id: 'p6',
    name: 'Consola PlayStation 5',
    price: 12999,
    originalPrice: 13999,
    imageUrl: '/images/products/ps5.jpg',
    rating: 4.9,
    reviewCount: 312,
    category: 'Videojuegos',
    tags: ['Consola', 'Sony'],
  },
];

const getMockSimilarProducts = (productId: string): Product[] => {
  // In a real implementation, this would fetch products similar to the current product
  return getMockTrendingProducts().map(product => ({
    ...product,
    id: `similar-${product.id}`,
  }));
};

const getMockPopularInCategory = (categoryId: string): Product[] => {
  // In a real implementation, this would fetch popular products in the current category
  return getMockTrendingProducts().map(product => ({
    ...product,
    id: `category-${product.id}`,
  }));
};

const getMockBasedOnRecentlyViewed = (recentlyViewedIds: string[]): Product[] => {
  // In a real implementation, this would fetch recommendations based on recently viewed products
  return getMockTrendingProducts().map(product => ({
    ...product,
    id: `recent-${product.id}`,
  }));
};

const getMockPersonalizedRecommendations = (userId: string): Product[] => {
  // In a real implementation, this would fetch personalized recommendations for the user
  return getMockTrendingProducts().map(product => ({
    ...product,
    id: `user-${product.id}`,
    isFavorite: Math.random() > 0.7, // Randomly mark some as favorites
  }));
};

export default RecommendationEngine;