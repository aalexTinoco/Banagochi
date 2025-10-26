/**
 * Authentication Service
 */

import { HttpClient } from '../utils/http-client';
import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import type {
  LoginRequest,
  LoginWithBiometricRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  TokenTimeResponse,
} from '../types';

export class AuthService {
  private static baseUrl = API_CONFIG.USERS_BASE_URL;

  /**
   * Login with existing device (no biometric verification)
   */
  static async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await HttpClient.post<LoginResponse>(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.LOGIN}`,
      data
    );

    // Store token if login successful
    if (response.success && response.token) {
      HttpClient.setAuthToken(response.token);
    }

    return response;
  }

  /**
   * Login with new device (requires biometric verification)
   */
  static async loginWithBiometric(
    data: LoginWithBiometricRequest
  ): Promise<LoginResponse> {
    console.log('📸 Preparing biometric login request:', {
      email: data.email,
      deviceId: data.deviceId,
      deviceName: data.deviceName,
      hasSelfie: !!data.selfie,
      hasIne: !!data.ine,
      selfieUri: (data.selfie as any)?.uri,
      ineUri: (data.ine as any)?.uri,
    });

    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('deviceId', data.deviceId);
    formData.append('deviceName', data.deviceName);
    
    // For React Native, we need to use the image URI format
    // expo-image-picker returns { uri, type, name } format
    formData.append('selfie', {
      uri: (data.selfie as any).uri || data.selfie,
      type: 'image/jpeg',
      name: 'selfie.jpg',
    } as any);
    
    formData.append('ine', {
      uri: (data.ine as any).uri || data.ine,
      type: 'image/jpeg',
      name: 'ine.jpg',
    } as any);

    console.log('📤 Sending FormData with fields:', {
      email: data.email,
      deviceId: data.deviceId,
      deviceName: data.deviceName,
      selfie: 'selfie.jpg',
      ine: 'ine.jpg',
    });

    const response = await HttpClient.uploadFormData<LoginResponse>(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.LOGIN}`,
      formData
    );

    // Store token if login successful
    if (response.success && response.token) {
      HttpClient.setAuthToken(response.token);
    }

    return response;
  }

  /**
   * Get token time remaining
   */
  static async getTokenTime(userId: string): Promise<TokenTimeResponse> {
    return HttpClient.post<TokenTimeResponse>(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.GET_TIME}`,
      { userId }
    );
  }

  /**
   * Update/refresh token TTL
   */
  static async updateToken(userId: string): Promise<any> {
    return HttpClient.get(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.UPDATE_TOKEN}?userId=${userId}`
    );
  }

  /**
   * Request password reset
   */
  static async forgotPassword(data: ForgotPasswordRequest): Promise<any> {
    return HttpClient.post(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`,
      data
    );
  }

  /**
   * Reset password with token
   */
  static async resetPassword(data: ResetPasswordRequest): Promise<any> {
    return HttpClient.post(
      `${this.baseUrl}${API_ENDPOINTS.AUTH.RESET_PASSWORD}`,
      data
    );
  }

  /**
   * Logout (clear local token)
   */
  static logout(): void {
    HttpClient.setAuthToken(null);
  }

  /**
   * Set authentication token
   */
  static setToken(token: string): void {
    HttpClient.setAuthToken(token);
  }

  /**
   * Get current authentication token
   */
  static getToken(): string | null {
    return HttpClient.getAuthToken();
  }
}
