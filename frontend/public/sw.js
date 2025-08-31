// Service Worker for PlataMX PWA
const CACHE_NAME = 'platamx-cache-v1';
const OFFLINE_URL = '/offline.html';
const OFFLINE_IMG = '/images/offline-product-placeholder.jpg';
const OFFLINE_AVATAR = '/images/offline-avatar-placeholder.jpg';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles/main.css',
  '/js/main.js',
  '/js/app.js',
  '/images/logo.png',
  '/images/offline-product-placeholder.jpg',
  '/images/offline-avatar-placeholder.jpg',
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-512x512.png',
  '/manifest.json'
];

// Install event - precache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    return handleApiRequest(event);
  }
  
  // Handle image requests
  if (event.request.destination === 'image') {
    return handleImageRequest(event);
  }
  
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    return handleNavigationRequest(event);
  }
  
  // Default strategy: stale-while-revalidate
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          // Fetch new version in background
          fetchAndUpdateCache(event.request);
          return response;
        }
        
        // Not in cache - fetch and cache
        return fetchAndCache(event.request);
      })
  );
});

// Handle API requests with network-first strategy
function handleApiRequest(event) {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(event.request);
      })
  );
}

// Handle image requests with cache-first strategy and offline fallback
function handleImageRequest(event) {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Not in cache - fetch and cache
        return fetchAndCache(event.request)
          .catch(() => {
            // If fetch fails, return offline image placeholder
            if (event.request.url.includes('avatar') || event.request.url.includes('profile')) {
              return caches.match(OFFLINE_AVATAR);
            }
            return caches.match(OFFLINE_IMG);
          });
      })
  );
}

// Handle navigation requests with offline fallback
function handleNavigationRequest(event) {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache the page for offline use
        const clonedResponse = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clonedResponse);
        });
        return response;
      })
      .catch(() => {
        // If fetch fails, show offline page
        return caches.match(OFFLINE_URL);
      })
  );
}

// Fetch and cache a request
function fetchAndCache(request) {
  return fetch(request)
    .then((response) => {
      // Check if we received a valid response
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }
      
      // Clone the response as it can only be consumed once
      const responseToCache = response.clone();
      
      caches.open(CACHE_NAME)
        .then((cache) => {
          cache.put(request, responseToCache);
        });
      
      return response;
    });
}

// Fetch and update cache in background
function fetchAndUpdateCache(request) {
  fetch(request)
    .then((response) => {
      // Check if we received a valid response
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return;
      }
      
      // Clone the response
      const responseToCache = response.clone();
      
      caches.open(CACHE_NAME)
        .then((cache) => {
          cache.put(request, responseToCache);
        });
    })
    .catch(() => {
      // Silently fail for background updates
    });
}

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }
  
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/android-chrome-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Handle action clicks
  if (event.action) {
    console.log(`User clicked notification action: ${event.action}`);
    // Handle specific actions here
  } else {
    // Open the target URL
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          // Check if there's already a window open
          for (const client of clientList) {
            if (client.url === event.notification.data.url && 'focus' in client) {
              return client.focus();
            }
          }
          // If no window is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow(event.notification.data.url);
          }
        })
    );
  }
});

// Background sync for offline operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart());
  } else if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  } else if (event.tag === 'sync-reviews') {
    event.waitUntil(syncReviews());
  }
});

// Sync cart data when online
function syncCart() {
  return getDataFromIndexedDB('cart')
    .then((items) => {
      return fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items })
      });
    })
    .then((response) => {
      if (response.ok) {
        // Clear the offline data after successful sync
        return clearDataFromIndexedDB('cart');
      }
    })
    .catch((error) => {
      console.error('Cart sync failed:', error);
      // Retry will happen automatically when back online
    });
}

// Sync orders data when online
function syncOrders() {
  return getDataFromIndexedDB('pendingOrders')
    .then((orders) => {
      return Promise.all(orders.map(order => {
        return fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        })
        .then((response) => {
          if (response.ok) {
            // Remove this order from pending orders
            return removeItemFromIndexedDB('pendingOrders', order.id);
          }
        });
      }));
    })
    .catch((error) => {
      console.error('Orders sync failed:', error);
    });
}

// Sync reviews data when online
function syncReviews() {
  return getDataFromIndexedDB('pendingReviews')
    .then((reviews) => {
      return Promise.all(reviews.map(review => {
        return fetch('/api/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(review)
        })
        .then((response) => {
          if (response.ok) {
            // Remove this review from pending reviews
            return removeItemFromIndexedDB('pendingReviews', review.id);
          }
        });
      }));
    })
    .catch((error) => {
      console.error('Reviews sync failed:', error);
    });
}

// Helper function to get data from IndexedDB
function getDataFromIndexedDB(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PlataMXOfflineDB', 1);
    
    request.onerror = (event) => {
      reject('IndexedDB error: ' + event.target.errorCode);
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
      
      getAllRequest.onerror = (event) => {
        reject('Error getting data: ' + event.target.errorCode);
      };
    };
  });
}

// Helper function to clear data from IndexedDB
function clearDataFromIndexedDB(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PlataMXOfflineDB', 1);
    
    request.onerror = (event) => {
      reject('IndexedDB error: ' + event.target.errorCode);
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => {
        resolve();
      };
      
      clearRequest.onerror = (event) => {
        reject('Error clearing data: ' + event.target.errorCode);
      };
    };
  });
}

// Helper function to remove a specific item from IndexedDB
function removeItemFromIndexedDB(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PlataMXOfflineDB', 1);
    
    request.onerror = (event) => {
      reject('IndexedDB error: ' + event.target.errorCode);
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
      
      deleteRequest.onerror = (event) => {
        reject('Error removing item: ' + event.target.errorCode);
      };
    };
  });
}