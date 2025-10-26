import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { loadUserFromStorage } from '@/app/state/user-store';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    // Load user from storage on app startup
    loadUserFromStorage().finally(() => {
      setIsLoadingUser(false);
    });
  }, []);

  if (isLoadingUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E30613" />
      </View>
    );
  }

  // For simplicity use the default (light) navigation theme.
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
