/**
 * Storage Utility
 * Handles local storage operations for the app
 */

import type { IUser } from '../types';

const STORAGE_KEYS = {
  USER_ID: '@banagochi:userId',
  USER_DATA: '@banagochi:userData',
  DEVICE_ID: '@banagochi:deviceId',
} as const;

export class StorageService {
  /**
   * Get user ID from storage
   */
  static getUserId(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.USER_ID);
    }
    return null;
  }

  /**
   * Set user ID in storage
   */
  static setUserId(userId: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    }
  }

  /**
   * Get user data from storage
   */
  static getUserData(): IUser | null {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    }
    return null;
  }

  /**
   * Set user data in storage
   */
  static setUserData(user: IUser): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.USER_ID, user._id);
    }
  }

  /**
   * Get device ID from storage (generates one if not exists)
   */
  static getDeviceId(): string {
    if (typeof window !== 'undefined') {
      let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
      }
      return deviceId;
    }
    return `device_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Clear all stored data
   */
  static clearAll(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER_ID);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.DEVICE_ID);
    }
  }

  /**
   * Clear only user data (keep device ID)
   */
  static clearUserData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER_ID);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  }
}
