import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const RED = '#EB0029';
const GRAY = '#5B6670';
const WHITE = '#FFFFFF';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function submit() {
    setError('');
    if (!email || !password) return setError('Completa ambos campos');
    // Simular login exitoso
    router.replace('/' as any);
  }

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/maya.png')} style={styles.maya} />
      <Text style={styles.title}>Iniciar sesión</Text>

      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={[styles.cta, { backgroundColor: RED }]} onPress={submit}>
        <Text style={styles.ctaText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: WHITE },
  maya: { width: 160, height: 160, alignSelf: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: GRAY, textAlign: 'center', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e6e6e6', padding: 12, borderRadius: 8, marginBottom: 12 },
  error: { color: 'red', marginBottom: 12 },
  cta: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  ctaText: { color: WHITE, fontWeight: '700' },
});
