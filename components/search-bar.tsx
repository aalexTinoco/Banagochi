import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
// small presentational search bar

export default function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <View style={styles.wrap}>
      <TextInput placeholder={placeholder || 'Buscar...'} value={value} onChangeText={onChange} style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 6 },
  input: { height: 44, borderRadius: 10, backgroundColor: '#fff', paddingHorizontal: 12, borderWidth: 1, borderColor: '#eef2f6' },
});
