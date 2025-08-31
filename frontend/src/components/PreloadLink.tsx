import React, { useRef, useEffect } from 'react';
import Link, { LinkProps } from 'next/link';
import { usePreload } from '../context/PreloadContext';

interface PreloadLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  preloadStrategy?: 'hover' | 'visible' | 'mount' | 'none';
  preloadDelay?: number;
}

/**
 * Enhanced Link component that preloads the destination page based on different strategies
 */
const PreloadLink: React.FC<PreloadLinkProps> = ({
  children,
  href,
  className,
  preloadStrategy = 'hover',
  preloadDelay = 0,
  ...props
}) => {
  const { preloadPage, registerLinkRef } = usePreload();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Convert href to string for preloading
  const hrefString = typeof href === 'object' ? href.pathname || '' : href.toString();
  
  useEffect(() => {
    // Register the link ref for intersection observation if strategy is 'visible'
    if (preloadStrategy === 'visible' && linkRef.current) {
      registerLinkRef(linkRef, hrefString);
    }
    
    // Preload immediately if strategy is 'mount'
    if (preloadStrategy === 'mount') {
      if (preloadDelay > 0) {
        timerRef.current = setTimeout(() => {
          preloadPage(hrefString);
        }, preloadDelay);
      } else {
        preloadPage(hrefString);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [hrefString, preloadStrategy, preloadDelay, preloadPage, registerLinkRef]);
  
  // Event handlers for hover strategy
  const handleMouseEnter = () => {
    if (preloadStrategy === 'hover') {
      if (preloadDelay > 0) {
        timerRef.current = setTimeout(() => {
          preloadPage(hrefString);
        }, preloadDelay);
      } else {
        preloadPage(hrefString);
      }
    }
  };
  
  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  
  return (
    <Link
      href={href}
      {...props}
      ref={linkRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Link>
  );
};

export default PreloadLink;