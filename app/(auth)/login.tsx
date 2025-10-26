import Header from '@/components/header';
import BiometricVerificationModal from '@/components/biometric-verification-modal';
import { GRAY, LIGHT_GRAY, RED, WHITE } from '@/css/globalcss';
import { useDeviceId } from '@/hooks/use-device-id';
import { AuthService, HttpError } from '@/services/api';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View 
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { deviceId, deviceName, loading: deviceLoading } = useDeviceId();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Biometric verification state
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  async function submit() {
    setError('');
    
    // Validation
    if (!email || !password) {
      return setError('Completa ambos campos');
    }

    if (!deviceId || !deviceName) {
      return setError('Error al obtener información del dispositivo');
    }

    setIsLoading(true);

    try {
      // Attempt login
      const response = await AuthService.login({
        email: email.trim(),
        password,
        deviceId,
        deviceName,
      });

      // Check if response indicates new device
      if ((response as any).isNewDevice) {
        // Store credentials for biometric verification
        setPendingCredentials({ email: email.trim(), password });
        setShowBiometricModal(true);
        setIsLoading(false);
        return;
      }

      // Successful login - check if we have a valid token
      if (response.token && response.user) {
        setIsLoading(false);
        
        // Navigate to home immediately
        router.replace('/(tabs)' as any);
        
        // Show success message after navigation
        setTimeout(() => {
          Alert.alert(
            '¡Bienvenido!',
            `Hola ${response.user.name}`
          );
        }, 500);
        
        return;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error instanceof HttpError) {
        // Check if it's a new device response
        if (error.data?.isNewDevice && error.data?.requiresBiometric) {
          setPendingCredentials({ email: email.trim(), password });
          setShowBiometricModal(true);
          return;
        }
        
        // Handle other HTTP errors
        if (error.status === 401) {
          setError('Email o contraseña incorrectos');
        } else if (error.status === 404) {
          setError('Usuario no encontrado');
        } else if (error.status >= 500) {
          setError('Error del servidor. Intenta más tarde');
        } else {
          setError(error.data?.message || 'Error al iniciar sesión');
        }
      } else {
        setError('Error de conexión. Verifica tu internet');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleBiometricSubmit(selfie: any, ine: any) {
    if (!pendingCredentials || !deviceId || !deviceName) {
      console.error('❌ Missing credentials:', {
        hasPendingCredentials: !!pendingCredentials,
        deviceId,
        deviceName,
      });
      Alert.alert('Error', 'Información incompleta');
      return;
    }

    console.log('🔐 Starting biometric verification:', {
      email: pendingCredentials.email,
      deviceId,
      deviceName,
      hasSelfie: !!selfie,
      hasIne: !!ine,
    });

    setIsLoading(true);

    try {
      // Login with biometric verification
      // Pass image objects directly - the service will format them for FormData
      const response = await AuthService.loginWithBiometric({
        email: pendingCredentials.email,
        password: pendingCredentials.password,
        deviceId,
        deviceName,
        selfie: selfie, // Pass the whole image object { uri, type, ... }
        ine: ine,       // Pass the whole image object { uri, type, ... }
      });

      console.log('✅ Biometric verification successful:', response);

      // Check if we have a valid token (success can be undefined in some responses)
      if (response.token && response.user) {
        setShowBiometricModal(false);
        setPendingCredentials(null);
        setIsLoading(false);
        
        // Navigate to home immediately
        router.replace('/(tabs)' as any);
        
        // Show success message after navigation
        setTimeout(() => {
          Alert.alert(
            '✅ Verificación exitosa',
            `¡Bienvenido ${response.user.name}! Tu dispositivo ha sido registrado correctamente.`
          );
        }, 500);
        
        return;
      }
    } catch (error: any) {
      console.error('❌ Biometric verification error:', error);
      
      let errorMessage = 'No se pudo verificar tu identidad';
      
      if (error instanceof HttpError) {
        if (error.status === 401) {
          errorMessage = 'Verificación biométrica fallida. Intenta de nuevo';
        } else if (error.data?.message) {
          errorMessage = error.data.message;
        }
      }
      
      Alert.alert('Error de verificación', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  function handleCloseBiometricModal() {
    setShowBiometricModal(false);
    setPendingCredentials(null);
    setError('');
  }

  const isValid = email.trim().length > 0 && password.trim().length > 0 && !deviceLoading;

  return (
    <>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <Header showBack onBack={() => router.replace('/' as any)} />
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
            editable={!isLoading}
          />

          <TextInput
            placeholder="Contraseña"
            value={password}
            onChangeText={(t) => { setPassword(t); setError(''); }}
            style={styles.input}
            secureTextEntry
            editable={!isLoading}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')} disabled={isLoading}>
              <Text style={styles.registerLink}>Registrar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.ctaWrapper}>
            <TouchableOpacity
              style={[styles.button, isValid && !isLoading ? styles.primary : styles.disabled]}
              onPress={submit}
              activeOpacity={0.85}
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={WHITE} />
              ) : (
                <Text style={[styles.buttonText, styles.primaryText]}>Entrar</Text>
              )}
            </TouchableOpacity>
          </View>

          {deviceLoading && (
            <View style={styles.deviceLoadingContainer}>
              <ActivityIndicator color={RED} size="small" />
              <Text style={styles.deviceLoadingText}>Cargando información del dispositivo...</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Biometric Verification Modal */}
      <BiometricVerificationModal
        visible={showBiometricModal}
        onClose={handleCloseBiometricModal}
        onSubmit={handleBiometricSubmit}
        isLoading={isLoading}
      />
    </>
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
  deviceLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  deviceLoadingText: {
    color: GRAY,
    fontSize: 13,
    marginLeft: 8,
  },
});
