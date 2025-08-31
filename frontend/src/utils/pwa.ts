// PWA utilities for service worker registration, offline support, and push notifications

// Register service worker
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      
      console.log('Service Worker registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  
  console.warn('Service Workers are not supported in this browser');
  return null;
};

// Check if the app is installed (in standalone mode)
export const isAppInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

// Check if the app can be installed
export const canInstallApp = async (): Promise<boolean> => {
  if (!('BeforeInstallPromptEvent' in window)) {
    return false;
  }
  
  // The beforeinstallprompt event is fired when the app can be installed
  // We'll return true if the event is fired
  return new Promise((resolve) => {
    const handler = () => {
      window.removeEventListener('beforeinstallprompt', handler);
      resolve(true);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    
    // If the event doesn't fire within 1 second, assume the app can't be installed
    setTimeout(() => {
      window.removeEventListener('beforeinstallprompt', handler);
      resolve(false);
    }, 1000);
  });
};

// Store the install prompt event for later use
let deferredPrompt: any;

// Set up the beforeinstallprompt event handler
export const setupInstallPrompt = (): void => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default browser install prompt
    e.preventDefault();
    
    // Store the event for later use
    deferredPrompt = e;
    
    // Dispatch a custom event that the app can listen for
    window.dispatchEvent(new CustomEvent('appInstallable'));
  });
  
  // Listen for the appinstalled event
  window.addEventListener('appinstalled', () => {
    // Clear the deferredPrompt
    deferredPrompt = null;
    
    // Dispatch a custom event that the app can listen for
    window.dispatchEvent(new CustomEvent('appInstalled'));
    
    // Log the installation
    console.log('PWA was installed');
  });
};

// Show the install prompt
export const showInstallPrompt = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    console.warn('Install prompt not available');
    return false;
  }
  
  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const choiceResult = await deferredPrompt.userChoice;
  
  // Clear the deferredPrompt
  deferredPrompt = null;
  
  // Return true if the user accepted the prompt
  return choiceResult.outcome === 'accepted';
};

// Check if the browser supports push notifications
export const supportsPushNotifications = (): boolean => {
  return 'PushManager' in window && 'Notification' in window;
};

// Request permission for push notifications
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }
  
  // Check if permission is already granted
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  // Request permission
  return await Notification.requestPermission();
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async (
  serviceWorkerRegistration: ServiceWorkerRegistration
): Promise<PushSubscription | null> => {
  try {
    // Request notification permission
    const permission = await requestNotificationPermission();
    
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }
    
    // Get the push subscription
    const subscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        // This should be your VAPID public key
        'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
      ),
    });
    
    // Send the subscription to your server
    await sendSubscriptionToServer(subscription);
    
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
};

// Send a push subscription to the server
const sendSubscriptionToServer = async (subscription: PushSubscription): Promise<void> => {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send subscription to server');
    }
    
    console.log('Push subscription sent to server');
  } catch (error) {
    console.error('Error sending push subscription to server:', error);
    throw error;
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPushNotifications = async (
  serviceWorkerRegistration: ServiceWorkerRegistration
): Promise<boolean> => {
  try {
    // Get the current subscription
    const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    
    if (!subscription) {
      console.warn('No push subscription found');
      return false;
    }
    
    // Unsubscribe
    const success = await subscription.unsubscribe();
    
    if (success) {
      // Send the unsubscription to your server
      await sendUnsubscriptionToServer(subscription);
      console.log('Successfully unsubscribed from push notifications');
    }
    
    return success;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
};

// Send an unsubscription to the server
const sendUnsubscriptionToServer = async (subscription: PushSubscription): Promise<void> => {
  try {
    const response = await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send unsubscription to server');
    }
    
    console.log('Push unsubscription sent to server');
  } catch (error) {
    console.error('Error sending push unsubscription to server:', error);
    throw error;
  }
};

// Check if the app is online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Listen for online/offline events
export const setupOnlineOfflineListeners = (
  onOnline: () => void,
  onOffline: () => void
): () => void => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  // Return a cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

// Register for background sync
export const registerBackgroundSync = async (
  serviceWorkerRegistration: ServiceWorkerRegistration,
  syncTag: string
): Promise<boolean> => {
  if (!('SyncManager' in window)) {
    console.warn('Background Sync is not supported in this browser');
    return false;
  }
  
  try {
    await serviceWorkerRegistration.sync.register(syncTag);
    console.log(`Background sync registered for tag: ${syncTag}`);
    return true;
  } catch (error) {
    console.error('Background sync registration failed:', error);
    return false;
  }
};

// Utility function to convert a base64 string to a Uint8Array
// This is needed for the applicationServerKey in the push subscription
function urlBase64ToUint8Array(base64String: string): Uint8Array {
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