import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { useInView } from 'react-intersection-observer';
import { Box, Skeleton, styled } from '@mui/material';
import { usePreload } from '../context/PreloadContext';

interface LazyImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string;
  alt: string;
  lowQualitySrc?: string;
  aspectRatio?: number;
  preloadHighQuality?: boolean;
  blur?: boolean;
  containerClassName?: string;
}

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: theme.palette.grey[100],
}));

const BlurredImage = styled(Image)(({ theme }) => ({
  filter: 'blur(20px)',
  transform: 'scale(1.1)',
  transition: 'opacity 0.2s ease-in-out',
}));

const MainImage = styled(Image)(({ theme }) => ({
  transition: 'opacity 0.3s ease-in-out',
}));

/**
 * Enhanced Image component with lazy loading, blur-up effect, and preloading
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  lowQualitySrc,
  aspectRatio = 1,
  preloadHighQuality = false,
  blur = true,
  containerClassName,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLowQualityLoaded, setIsLowQualityLoaded] = useState(false);
  const { preloadImage } = usePreload();
  
  // Set up intersection observer
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
  });
  
  // Preload high-quality image when low-quality is loaded
  useEffect(() => {
    if (isLowQualityLoaded && preloadHighQuality) {
      preloadImage(src);
    }
  }, [isLowQualityLoaded, preloadImage, preloadHighQuality, src]);
  
  // Calculate padding based on aspect ratio
  const paddingTop = `${(1 / aspectRatio) * 100}%`;
  
  return (
    <ImageContainer
      ref={ref}
      className={containerClassName}
      sx={{ paddingTop }}
    >
      {inView ? (
        <>
          {/* Low quality placeholder image */}
          {blur && lowQualitySrc && !isLoaded && (
            <BlurredImage
              src={lowQualitySrc}
              alt={alt}
              fill
              style={{ objectFit: 'cover' }}
              onLoad={() => setIsLowQualityLoaded(true)}
              priority={false}
              quality={10}
              sizes={props.sizes || '100vw'}
            />
          )}
          
          {/* Main high-quality image */}
          <MainImage
            src={src}
            alt={alt}
            fill
            style={{
              objectFit: 'cover',
              opacity: isLoaded ? 1 : 0,
            }}
            onLoad={() => setIsLoaded(true)}
            {...props}
          />
          
          {/* Skeleton while loading */}
          {!isLoaded && (
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              animation="wave"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1,
              }}
            />
          )}
        </>
      ) : (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
        />
      )}
    </ImageContainer>
  );
};

export default LazyImage;