// PWA Service Worker Registration and utilities
import { useState, useEffect } from 'react';

interface PWAInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAManager {
  private installPrompt: PWAInstallPrompt | null = null;
  private isInstalled = false;
  private isSupported = false;

  constructor() {
    this.checkSupport();
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.checkIfInstalled();
  }

  private checkSupport() {
    this.isSupported = 'serviceWorker' in navigator;
  }

  private async registerServiceWorker() {
    if (!this.isSupported) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('[PWA] Service Worker registered successfully:', registration);

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            this.showUpdateAvailableNotification();
          }
        });
      });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('[PWA] Cache updated');
        }
      });

    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  }

  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      this.installPrompt = e as PWAInstallPrompt;
      console.log('[PWA] Install prompt available');
    });

    // Handle successful installation
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      this.isInstalled = true;
      this.installPrompt = null;
    });
  }

  private checkIfInstalled() {
    // Check if app is installed (iOS Safari)
    if (window.navigator.standalone) {
      this.isInstalled = true;
      return;
    }

    // Check if app is installed (Android Chrome)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      return;
    }
  }

  public canInstall(): boolean {
    return this.installPrompt !== null && !this.isInstalled;
  }

  public async showInstallPrompt(): Promise<boolean> {
    if (!this.installPrompt) return false;

    try {
      await this.installPrompt.prompt();
      const choiceResult = await this.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted install prompt');
        return true;
      } else {
        console.log('[PWA] User dismissed install prompt');
        return false;
      }
    } catch (error) {
      console.error('[PWA] Install prompt failed:', error);
      return false;
    } finally {
      this.installPrompt = null;
    }
  }

  public isAppInstalled(): boolean {
    return this.isInstalled;
  }

  public isPWASupported(): boolean {
    return this.isSupported;
  }

  public async checkForUpdates() {
    if (!this.isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
    } catch (error) {
      console.error('[PWA] Failed to check for updates:', error);
    }
  }

  private showUpdateAvailableNotification() {
    // Show custom notification or toast
    const event = new CustomEvent('pwa-update-available', {
      detail: { message: 'Nueva versión disponible. Recarga para actualizar.' }
    });
    window.dispatchEvent(event);
  }

  public async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('[PWA] Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  public async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.isSupported) return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.VITE_VAPID_PUBLIC_KEY || ''
        )
      });

      console.log('[PWA] Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('[PWA] Push subscription failed:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  // Cache management
  public async clearCache(): Promise<void> {
    if (!this.isSupported) return;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('[PWA] Cache cleared');
    } catch (error) {
      console.error('[PWA] Failed to clear cache:', error);
    }
  }

  // Network status
  public isOnline(): boolean {
    return navigator.onLine;
  }

  public onNetworkChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  // App shortcuts
  public async updateShortcuts(shortcuts: Array<{
    name: string;
    description: string;
    url: string;
    icons: Array<{ src: string; sizes: string }>;
  }>) {
    if (!('getInstalledRelatedApps' in navigator)) return;

    try {
      const relatedApps = await (navigator as any).getInstalledRelatedApps();
      if (relatedApps.length > 0) {
        // App is installed, shortcuts can be updated
        console.log('[PWA] App installed, shortcuts available');
      }
    } catch (error) {
      console.error('[PWA] Failed to check installed apps:', error);
    }
  }
}

// Create singleton instance
export const pwaManager = new PWAManager();

// React hook for PWA functionality
export function usePWA() {
  const [canInstall, setCanInstall] = useState(pwaManager.canInstall());
  const [isInstalled, setIsInstalled] = useState(pwaManager.isAppInstalled());
  const [isOnline, setIsOnline] = useState(pwaManager.isOnline());
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check install status periodically
    const checkInstallStatus = () => {
      setCanInstall(pwaManager.canInstall());
      setIsInstalled(pwaManager.isAppInstalled());
    };

    const interval = setInterval(checkInstallStatus, 1000);

    // Network status listener
    const cleanupNetworkListener = pwaManager.onNetworkChange(setIsOnline);

    // Update available listener
    const handleUpdateAvailable = () => setUpdateAvailable(true);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      clearInterval(interval);
      cleanupNetworkListener();
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  return {
    canInstall,
    isInstalled,
    isOnline,
    updateAvailable,
    isSupported: pwaManager.isPWASupported(),
    install: pwaManager.showInstallPrompt.bind(pwaManager),
    checkForUpdates: pwaManager.checkForUpdates.bind(pwaManager),
    requestNotificationPermission: pwaManager.requestNotificationPermission.bind(pwaManager),
    subscribeToPushNotifications: pwaManager.subscribeToPushNotifications.bind(pwaManager),
    clearCache: pwaManager.clearCache.bind(pwaManager)
  };
}

// Export for global use
export { PWAManager };