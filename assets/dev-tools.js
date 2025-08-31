/**
 * Development tools for PlataMX
 * 
 * This file contains utilities for development environment only.
 * It should not be included in production builds.
 */

(function() {
  // Check if we're in development mode
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // Add development banner
  const addDevBanner = () => {
    const banner = document.createElement('div');
    banner.style.position = 'fixed';
    banner.style.top = '0';
    banner.style.left = '0';
    banner.style.right = '0';
    banner.style.backgroundColor = '#f0f0f0';
    banner.style.color = '#333';
    banner.style.padding = '4px 8px';
    banner.style.fontSize = '12px';
    banner.style.textAlign = 'center';
    banner.style.zIndex = '9999';
    banner.style.borderBottom = '1px solid #ddd';
    banner.textContent = 'PlataMX Development Environment';
    
    document.body.appendChild(banner);
  };

  // Initialize development tools
  const init = () => {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', addDevBanner);
    } else {
      addDevBanner();
    }
    
    // Log development mode
    console.log('PlataMX Development Tools Initialized');
  };

  init();
})();