import React, { useEffect, useState, Suspense } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, ActivityIndicator } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from 'react-query';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { colors } from './src/theme/colors';

// Enable native screens implementation for better performance
enableScreens();

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: false,
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      onError: (err) => {
        console.error('Query error:', err);
      },
    },
  },
});

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Fallback component for Suspense
const Fallback = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.silver50 }}>
    <ActivityIndicator size="large" color={colors.mercadoBlue} />
  </View>
);

// Network status component
const NetworkStatusBar = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  if (isConnected) return null;

  return (
    <View style={{ 
      backgroundColor: colors.error, 
      padding: 8, 
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999
    }}>
      <Text style={{ color: 'white', fontWeight: 'bold' }}>
        Sin conexión a internet
      </Text>
    </View>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('./src/assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('./src/assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('./src/assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('./src/assets/fonts/Inter-Bold.ttf'),
  });
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load any data or resources here
        // For example, load cached data from AsyncStorage
        const cachedData = await AsyncStorage.getItem('@PlataMX:cachedData');
        if (cachedData) {
          // Initialize app with cached data
          const parsedData = JSON.parse(cachedData);
          queryClient.setQueryData('cachedData', parsedData);
        }
        
        // Wait for fonts to load
        if (fontsLoaded) {
          // Hide splash screen after a short delay for smoother transition
          setTimeout(async () => {
            await SplashScreen.hideAsync();
            setAppIsReady(true);
          }, 100);
        }
      } catch (e) {
        console.warn('Error loading app resources:', e);
        if (fontsLoaded) {
          await SplashScreen.hideAsync();
          setAppIsReady(true);
        }
      }
    }
    
    prepare();
  }, [fontsLoaded]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SafeAreaProvider>
            <AuthProvider>
              <NavigationContainer>
                <StatusBar style="dark" />
                <Suspense fallback={<Fallback />}>
                  <AppNavigator />
                  <NetworkStatusBar />
                </Suspense>
              </NavigationContainer>
            </AuthProvider>
          </SafeAreaProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}