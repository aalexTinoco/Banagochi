import { GRAY } from '@/css/globalcss';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function ProfileCard({ name, email }: { name: string; email: string }) {
  return (
    <View style={styles.profileCard}>
      <Image source={require('@/assets/images/header-logo.png')} style={styles.profileImage} />
      <Text style={styles.profileName}>{name}</Text>
      <Text style={styles.profileEmail}>{email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: { backgroundColor: '#fff', padding: 18, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, alignItems: 'center' },
  profileImage: { width: 84, height: 84, borderRadius: 42, marginBottom: 8 },
  profileName: { fontSize: 20, fontWeight: '800', color: GRAY, marginTop: 6 },
  profileEmail: { color: '#8a9096', marginTop: 4 },
});
