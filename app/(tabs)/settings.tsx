import Header from '@/components/header';
import ProfileCard from '@/components/profile-card';
import { GRAY, LIGHT_GRAY, RED, WHITE } from '@/css/globalcss';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');

  function handleLogout() {
    // TODO: clear auth tokens / storage when available
    router.replace('/');
  }

  return (
    <View style={styles.container}>
      <Header showBack={false} onRightPress={() => {}} rightIconName="log-out-outline" />

      <ScrollView contentContainerStyle={styles.body}>
        <ProfileCard name="Alejandro" email="alejandro@example.com" />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/projects' as any)}>
            <Text style={styles.rowText}>Proyectos</Text>
            <Text style={styles.rowHint}>Ver todos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/completed' as any)}>
            <Text style={styles.rowText}>Proyectos completados</Text>
            <Text style={styles.rowHint}>Historial</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seguridad</Text>
          <TouchableOpacity style={styles.row} onPress={() => setPasswordModalVisible(true)}>
            <Text style={styles.rowText}>Cambiar contraseña</Text>
            <Text style={styles.rowHint}>••••••••</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte y legal</Text>
          <TouchableOpacity style={styles.row} onPress={() => {}}>
            <Text style={styles.rowText}>Centro de ayuda</Text>
            <Text style={styles.rowHint}>Preguntas frecuentes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => {}}>
            <Text style={styles.rowText}>Términos y condiciones</Text>
            <Text style={styles.rowHint}>Ver</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logoutWrap}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal visible={passwordModalVisible} animationType="slide" transparent>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.content}>
            <Text style={modalStyles.title}>Cambiar contraseña</Text>
            {pwdError ? <Text style={modalStyles.error}>{pwdError}</Text> : null}
            <TextInput placeholder="Contraseña actual" secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} style={modalStyles.input} />
            <TextInput placeholder="Nueva contraseña" secureTextEntry value={newPassword} onChangeText={setNewPassword} style={modalStyles.input} />
            <TextInput placeholder="Confirmar nueva contraseña" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} style={modalStyles.input} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <TouchableOpacity style={modalStyles.cancel} onPress={() => { setPasswordModalVisible(false); setPwdError(''); }}>
                <Text style={{ color: GRAY }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.save} onPress={() => {
                setPwdError('');
                if (!currentPassword || !newPassword || !confirmPassword) return setPwdError('Completa todos los campos');
                if (newPassword !== confirmPassword) return setPwdError('Las contraseñas no coinciden');
                // mock save
                setPasswordModalVisible(false);
                setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
              }}>
                <Text style={{ color: WHITE }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE },
  body: { padding: 20 },
  profileCard: { backgroundColor: '#fff', padding: 18, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, alignItems: 'center' },
  profileImage: { width: 84, height: 84, borderRadius: 42, marginBottom: 8 },
  profileName: { fontSize: 20, fontWeight: '800', color: GRAY, marginTop: 6 },
  profileEmail: { color: '#8a9096', marginTop: 4 },
  section: { marginBottom: 18 },
  sectionTitle: { color: GRAY, fontWeight: '700', marginBottom: 8 },
  row: { backgroundColor: '#fff', padding: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  rowText: { color: GRAY, fontWeight: '700' },
  rowHint: { color: '#9aa0a6' },
  logoutWrap: { marginTop: 24, alignItems: 'center' },
  logoutButton: { backgroundColor: RED, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  logoutText: { color: WHITE, fontWeight: '800' },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  content: { backgroundColor: WHITE, borderRadius: 12, padding: 16 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 8, color: GRAY },
  error: { color: RED, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: LIGHT_GRAY, padding: 12, borderRadius: 10, marginBottom: 8 },
  cancel: { padding: 10 },
  save: { backgroundColor: RED, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
});
