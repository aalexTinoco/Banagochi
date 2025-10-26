/**
 * Root Index - Entry point of the app
 * Redirects to auth or home based on authentication status
 */

import { API } from '@/services/api';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        // Check if user has a valid token
        const token = API.auth.getToken();
        const userId = API.storage.getUserId();

        if (token && userId) {
          // User is authenticated, verify token is still valid
          try {
            await API.users.getUserById(userId);
            // Token is valid, go to home
            router.replace('/(tabs)/home' as any);
          } catch {
            // Token expired or invalid, clear auth and go to login
            API.auth.clearAuth();
            router.replace('/(auth)' as any);
          }
        } else {
          // No auth data, go to login
          router.replace('/(auth)' as any);
        }
      } catch (error) {
        // On any error, go to login
        console.error('Auth check error:', error);
        router.replace('/(auth)' as any);
      }
    };

    // Wait for the layout to mount before checking auth
    const timer = setTimeout(() => {
      void checkAuthAndNavigate();
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  // Show a loading indicator while checking auth
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#D32F2F" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
