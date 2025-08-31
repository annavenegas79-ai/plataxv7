import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

type User = {
  id: number;
  name: string;
  email: string;
  avatar?: string;
};

type AuthContextData = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storedUser = await AsyncStorage.getItem('@PlataMX:user');
      const storedToken = await AsyncStorage.getItem('@PlataMX:token');

      if (storedUser && storedToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
      }

      setLoading(false);
    }

    loadStorageData();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // This would be a real API call in production
      // const response = await api.post('/auth/login', { email, password });
      
      // Mock response for demo
      const response = {
        data: {
          user: {
            id: 1,
            name: 'Susana Gonzalez',
            email: email,
            avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
          },
          token: 'mock-jwt-token',
        },
      };

      const { user, token } = response.data;

      await AsyncStorage.setItem('@PlataMX:user', JSON.stringify(user));
      await AsyncStorage.setItem('@PlataMX:token', token);

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(user);
    } catch (error) {
      throw new Error('Authentication failed');
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('@PlataMX:user');
    await AsyncStorage.removeItem('@PlataMX:token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}