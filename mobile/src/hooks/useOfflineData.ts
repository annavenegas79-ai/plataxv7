import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { apiService } from '../services/api';

interface OfflineDataProps<T> {
  key: string;
  fetchFn: () => Promise<T>;
  initialData?: T;
  expirationTime?: number; // Time in milliseconds
}

interface OfflineDataResult<T> {
  data: T | null;
  isLoading: boolean;
  isOffline: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for handling offline data persistence
 * @param {OfflineDataProps<T>} props - Configuration for offline data
 * @returns {OfflineDataResult<T>} - The data and state information
 */
export function useOfflineData<T>({
  key,
  fetchFn,
  initialData = null,
  expirationTime = 24 * 60 * 60 * 1000, // 24 hours by default
}: OfflineDataProps<T>): OfflineDataResult<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const storageKey = `@PlataMX:offline:${key}`;

  // Function to load data from AsyncStorage
  const loadFromStorage = useCallback(async () => {
    try {
      const storedData = await AsyncStorage.getItem(storageKey);
      
      if (storedData) {
        const { data: cachedData, timestamp } = JSON.parse(storedData);
        const isExpired = Date.now() - timestamp > expirationTime;
        
        if (!isExpired) {
          setData(cachedData);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error(`Error loading data from storage for key ${key}:`, err);
      return false;
    }
  }, [storageKey, expirationTime, key]);

  // Function to save data to AsyncStorage
  const saveToStorage = useCallback(async (newData: T) => {
    try {
      const dataToStore = {
        data: newData,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(storageKey, JSON.stringify(dataToStore));
    } catch (err) {
      console.error(`Error saving data to storage for key ${key}:`, err);
    }
  }, [storageKey, key]);

  // Function to fetch fresh data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check network status
      const networkState = await NetInfo.fetch();
      const isConnected = networkState.isConnected;
      setIsOffline(!isConnected);
      
      if (!isConnected) {
        // If offline, try to load from storage
        const hasStoredData = await loadFromStorage();
        
        if (!hasStoredData) {
          throw new Error('No internet connection and no cached data available');
        }
      } else {
        // If online, fetch fresh data
        const freshData = await fetchFn();
        setData(freshData);
        
        // Save to storage for offline use
        await saveToStorage(freshData);
      }
    } catch (err) {
      console.error(`Error fetching data for key ${key}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      // Try to load from storage as fallback
      await loadFromStorage();
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, loadFromStorage, saveToStorage, key]);

  // Function to manually refetch data
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
    
    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
      
      // If we're coming back online and we have an error, try to fetch again
      if (state.isConnected && error) {
        fetchData();
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [fetchData, error]);

  return { data, isLoading, isOffline, error, refetch };
}

/**
 * Utility function to clear all offline data
 */
export const clearAllOfflineData = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const offlineKeys = keys.filter(key => key.startsWith('@PlataMX:offline:'));
    
    if (offlineKeys.length > 0) {
      await AsyncStorage.multiRemove(offlineKeys);
    }
  } catch (err) {
    console.error('Error clearing offline data:', err);
    throw err;
  }
};

/**
 * Utility function to clear specific offline data
 * @param {string} key - The key of the data to clear
 */
export const clearOfflineData = async (key: string): Promise<void> => {
  try {
    const storageKey = `@PlataMX:offline:${key}`;
    await AsyncStorage.removeItem(storageKey);
  } catch (err) {
    console.error(`Error clearing offline data for key ${key}:`, err);
    throw err;
  }
};