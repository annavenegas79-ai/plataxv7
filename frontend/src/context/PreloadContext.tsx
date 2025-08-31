import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useInView } from 'react-intersection-observer';

interface PreloadContextType {
  preloadPage: (url: string) => void;
  preloadImage: (src: string) => void;
  preloadComponent: (component: React.ComponentType<any>) => void;
  registerLinkRef: (ref: React.RefObject<HTMLAnchorElement>, url: string) => void;
}

const PreloadContext = createContext<PreloadContextType | undefined>(undefined);

export const PreloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [preloadedPages, setPreloadedPages] = useState<Set<string>>(new Set());
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const [preloadedComponents, setPreloadedComponents] = useState<Set<React.ComponentType<any>>>(new Set());
  const [linkRefs, setLinkRefs] = useState<Map<React.RefObject<HTMLAnchorElement>, string>>(new Map());

  // Preload a page by URL
  const preloadPage = useCallback((url: string) => {
    if (!preloadedPages.has(url) && url !== router.asPath) {
      router.prefetch(url);
      setPreloadedPages((prev) => new Set([...prev, url]));
    }
  }, [preloadedPages, router]);

  // Preload an image
  const preloadImage = useCallback((src: string) => {
    if (!preloadedImages.has(src)) {
      const img = new Image();
      img.src = src;
      setPreloadedImages((prev) => new Set([...prev, src]));
    }
  }, [preloadedImages]);

  // Preload a component
  const preloadComponent = useCallback((component: React.ComponentType<any>) => {
    if (!preloadedComponents.has(component)) {
      setPreloadedComponents((prev) => new Set([...prev, component]));
    }
  }, [preloadedComponents]);

  // Register a link ref for intersection observation
  const registerLinkRef = useCallback((ref: React.RefObject<HTMLAnchorElement>, url: string) => {
    setLinkRefs((prev) => {
      const newMap = new Map(prev);
      newMap.set(ref, url);
      return newMap;
    });
  }, []);

  // Set up intersection observers for all registered links
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    linkRefs.forEach((url, ref) => {
      if (ref.current) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                preloadPage(url);
                observer.unobserve(entry.target);
              }
            });
          },
          { rootMargin: '200px' }
        );
        
        observer.observe(ref.current);
        observers.push(observer);
      }
    });
    
    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [linkRefs, preloadPage]);

  // Preload pages based on user navigation patterns
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Clear preloaded pages on route change to avoid memory issues
      setPreloadedPages(new Set());
      
      // Preload related pages based on current URL
      if (url.includes('/product/')) {
        // If on a product page, preload cart and checkout
        preloadPage('/cart');
        preloadPage('/checkout');
      } else if (url.includes('/category/')) {
        // If on a category page, preload first few products
        // This would require knowledge of the products in the category
      } else if (url === '/') {
        // If on home page, preload popular categories
        preloadPage('/category/electronics');
        preloadPage('/category/home');
        preloadPage('/category/fashion');
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, preloadPage]);

  return (
    <PreloadContext.Provider value={{ preloadPage, preloadImage, preloadComponent, registerLinkRef }}>
      {children}
    </PreloadContext.Provider>
  );
};

export const usePreload = () => {
  const context = useContext(PreloadContext);
  if (context === undefined) {
    throw new Error('usePreload must be used within a PreloadProvider');
  }
  return context;
};

// Custom hook for preloading a link when it comes into view
export const usePreloadOnView = (url: string) => {
  const { preloadPage } = usePreload();
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px',
  });

  useEffect(() => {
    if (inView) {
      preloadPage(url);
    }
  }, [inView, preloadPage, url]);

  return { ref };
};

// Custom hook for preloading an image when it comes into view
export const usePreloadImageOnView = (src: string) => {
  const { preloadImage } = usePreload();
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px',
  });

  useEffect(() => {
    if (inView) {
      preloadImage(src);
    }
  }, [inView, preloadImage, src]);

  return { ref };
};