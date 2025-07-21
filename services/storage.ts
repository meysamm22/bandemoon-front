import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'bandemoon_access_token',
  REFRESH_TOKEN: 'bandemoon_refresh_token',
  USER_INFO: 'bandemoon_user_info',
} as const;

export interface StoredUserInfo {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

class StorageService {
  // Store access token
  async storeAccessToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      console.error('Failed to store access token:', error);
    }
  }

  // Get stored access token
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  // Store refresh token
  async storeRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Failed to store refresh token:', error);
    }
  }

  // Get stored refresh token
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  // Store user info
  async storeUserInfo(userInfo: StoredUserInfo): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
    } catch (error) {
      console.error('Failed to store user info:', error);
    }
  }

  // Get stored user info
  async getUserInfo(): Promise<StoredUserInfo | null> {
    try {
      const userInfoString = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
      if (userInfoString) {
        return JSON.parse(userInfoString);
      }
      return null;
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }

  // Store all authentication data
  async storeAuthData(
    accessToken: string,
    refreshToken: string,
    userInfo: StoredUserInfo
  ): Promise<void> {
    try {
      await Promise.all([
        this.storeAccessToken(accessToken),
        this.storeRefreshToken(refreshToken),
        this.storeUserInfo(userInfo),
      ]);
    } catch (error) {
      console.error('Failed to store auth data:', error);
    }
  }

  // Get all stored authentication data
  async getAuthData(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
    userInfo: StoredUserInfo | null;
  }> {
    try {
      const [accessToken, refreshToken, userInfo] = await Promise.all([
        this.getAccessToken(),
        this.getRefreshToken(),
        this.getUserInfo(),
      ]);

      return {
        accessToken,
        refreshToken,
        userInfo,
      };
    } catch (error) {
      console.error('Failed to get auth data:', error);
      return {
        accessToken: null,
        refreshToken: null,
        userInfo: null,
      };
    }
  }

  // Clear all stored authentication data
  async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_INFO),
      ]);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  // Check if user is logged in (has stored tokens)
  async isLoggedIn(): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const refreshToken = await this.getRefreshToken();
      return !!(accessToken && refreshToken);
    } catch (error) {
      console.error('Failed to check login status:', error);
      return false;
    }
  }
}

export const storageService = new StorageService(); 