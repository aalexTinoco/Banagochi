import { RED } from '@/css/globalcss';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PhotoCapture({ uri, onTake, label }: { uri?: string | null; onTake: () => void; label?: string }) {
  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      {uri ? (
        <Image source={{ uri }} style={{ width: 180, height: 180, borderRadius: 12, marginBottom: 12 }} />
      ) : null}
      <TouchableOpacity style={[styles.button, { maxWidth: 240 }]} onPress={onTake} activeOpacity={0.8}>
        <Text style={[styles.buttonText]}>{uri ? 'REPETIR FOTO' : (label || 'TOMAR FOTO')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: { width: '100%', paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: RED },
  buttonText: { color: '#fff', fontWeight: '800' },
});
