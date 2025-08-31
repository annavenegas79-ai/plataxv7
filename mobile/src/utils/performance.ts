import { InteractionManager } from 'react-native';
import { Platform } from 'react-native';

/**
 * Run a task after interactions have completed to avoid frame drops
 * @param {Function} task - The task to run
 * @param {number} timeout - Optional timeout in milliseconds
 * @returns {Promise<T>} - Promise that resolves with the task result
 */
export function runAfterInteractions<T>(
  task: () => T | Promise<T>,
  timeout: number = 300
): Promise<T> {
  return new Promise((resolve, reject) => {
    InteractionManager.runAfterInteractions(() => {
      try {
        const result = task();
        if (result instanceof Promise) {
          result.then(resolve).catch(reject);
        } else {
          resolve(result);
        }
      } catch (error) {
        reject(error);
      }
    }).cancel = () => {
      reject(new Error('Task was cancelled'));
    };
    
    // Add a timeout to ensure the task runs even if interactions never complete
    if (timeout > 0) {
      setTimeout(() => {
        try {
          const result = task();
          if (result instanceof Promise) {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      }, timeout);
    }
  });
}

/**
 * Debounce a function to limit how often it can be called
 * @param {Function} func - The function to debounce
 * @param {number} wait - The time to wait in milliseconds
 * @param {boolean} immediate - Whether to call the function immediately
 * @returns {Function} - The debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
    
    if (callNow) {
      func.apply(context, args);
    }
  };
}

/**
 * Throttle a function to limit how often it can be called
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} - The throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  let lastFunc: NodeJS.Timeout | null = null;
  let lastRan: number = 0;
  
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      lastRan = Date.now();
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      if (lastFunc) {
        clearTimeout(lastFunc);
      }
      
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

/**
 * Memoize a function to cache its results
 * @param {Function} func - The function to memoize
 * @returns {Function} - The memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>();
  
  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
}

/**
 * Check if the device is a low-end device
 * @returns {boolean} - Whether the device is low-end
 */
export function isLowEndDevice(): boolean {
  // This is a simple heuristic and may need to be adjusted
  if (Platform.OS === 'android') {
    // For Android, we can use the API level as a rough indicator
    // API level 24 corresponds to Android 7.0
    return Platform.Version < 24;
  }
  
  // For iOS, we can use the model identifier
  // This is a very rough approximation
  if (Platform.OS === 'ios') {
    const majorVersionString = Platform.Version.toString().split('.')[0];
    const majorVersion = parseInt(majorVersionString, 10);
    return majorVersion < 12; // iOS 12 or lower is considered low-end
  }
  
  return false;
}

/**
 * Get performance settings based on device capabilities
 * @returns {Object} - Performance settings
 */
export function getPerformanceSettings() {
  const isLowEnd = isLowEndDevice();
  
  return {
    // Animation settings
    enableComplexAnimations: !isLowEnd,
    animationDuration: isLowEnd ? 150 : 300,
    
    // Image quality settings
    imageQuality: isLowEnd ? 'low' : 'high',
    loadHighResImages: !isLowEnd,
    
    // List rendering settings
    initialNumToRender: isLowEnd ? 5 : 10,
    maxToRenderPerBatch: isLowEnd ? 5 : 10,
    windowSize: isLowEnd ? 5 : 10,
    
    // Other settings
    enableParallaxEffects: !isLowEnd,
    enableBlurEffects: !isLowEnd,
    enableShadowEffects: !isLowEnd,
  };
}