import React from 'react';
import { Box, Skeleton, Container } from '@mui/material';

interface LoadingFallbackProps {
  type?: 'card' | 'detail' | 'list' | 'form';
  height?: number | string;
  width?: number | string;
}

/**
 * Generic loading fallback component for dynamically loaded components
 */
const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  type = 'card',
  height,
  width,
}) => {
  // Default dimensions based on type
  const getDefaultDimensions = () => {
    switch (type) {
      case 'card':
        return { height: 200, width: '100%' };
      case 'detail':
        return { height: 400, width: '100%' };
      case 'list':
        return { height: 300, width: '100%' };
      case 'form':
        return { height: 250, width: '100%' };
      default:
        return { height: 200, width: '100%' };
    }
  };

  const { height: defaultHeight, width: defaultWidth } = getDefaultDimensions();
  const finalHeight = height || defaultHeight;
  const finalWidth = width || defaultWidth;

  // Render different loading skeletons based on type
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <Box sx={{ width: finalWidth }}>
            <Skeleton variant="rectangular" height={finalHeight} width={finalWidth} animation="wave" />
            <Box sx={{ pt: 1 }}>
              <Skeleton width="80%" height={20} animation="wave" />
              <Skeleton width="60%" height={20} animation="wave" />
            </Box>
          </Box>
        );
      
      case 'detail':
        return (
          <Box sx={{ width: finalWidth }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Skeleton variant="rectangular" height={300} width="100%" animation="wave" />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="70%" height={30} animation="wave" />
                <Skeleton width="40%" height={25} animation="wave" />
                <Box sx={{ my: 2 }}>
                  <Skeleton width="100%" height={20} animation="wave" />
                  <Skeleton width="100%" height={20} animation="wave" />
                  <Skeleton width="80%" height={20} animation="wave" />
                </Box>
                <Skeleton width="30%" height={40} animation="wave" />
              </Box>
            </Box>
          </Box>
        );
      
      case 'list':
        return (
          <Box sx={{ width: finalWidth }}>
            {[1, 2, 3, 4].map((item) => (
              <Box key={item} sx={{ display: 'flex', mb: 2, gap: 2 }}>
                <Skeleton variant="rectangular" width={80} height={80} animation="wave" />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="70%" height={20} animation="wave" />
                  <Skeleton width="40%" height={20} animation="wave" />
                </Box>
              </Box>
            ))}
          </Box>
        );
      
      case 'form':
        return (
          <Box sx={{ width: finalWidth }}>
            <Skeleton width="60%" height={30} animation="wave" sx={{ mb: 2 }} />
            <Skeleton width="100%" height={50} animation="wave" sx={{ mb: 2 }} />
            <Skeleton width="100%" height={50} animation="wave" sx={{ mb: 2 }} />
            <Skeleton width="100%" height={50} animation="wave" sx={{ mb: 2 }} />
            <Skeleton width="40%" height={40} animation="wave" />
          </Box>
        );
      
      default:
        return (
          <Skeleton variant="rectangular" height={finalHeight} width={finalWidth} animation="wave" />
        );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {renderSkeleton()}
    </Container>
  );
};

export default LoadingFallback;