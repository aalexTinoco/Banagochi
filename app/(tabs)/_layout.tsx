import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import ChatAgent from '@/components/chat-agent';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RED } from '@/css/globalcss';

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          // Active tint color uses app RED from globalcss
          tabBarActiveTintColor: RED,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Configuración',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
          }}
        />
      </Tabs>

      {/* Chat agent floating trigger — rendered on all tab screens and positioned above navigator */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 90, zIndex: 9999 }} pointerEvents="box-none">
        <ChatAgent />
      </View>
    </>
  );
}
