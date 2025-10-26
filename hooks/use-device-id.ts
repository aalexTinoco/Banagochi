/**
 * Device ID Management Hook
 * Generates and persists a unique device identifier
 */

import { Platform } from 'react-native';
import { useEffect, useState } from 'react';

const DEVICE_ID_KEY = 'banagochi_device_id';
const DEVICE_NAME_KEY = 'banagochi_device_name';

// Simple in-memory storage fallback
let inMemoryStorage: Record<string, string> = {};

/**
 * Generates a unique device ID based on device information
 */
function generateDeviceId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const random2 = Math.random().toString(36).substring(2, 15);
  const platform = Platform.OS;
  
  return `${platform}-${timestamp}-${random}${random2}`;
}

/**
 * Gets device name for display purposes
 */
function getDeviceName(): string {
  const platform = Platform.OS;
  const version = Platform.Version;
  
  if (platform === 'ios') {
    return `iPhone (iOS ${version})`;
  } else if (platform === 'android') {
    return `Android ${version}`;
  } else if (platform === 'web') {
    return 'Web Browser';
  }
  
  return `${platform} Device`;
}

/**
 * Simple storage wrapper (uses localStorage on web, in-memory elsewhere)
 */
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return inMemoryStorage[key] || null;
  },
  
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    } else {
      inMemoryStorage[key] = value;
    }
  },
  
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    } else {
      delete inMemoryStorage[key];
    }
  },
};

/**
 * Hook to manage device ID
 */
export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeDeviceId();
  }, []);

  async function initializeDeviceId() {
    try {
      // Try to get existing device ID
      let storedDeviceId = await storage.getItem(DEVICE_ID_KEY);
      let storedDeviceName = await storage.getItem(DEVICE_NAME_KEY);
      
      // If no device ID exists, generate and store one
      if (!storedDeviceId) {
        storedDeviceId = generateDeviceId();
        await storage.setItem(DEVICE_ID_KEY, storedDeviceId);
      }

      // Get or generate device name
      if (!storedDeviceName) {
        storedDeviceName = getDeviceName();
        await storage.setItem(DEVICE_NAME_KEY, storedDeviceName);
      }

      setDeviceId(storedDeviceId);
      setDeviceName(storedDeviceName);
    } catch (error) {
      console.error('Error initializing device ID:', error);
      // Fallback to in-memory device ID
      const fallbackId = generateDeviceId();
      setDeviceId(fallbackId);
      setDeviceName(getDeviceName());
    } finally {
      setLoading(false);
    }
  }

  /**
   * Reset device ID (useful for testing or logout)
   */
  async function resetDeviceId() {
    try {
      await storage.removeItem(DEVICE_ID_KEY);
      await storage.removeItem(DEVICE_NAME_KEY);
      const newDeviceId = generateDeviceId();
      const newDeviceName = getDeviceName();
      await storage.setItem(DEVICE_ID_KEY, newDeviceId);
      await storage.setItem(DEVICE_NAME_KEY, newDeviceName);
      setDeviceId(newDeviceId);
      setDeviceName(newDeviceName);
    } catch (error) {
      console.error('Error resetting device ID:', error);
    }
  }

  return {
    deviceId,
    deviceName,
    loading,
    resetDeviceId,
  };
}

/**
 * Get device ID without using hook (for one-time usage)
 */
export async function getDeviceId(): Promise<string> {
  try {
    let deviceId = await storage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      deviceId = generateDeviceId();
      await storage.setItem(DEVICE_ID_KEY, deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return generateDeviceId();
  }
}

/**
 * Get device name without using hook (for one-time usage)
 */
export async function getStoredDeviceName(): Promise<string> {
  try {
    let deviceName = await storage.getItem(DEVICE_NAME_KEY);
    
    if (!deviceName) {
      deviceName = getDeviceName();
      await storage.setItem(DEVICE_NAME_KEY, deviceName);
    }
    
    return deviceName;
  } catch (error) {
    console.error('Error getting device name:', error);
    return getDeviceName();
  }
}
