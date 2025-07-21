import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storageService, StoredUserInfo } from '../services/storage';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage on app start
  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const { accessToken: storedAccessToken, refreshToken: storedRefreshToken, userInfo } = await storageService.getAuthData();
      
      if (storedAccessToken && storedRefreshToken && userInfo) {
        setUser(userInfo);
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        console.log('Auth state restored from storage');
      } else {
        console.log('No stored auth data found');
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load auth state on component mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (user: User, accessToken: string, refreshToken: string) => {
    try {
      // Store in memory
      setUser(user);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      
      // Store in AsyncStorage
      await storageService.storeAuthData(accessToken, refreshToken, user);
      console.log('Auth data stored successfully');
    } catch (error) {
      console.error('Failed to store auth data:', error);
    }
  };

  const logout = async () => {
    try {
      // Clear from memory
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      
      // Clear from AsyncStorage
      await storageService.clearAuthData();
      console.log('Auth data cleared successfully');
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  };

  const updateTokens = async (accessToken: string, refreshToken: string) => {
    try {
      // Update in memory
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      
      // Update in AsyncStorage
      if (user) {
        await storageService.storeAuthData(accessToken, refreshToken, user);
        console.log('Tokens updated successfully');
      }
    } catch (error) {
      console.error('Failed to update tokens:', error);
    }
  };

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    login,
    logout,
    updateTokens,
    initializeAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 