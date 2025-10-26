import { LIGHT_GRAY, RED } from '@/css/globalcss';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function ProgressBar({ percent }: { percent: number }) {
  return (
    <View style={styles.container}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, percent))}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 400, alignSelf: 'center', height: 8, backgroundColor: LIGHT_GRAY, borderRadius: 4, overflow: 'hidden', marginTop: 8 },
  fill: { height: '100%', backgroundColor: RED, borderRadius: 4 },
});
