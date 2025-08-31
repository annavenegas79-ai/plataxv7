import dynamic from 'next/dynamic';
import { ComponentType, lazy } from 'react';

/**
 * Enhanced dynamic import for Next.js components with better loading and error handling
 * @param importFunc - Function that imports the component
 * @param options - Options for the dynamic import
 * @returns Dynamically imported component
 */
export function dynamicImport<T>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  options: {
    loading?: ComponentType;
    ssr?: boolean;
    suspense?: boolean;
  } = {}
) {
  return dynamic(importFunc, {
    loading: options.loading,
    ssr: options.ssr !== undefined ? options.ssr : true,
    suspense: options.suspense !== undefined ? options.suspense : false,
  });
}

/**
 * Preload a component for future use
 * @param importFunc - Function that imports the component
 */
export function preloadComponent<T>(
  importFunc: () => Promise<{ default: ComponentType<T> }>
): void {
  // Start loading the component in the background
  importFunc();
}

/**
 * Create a map of preloadable components
 * @param componentMap - Object mapping component names to import functions
 * @returns Object with the same keys but values are preload functions
 */
export function createPreloadableComponents<
  T extends Record<string, () => Promise<{ default: ComponentType<any> }>>
>(componentMap: T): { [K in keyof T]: () => void } {
  const preloadMap = {} as { [K in keyof T]: () => void };
  
  for (const key in componentMap) {
    preloadMap[key] = () => preloadComponent(componentMap[key]);
  }
  
  return preloadMap;
}

/**
 * Example usage:
 * 
 * // Define your dynamic components
 * const dynamicComponents = {
 *   ProductCard: () => import('../components/ProductCard'),
 *   CategoryList: () => import('../components/CategoryList'),
 * };
 * 
 * // Create preloadable versions
 * export const preloadComponents = createPreloadableComponents(dynamicComponents);
 * 
 * // Create the actual dynamic components
 * export const DynamicProductCard = dynamicImport(dynamicComponents.ProductCard);
 * export const DynamicCategoryList = dynamicImport(dynamicComponents.CategoryList);
 * 
 * // Usage in a component:
 * // Preload: preloadComponents.ProductCard();
 * // Render: <DynamicProductCard {...props} />
 */