import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

interface ImageCacheProps {
  uri: string;
  cacheTime?: number; // Time in milliseconds to keep cache valid
}

interface ImageCacheResult {
  cachedUri: string | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook for caching remote images locally
 * @param {ImageCacheProps} props - The image URI and optional cache time
 * @returns {ImageCacheResult} - The cached image URI and loading state
 */
export const useImageCache = ({ 
  uri, 
  cacheTime = 7 * 24 * 60 * 60 * 1000 // 7 days by default
}: ImageCacheProps): ImageCacheResult => {
  const [cachedUri, setCachedUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const cacheImage = async () => {
      try {
        // Reset states when URI changes
        setIsLoading(true);
        setError(null);
        setCachedUri(null);
        
        // Skip caching for local assets
        if (!uri || uri.startsWith('file://') || uri.startsWith('data:')) {
          setCachedUri(uri);
          setIsLoading(false);
          return;
        }
        
        // Generate a unique filename based on the URI
        const hash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          uri
        );
        
        // Determine file extension from URI
        const extension = uri.split('.').pop() || 'jpg';
        const filename = `${hash}.${extension}`;
        
        // Path to store the cached image
        const cacheFolder = `${FileSystem.cacheDirectory}images/`;
        const cachedFile = `${cacheFolder}${filename}`;
        
        // Create cache directory if it doesn't exist
        const cacheDirectoryInfo = await FileSystem.getInfoAsync(cacheFolder);
        if (!cacheDirectoryInfo.exists) {
          await FileSystem.makeDirectoryAsync(cacheFolder, { intermediates: true });
        }
        
        // Check if file already exists in cache
        const fileInfo = await FileSystem.getInfoAsync(cachedFile);
        
        if (fileInfo.exists) {
          // Check if cache is still valid
          if (cacheTime > 0) {
            const now = new Date().getTime();
            const modificationTime = fileInfo.modificationTime ? 
              new Date(fileInfo.modificationTime * 1000).getTime() : 0;
            
            // If cache is expired, download again
            if (now - modificationTime > cacheTime) {
              await FileSystem.downloadAsync(uri, cachedFile);
            }
          }
          
          setCachedUri(cachedFile);
        } else {
          // Download and cache the image
          const downloadResult = await FileSystem.downloadAsync(uri, cachedFile);
          
          if (downloadResult.status === 200) {
            setCachedUri(cachedFile);
          } else {
            // If download fails, use original URI
            setCachedUri(uri);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error caching image:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        setCachedUri(uri); // Fallback to original URI
        setIsLoading(false);
      }
    };
    
    cacheImage();
    
    // Cleanup function
    return () => {
      // Cancel any pending operations if needed
    };
  }, [uri, cacheTime]);
  
  return { cachedUri, isLoading, error };
};

/**
 * Utility function to clear the entire image cache
 */
export const clearImageCache = async (): Promise<void> => {
  try {
    const cacheFolder = `${FileSystem.cacheDirectory}images/`;
    const cacheDirectoryInfo = await FileSystem.getInfoAsync(cacheFolder);
    
    if (cacheDirectoryInfo.exists) {
      await FileSystem.deleteAsync(cacheFolder, { idempotent: true });
      await FileSystem.makeDirectoryAsync(cacheFolder, { intermediates: true });
    }
  } catch (err) {
    console.error('Error clearing image cache:', err);
    throw err;
  }
};

/**
 * Utility function to get the size of the image cache
 * @returns {Promise<number>} - The size of the cache in bytes
 */
export const getImageCacheSize = async (): Promise<number> => {
  try {
    const cacheFolder = `${FileSystem.cacheDirectory}images/`;
    const cacheDirectoryInfo = await FileSystem.getInfoAsync(cacheFolder);
    
    if (!cacheDirectoryInfo.exists) {
      return 0;
    }
    
    // Get all files in the cache directory
    const files = await FileSystem.readDirectoryAsync(cacheFolder);
    
    // Calculate total size
    let totalSize = 0;
    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(`${cacheFolder}${file}`);
      if (fileInfo.exists && !fileInfo.isDirectory) {
        totalSize += fileInfo.size || 0;
      }
    }
    
    return totalSize;
  } catch (err) {
    console.error('Error getting image cache size:', err);
    return 0;
  }
};