import { GRAY, RED, WHITE } from '@/css/globalcss';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onRightPress?: () => void;
  rightIconName?: string;
  rightAccessibilityLabel?: string;
};

export default function Header({
  title = 'Smart Cities',
  showBack = false,
  onBack,
  onRightPress,
  rightIconName = 'log-in-outline',
  rightAccessibilityLabel = 'Acción'
}: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {showBack ? (
          <TouchableOpacity style={styles.backButton} onPress={onBack} accessibilityRole="button" accessibilityLabel="Volver">
            <Ionicons name="arrow-back-outline" size={28} color={GRAY} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}

        <View style={styles.logoGroup}>
          <Image source={require('@/assets/images/header-logo.png')} style={styles.headerLogo} contentFit="contain" />
          <Text style={styles.headerTitle}>{title}</Text>
        </View>

        {onRightPress ? (
          <TouchableOpacity style={styles.rightButton} onPress={onRightPress} accessibilityRole="button" accessibilityLabel={rightAccessibilityLabel}>
            <Ionicons name={rightIconName as any} size={22} color={GRAY} />
          </TouchableOpacity>
        ) : (
          <View style={styles.rightButtonPlaceholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingHorizontal: 24,
    marginTop: Constants.statusBarHeight + 10,
    marginBottom: 10,
    backgroundColor: WHITE,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: { position: 'absolute', left: 0, padding: 6 },
  backButtonPlaceholder: { position: 'absolute', left: 0, width: 40 },
  logoGroup: { flexDirection: 'row', alignItems: 'center' },
  headerLogo: { width: 45, height: 45, marginRight: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: RED },
  rightButton: { position: 'absolute', right: 0, padding: 6 },
  rightButtonPlaceholder: { position: 'absolute', right: 0, width: 40 },
});
