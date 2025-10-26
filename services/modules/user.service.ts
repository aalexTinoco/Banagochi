/**
 * User Service
 */

import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';
import type {
  Device,
  LogoutDeviceRequest,
  RegisterUserRequest,
  UpdateUserRequest,
  UserResponse,
  UsersListResponse,
} from '../types';
import { HttpClient } from '../utils/http-client';

export class UserService {
  private static baseUrl = API_CONFIG.USERS_BASE_URL;

  /**
   * Register new user with biometric verification
   */
  static async register(data: RegisterUserRequest | FormData): Promise<UserResponse> {
    // If data is already FormData, use it directly
    if (data instanceof FormData) {
      console.log('📤 Sending FormData directly to register endpoint');
      return HttpClient.uploadFormData<UserResponse>(
        `${this.baseUrl}${API_ENDPOINTS.USERS.REGISTER}`,
        data
      );
    }

    // Otherwise, prepare FormData from object
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('role', JSON.stringify(data.role));
    
    if (data.colony) formData.append('colony', data.colony);
    if (data.domicilio) formData.append('domicilio', data.domicilio);
    
    formData.append('selfie', data.selfie as any);
    formData.append('ine', data.ine as any);

    return HttpClient.uploadFormData<UserResponse>(
      `${this.baseUrl}${API_ENDPOINTS.USERS.REGISTER}`,
      formData
    );
  }

  /**
   * Get all users
   */
  static async getAllUsers(): Promise<UsersListResponse> {
    return HttpClient.get<UsersListResponse>(
      `${this.baseUrl}${API_ENDPOINTS.USERS.GET_ALL}`
    );
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<UserResponse> {
    return HttpClient.get<UserResponse>(
      `${this.baseUrl}${API_ENDPOINTS.USERS.GET_BY_ID(userId)}`
    );
  }

  /**
   * Update user
   */
  static async updateUser(
    userId: string,
    data: UpdateUserRequest
  ): Promise<UserResponse> {
    return HttpClient.put<UserResponse>(
      `${this.baseUrl}${API_ENDPOINTS.USERS.UPDATE(userId)}`,
      data
    );
  }

  /**
   * Delete user (soft delete)
   */
  static async deleteUser(userId: string): Promise<any> {
    return HttpClient.delete(
      `${this.baseUrl}${API_ENDPOINTS.USERS.DELETE(userId)}`
    );
  }

  /**
   * Get admin users
   */
  static async getAdmins(): Promise<UsersListResponse> {
    return HttpClient.get<UsersListResponse>(
      `${this.baseUrl}${API_ENDPOINTS.USERS.GET_ADMINS}`
    );
  }

  /**
   * Get user devices
   */
  static async getUserDevices(userId: string): Promise<{ devices: Device[] }> {
    return HttpClient.get(
      `${this.baseUrl}${API_ENDPOINTS.USERS.GET_DEVICES(userId)}`
    );
  }

  /**
   * Logout specific device
   */
  static async logoutDevice(
    userId: string,
    data: LogoutDeviceRequest
  ): Promise<any> {
    return HttpClient.post(
      `${this.baseUrl}${API_ENDPOINTS.USERS.LOGOUT_DEVICE(userId)}`,
      data
    );
  }

  /**
   * Logout all devices
   */
  static async logoutAllDevices(userId: string): Promise<any> {
    return HttpClient.post(
      `${this.baseUrl}${API_ENDPOINTS.USERS.LOGOUT_ALL(userId)}`
    );
  }
}
