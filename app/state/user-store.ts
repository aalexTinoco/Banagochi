import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/services/api';
import { HttpClient } from '@/services/api';

const USER_STORAGE_KEY = '@banagochi_user';
const TOKEN_STORAGE_KEY = '@banagochi_token';

let currentUser: User | null = null;
let currentToken: string | null = null;
const listeners = new Set<() => void>();

/**
 * Subscribe to user changes
 */
export function subscribeUser(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Notify all listeners
 */
function notifyListeners() {
  listeners.forEach(l => l());
}

/**
 * Get current user snapshot
 */
export function getUserSnapshot(): User | null {
  return currentUser;
}

/**
 * Get current token snapshot
 */
export function getTokenSnapshot(): string | null {
  return currentToken;
}

/**
 * Set user and token (saves to storage)
 */
export async function setUser(user: User, token: string) {
  try {
    currentUser = user;
    currentToken = token;
    
    // Set token in HTTP client for all API requests
    HttpClient.setAuthToken(token);
    
    await AsyncStorage.multiSet([
      [USER_STORAGE_KEY, JSON.stringify(user)],
      [TOKEN_STORAGE_KEY, token],
    ]);
    
    notifyListeners();
  } catch (error) {
    console.error('Error saving user to storage:', error);
  }
}

/**
 * Clear user and token (logout)
 */
export async function clearUser() {
  try {
    currentUser = null;
    currentToken = null;
    
    // Clear token from HTTP client
    HttpClient.setAuthToken(null);
    
    await AsyncStorage.multiRemove([USER_STORAGE_KEY, TOKEN_STORAGE_KEY]);
    
    notifyListeners();
  } catch (error) {
    console.error('Error clearing user from storage:', error);
  }
}

/**
 * Load user from storage (call on app startup)
 */
export async function loadUserFromStorage(): Promise<{ user: User | null; token: string | null }> {
  try {
    const [[, userStr], [, token]] = await AsyncStorage.multiGet([
      USER_STORAGE_KEY,
      TOKEN_STORAGE_KEY,
    ]);
    
    if (userStr && token) {
      const user = JSON.parse(userStr) as User;
      currentUser = user;
      currentToken = token;
      
      // Set token in HTTP client
      HttpClient.setAuthToken(token);
      
      notifyListeners();
      return { user, token };
    }
    
    return { user: null, token: null };
  } catch (error) {
    console.error('Error loading user from storage:', error);
    return { user: null, token: null };
  }
}

/**
 * Update user data (e.g., after fetching fresh data from API)
 */
export async function updateUser(user: User) {
  try {
    currentUser = user;
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    notifyListeners();
  } catch (error) {
    console.error('Error updating user:', error);
  }
}

/**
 * React hook to use user in components
 */
export function useUser(): User | null {
  const [user, setUserState] = React.useState<User | null>(() => currentUser);
  
  React.useEffect(() => {
    const unsubscribe = subscribeUser(() => {
      setUserState(currentUser);
    });
    return () => { unsubscribe(); };
  }, []);
  
  return user;
}

/**
 * React hook to use token in components
 */
export function useToken(): string | null {
  const [token, setTokenState] = React.useState<string | null>(() => currentToken);
  
  React.useEffect(() => {
    const unsubscribe = subscribeUser(() => {
      setTokenState(currentToken);
    });
    return () => { unsubscribe(); };
  }, []);
  
  return token;
}
