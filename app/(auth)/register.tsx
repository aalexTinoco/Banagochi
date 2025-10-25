import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const RED = '#EB0029';
const GRAY = '#5B6670';
const WHITE = '#FFFFFF';

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const dialogues = [
    '¡Hola! Soy Maya, tu guía en Smart Cities. 😊',
    'Aquí podrás consultar servicios y gestionar tu cuenta con Banorte.',
    'Te acompaño mientras completas tu registro — será rápido y seguro.',
  ];

  function nextDialogue() {
    if (step < dialogues.length - 1) setStep(step + 1);
    else setStep(dialogues.length); // move to form
  }

  function submit() {
    setError('');
    if (!name || !email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Aquí en el futuro se haría llamada al backend. Por ahora simulamos éxito.
    router.replace('/' as any);
  }

  if (step < dialogues.length) {
    return (
      <View style={styles.centered}>
        <Image source={require('@/assets/images/maya.png')} style={styles.maya} />
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{dialogues[step]}</Text>
        </View>
        <TouchableOpacity style={[styles.cta, { backgroundColor: RED }]} onPress={nextDialogue}>
          <Text style={styles.ctaText}>Siguiente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Image source={require('@/assets/images/maya.png')} style={styles.mayaSmall} />
          <Text style={styles.formTitle}>Registro</Text>
        </View>

        <TextInput placeholder="Nombre completo" value={name} onChangeText={setName} style={styles.input} />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
        <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        <TextInput placeholder="Confirmar contraseña" value={confirm} onChangeText={setConfirm} secureTextEntry style={styles.input} />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={[styles.cta, { backgroundColor: RED }]} onPress={submit}>
          <Text style={styles.ctaText}>Crear cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.link]} onPress={() => router.replace('/' as any)}>
          <Text style={{ color: GRAY }}>O volver a la app sin registrarme</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: WHITE },
  maya: { width: 220, height: 220, marginBottom: 16 },
  mayaSmall: { width: 64, height: 64, marginRight: 12 },
  bubble: { backgroundColor: WHITE, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#eee', maxWidth: '90%', marginBottom: 12 },
  bubbleText: { color: GRAY, fontSize: 16 },
  cta: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
  ctaText: { color: WHITE, fontWeight: '700' },
  formContainer: { padding: 24, paddingTop: 40, backgroundColor: WHITE, minHeight: '100%' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  formTitle: { fontSize: 24, fontWeight: '700', color: GRAY },
  input: { borderWidth: 1, borderColor: '#e6e6e6', padding: 12, borderRadius: 8, marginBottom: 12 },
  error: { color: 'red', marginBottom: 12 },
  link: { marginTop: 12, alignItems: 'center' },
});
