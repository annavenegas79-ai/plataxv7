import { useEffect } from 'react';
import { NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { Container, Box, Typography } from '@mui/material';

import Layout from '../components/Layout';
import { usePreload } from '../context/PreloadContext';
import {
  DynamicFeaturedProducts,
  DynamicPromotionBanner,
  DynamicCategoryShowcase,
  preloadComponents
} from '../components/DynamicComponents';

const HomePage: NextPage = () => {
  const { preloadPage } = usePreload();
  
  // Preload critical pages and components
  useEffect(() => {
    // Preload popular category pages
    preloadPage('/category/electronics');
    preloadPage('/category/home');
    preloadPage('/category/fashion');
    
    // Preload components that will likely be needed soon
    preloadComponents.ProductCard();
    preloadComponents.CategoryCard();
    preloadComponents.Carousel();
    
    // Preload search page assets after a delay
    const timer = setTimeout(() => {
      preloadPage('/search');
      preloadComponents.SearchResults();
      preloadComponents.FilterPanel();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [preloadPage]);
  
  return (
    <>
      <NextSeo
        title="Inicio"
        description="Compra y vende productos en PlataMX. Encuentra las mejores ofertas en electrónica, moda, hogar y más. Envíos a todo México."
      />
      
      <Layout>
        <Box component="main">
          {/* Hero Banner */}
          <DynamicPromotionBanner />
          
          {/* Featured Categories */}
          <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Categorías destacadas
            </Typography>
            <DynamicCategoryShowcase />
          </Container>
          
          {/* Featured Products */}
          <Container maxWidth="lg" sx={{ mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Productos destacados
            </Typography>
            <DynamicFeaturedProducts />
          </Container>
          
          {/* Promotions */}
          <Container maxWidth="lg" sx={{ mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Ofertas especiales
            </Typography>
            <DynamicPromotionBanner />
          </Container>
        </Box>
      </Layout>
    </>
  );
};

// Use getStaticProps for SSR
export async function getStaticProps() {
  // Fetch data for initial render
  // This would typically come from your API
  
  return {
    props: {
      // Initial data would go here
    },
    // Revalidate every hour
    revalidate: 3600,
  };
}

export default HomePage;