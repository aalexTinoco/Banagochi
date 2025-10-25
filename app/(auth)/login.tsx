import { GRAY, LIGHT_GRAY, RED, WHITE } from '@/css/globalcss';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function submit() {
    setError('');
    if (!email || !password) return setError('Completa ambos campos');
    // Simular login exitoso
    router.replace('/home' as any);
  }

  const isValid = email.trim().length > 0 && password.trim().length > 0;

  const Header = ({ canGoBack = true }: { canGoBack?: boolean }) => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {canGoBack && (
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/' as any)}>
            <Ionicons name="arrow-back-outline" size={28} color={GRAY} />
          </TouchableOpacity>
        )}

        <View style={styles.headerLogoGroup}>
          <Image
            source={require('@/assets/images/header-logo.png')}
            style={styles.headerLogo}
            contentFit="contain"
          />
          <Text style={styles.headerTitle}>Smart Cities</Text>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Image source={require('@/assets/images/maya.png')} style={styles.maya} />
        <Text style={styles.title}>Iniciar sesión</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(t) => { setEmail(t); setError(''); }}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Contraseña"
          value={password}
          onChangeText={(t) => { setPassword(t); setError(''); }}
          style={styles.input}
          secureTextEntry
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerLink}>Registrar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ctaWrapper}>
          <TouchableOpacity
            style={[styles.button, isValid ? styles.primary : styles.disabled]}
            onPress={submit}
            activeOpacity={0.85}
            disabled={!isValid}
          >
            <Text style={[styles.buttonText, styles.primaryText]}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE },
  header: {
    width: '100%',
    paddingHorizontal: 24,
    marginTop: Constants.statusBarHeight + 6,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 4,
  },
  headerLogoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: RED,
  },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  maya: { width: 160, height: 160, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: GRAY, textAlign: 'center', marginBottom: 18 },
  input: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  errorText: { color: RED, marginBottom: 12, textAlign: 'center' },
  ctaWrapper: { width: '100%', maxWidth: 400, alignSelf: 'center', marginTop: 8 },
  button: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  primary: {
    backgroundColor: RED,
    shadowColor: '#C82909',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  primaryText: { color: WHITE, fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  disabled: { backgroundColor: LIGHT_GRAY, shadowOpacity: 0, elevation: 0 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  registerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 6 },
  registerText: { color: GRAY, fontSize: 14 },
  registerLink: { color: RED, fontSize: 14, fontWeight: '700', marginLeft: 6 },
});
