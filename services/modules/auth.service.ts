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
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('deviceId', data.deviceId);
    formData.append('deviceName', data.deviceName);
    formData.append('selfie', data.selfie as any);
    formData.append('ine', data.ine as any);

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
