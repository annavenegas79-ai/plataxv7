import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Image } from 'react-native';

/**
 * Preload images to cache
 * @param {any[]} images - Array of image sources to preload
 * @returns {Promise<void>} - Promise that resolves when all images are loaded
 */
export async function cacheImages(images: any[]): Promise<void> {
  const cacheImages = images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
  
  await Promise.all(cacheImages);
}

/**
 * Preload fonts
 * @param {Record<string, any>} fonts - Object mapping font names to font assets
 * @returns {Promise<void>} - Promise that resolves when all fonts are loaded
 */
export async function cacheFonts(fonts: Record<string, any>): Promise<void> {
  await Font.loadAsync(fonts);
}

/**
 * Preload all assets needed for the app
 * @returns {Promise<void>} - Promise that resolves when all assets are loaded
 */
export async function preloadAssets(): Promise<void> {
  try {
    // Keep the splash screen visible while we fetch resources
    await SplashScreen.preventAutoHideAsync();
    
    // Load fonts
    await cacheFonts({
      'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
      'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
      'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
      'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    });
    
    // Preload common images
    await cacheImages([
      require('../assets/images/logo.png'),
      require('../assets/images/placeholder.png'),
      // Add more common images here
    ]);
    
    // Preload category icons
    await cacheImages([
      require('../assets/icons/electronics.png'),
      require('../assets/icons/home.png'),
      require('../assets/icons/fashion.png'),
      require('../assets/icons/sports.png'),
      // Add more category icons here
    ]);
    
  } catch (e) {
    console.warn('Error preloading assets:', e);
  } finally {
    // Hide splash screen after assets are loaded
    await SplashScreen.hideAsync();
  }
}

/**
 * Preload specific images in the background
 * @param {any[]} images - Array of image sources to preload
 * @returns {Promise<void>} - Promise that resolves when all images are loaded
 */
export async function preloadImagesInBackground(images: any[]): Promise<void> {
  try {
    await cacheImages(images);
  } catch (e) {
    console.warn('Error preloading images in background:', e);
  }
}