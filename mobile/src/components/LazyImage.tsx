import React, { useState } from 'react';
import { 
  Image, 
  ImageProps, 
  View, 
  ActivityIndicator, 
  StyleSheet,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing
} from 'react-native-reanimated';

import { colors } from '../theme/colors';

interface LazyImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string } | number;
  thumbnailSource?: { uri: string } | number;
  placeholderColor?: string;
  showLoader?: boolean;
  blurRadius?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({
  source,
  thumbnailSource,
  placeholderColor = colors.silver200,
  showLoader = true,
  blurRadius = 5,
  style,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isThumbnailLoaded, setIsThumbnailLoaded] = useState(false);
  
  const opacity = useSharedValue(0);
  const thumbnailOpacity = useSharedValue(0);
  
  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });
  
  const thumbnailAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: thumbnailOpacity.value,
    };
  });
  
  const onThumbnailLoad = () => {
    setIsThumbnailLoaded(true);
    thumbnailOpacity.value = withTiming(1, {
      duration: 200,
      easing: Easing.ease,
    });
  };
  
  const onImageLoad = () => {
    setIsLoading(false);
    opacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.ease,
    });
  };
  
  return (
    <View style={[styles.container, style]}>
      {/* Placeholder color */}
      <View 
        style={[
          StyleSheet.absoluteFill, 
          { backgroundColor: placeholderColor }
        ]} 
      />
      
      {/* Thumbnail image with blur effect */}
      {thumbnailSource && (
        <Animated.View style={[StyleSheet.absoluteFill, thumbnailAnimatedStyle]}>
          <Image
            source={thumbnailSource}
            style={StyleSheet.absoluteFill}
            onLoad={onThumbnailLoad}
            blurRadius={Platform.OS === 'android' ? blurRadius : 0}
          />
          {Platform.OS === 'ios' && isThumbnailLoaded && (
            <BlurView
              intensity={blurRadius * 5}
              style={StyleSheet.absoluteFill}
            />
          )}
        </Animated.View>
      )}
      
      {/* Main image */}
      <Animated.Image
        source={source}
        style={[StyleSheet.absoluteFill, imageAnimatedStyle]}
        onLoad={onImageLoad}
        {...props}
      />
      
      {/* Loading indicator */}
      {isLoading && showLoader && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={colors.mercadoBlue} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LazyImage;