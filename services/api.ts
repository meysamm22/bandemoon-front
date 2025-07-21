// Use different URLs for different platforms
import { Platform } from 'react-native';
import { storageService } from './storage';

const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8080/api', // Android emulator
  ios: 'http://localhost:8080/api',     // iOS simulator
  default: 'http://localhost:8080/api'  // Fallback
});

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

class ApiService {
  private onTokenUpdate?: (accessToken: string, refreshToken: string) => Promise<void>;

  setTokenUpdateCallback(callback: (accessToken: string, refreshToken: string) => Promise<void>) {
    this.onTokenUpdate = callback;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    skipAuth = false
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('Making API request to:', url);
    console.log('Request options:', options);
    
    // Add authorization header if not skipping auth
    let headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (!skipAuth) {
      const accessToken = await storageService.getAccessToken();
      if (accessToken) {
        headers = {
          ...headers,
          'Authorization': `Bearer ${accessToken}`,
        };
      }
    }

    const defaultOptions: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      let responseData;
      try {
        // Try to parse the response body
        responseData = await response.json();
        console.log('Parsed response data:', responseData);
      } catch (parseError) {
        // If JSON parsing fails, create a default error response
        console.error('Failed to parse response as JSON:', parseError);
        responseData = {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }
      
      if (!response.ok) {
        // Handle 401 Unauthorized - try to refresh token
        if (response.status === 401 && !skipAuth) {
          console.log('Token expired, attempting to refresh...');
          const refreshResult = await this.refreshToken();
          if (refreshResult.success && refreshResult.accessToken) {
            // Store the new tokens
            await storageService.storeAccessToken(refreshResult.accessToken);
            if (refreshResult.refreshToken) {
              await storageService.storeRefreshToken(refreshResult.refreshToken);
            }
            
            // Notify AuthContext about token update
            if (this.onTokenUpdate && refreshResult.accessToken && refreshResult.refreshToken) {
              try {
                await this.onTokenUpdate(refreshResult.accessToken, refreshResult.refreshToken);
                console.log('AuthContext notified of token update');
              } catch (error) {
                console.error('Failed to update AuthContext:', error);
              }
            }
            
            // Retry the original request with new token
            console.log('Token refreshed, retrying original request...');
            return this.makeRequest<T>(endpoint, options, skipAuth);
          } else {
            console.log('Token refresh failed:', refreshResult.message);
            // If refresh failed, return the original error
            return responseData;
          }
        }
        
        // Return the error response from the server
        console.log('Server returned error:', response.status, responseData);
        return responseData;
      }
      
      return responseData;
    } catch (error) {
      console.error('API request failed:', error);
      // Return a structured error response instead of throwing
      return {
        success: false,
        message: 'Network error. Please try again.'
      } as T;
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, true); // Skip auth for login
  }

  async refreshToken(refreshToken?: string): Promise<RefreshTokenResponse> {
    // If no refresh token provided, get it from storage
    const tokenToUse = refreshToken || await storageService.getRefreshToken();
    if (!tokenToUse) {
      return {
        success: false,
        message: 'No refresh token available',
      } as RefreshTokenResponse;
    }

    const url = `${API_BASE_URL}/auth/refresh`;
    console.log('Refreshing token at:', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokenToUse }),
      });

      let responseData;
      try {
        responseData = await response.json();
        console.log('Refresh token response:', responseData);
      } catch (parseError) {
        console.error('Failed to parse refresh response as JSON:', parseError);
        responseData = {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      if (!response.ok) {
        console.log('Refresh token failed:', response.status, responseData);
        return responseData;
      }

      return responseData;
    } catch (error) {
      console.error('Refresh token request failed:', error);
      return {
        success: false,
        message: 'Network error during token refresh.'
      } as RefreshTokenResponse;
    }
  }

  async logout(refreshToken: string): Promise<LogoutResponse> {
    return this.makeRequest<LogoutResponse>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logoutAll(accessToken: string): Promise<LogoutResponse> {
    return this.makeRequest<LogoutResponse>('/auth/logout-all', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }

  async validateToken(accessToken: string): Promise<{ valid: boolean }> {
    return this.makeRequest<{ valid: boolean }>('/auth/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }

  async getMyProfile(): Promise<ProfileResponse> {
    return this.makeRequest<ProfileResponse>('/profile/me', {
      method: 'GET',
    });
  }

  async getUserProfile(userId: number): Promise<ProfileResponse> {
    return this.makeRequest<ProfileResponse>(`/profile/${userId}`, {
      method: 'GET',
    });
  }
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  userProfile?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    bio?: string;
    profilePicture?: string;
    location?: string;
    dateOfBirth?: string;
    gender?: string;
    website?: string;
    socialMediaLinks?: string;
    musicalInstruments?: string;
    musicalGenres?: string;
    experienceLevel?: string;
    availability?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const apiService = new ApiService(); 