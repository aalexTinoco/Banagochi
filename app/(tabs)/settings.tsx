import Header from '@/components/header';
import ProfileCard from '@/components/profile-card';
import { GRAY, LIGHT_GRAY, RED, WHITE } from '@/css/globalcss';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { useUser, clearUser } from '@/app/state/user-store';
import { API, type Device, type Project } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [projectsCount, setProjectsCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Cargar estadísticas del usuario
  useEffect(() => {
    if (user?.id) {
      loadUserStats();
      loadDevices();
    }
  }, [user]);

  const loadUserStats = async () => {
    if (!user?.id) return;

    try {
      setLoadingStats(true);

      const userProjectsRes = await API.projects.getProjectsByProposer(user.id);
      const userProjects = userProjectsRes.project ? [userProjectsRes.project] : [];

      const transactions = await API.transactions.getUserTransactions(user.id);

      const activeProjectsIds = new Set<string>();
      userProjects.forEach((p: Project) => {
        if (p.status !== 'COMPLETED') activeProjectsIds.add(p._id);
      });

      if (transactions?.transactions) {
        transactions.transactions.forEach(t => {
          if (t.projectId) activeProjectsIds.add(t.projectId);
        });
      }

      setProjectsCount(activeProjectsIds.size);

      if (user.impactSummary?.completedProjects !== undefined) {
        setCompletedCount(user.impactSummary.completedProjects);
      } else {
        const allProjectsRes = await API.projects.getAllProjects();
        const allProjects = allProjectsRes.project ? [allProjectsRes.project] : [];
        const completedProjects = allProjects.filter((p: Project) =>
          p.status === 'COMPLETED' &&
          transactions?.transactions?.some(t => t.projectId === p._id)
        );
        setCompletedCount(completedProjects.length);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadDevices = async () => {
    if (!user?.id) return;

    try {
      setLoadingDevices(true);
      const response = await API.users.getUserDevices(user.id);
      if (response.devices) setDevices(response.devices);
    } catch (error) {
      console.error('Error loading devices:', error);
      Alert.alert('Error', 'No se pudieron cargar los dispositivos');
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleLogoutDevice = async (deviceId: string, deviceName: string) => {
    if (!user?.id) return;

    Alert.alert(
      'Cerrar sesión en dispositivo',
      `¿Estás seguro de cerrar sesión en "${deviceName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await API.users.logoutDevice(user.id, { deviceId });
              Alert.alert('Éxito', 'Sesión cerrada en el dispositivo');
              loadDevices();
            } catch (error) {
              console.error('Error logging out device:', error);
              Alert.alert('Error', 'No se pudo cerrar la sesión en el dispositivo');
            }
          }
        }
      ]
    );
  };

  const handleChangePassword = async () => {
    setPwdError('');

    if (!currentPassword || !newPassword || !confirmPassword)
      return setPwdError('Completa todos los campos');

    if (newPassword !== confirmPassword)
      return setPwdError('Las contraseñas no coinciden');

    if (newPassword.length < 8)
      return setPwdError('La contraseña debe tener al menos 8 caracteres');

    setIsChangingPassword(true);

    try {
      Alert.alert(
        'Función no disponible',
        'El cambio de contraseña aún no está implementado en el API. Contacta al administrador.',
        [{ text: 'OK' }]
      );

      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      setPwdError(error?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setIsChangingPassword(false);
    }
  };

  async function handleLogout() {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await clearUser();
            router.replace('/');
          }
        }
      ]
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Header showBack={false} onRightPress={() => router.replace('/')} rightIconName="log-out-outline" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: GRAY }}>No hay sesión activa</Text>
          <TouchableOpacity onPress={() => router.replace('/')} style={{ marginTop: 20 }}>
            <Text style={{ color: RED, fontWeight: '700' }}>Ir a inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header showBack={false} onRightPress={handleLogout} rightIconName="log-out-outline" />

      <ScrollView contentContainerStyle={styles.body}>
        <ProfileCard name={user.name || 'Usuario'} email={user.email || 'Sin correo'} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/projects' as any)}>
            <Text style={styles.rowText}>Proyectos activos</Text>
            <Text style={styles.rowHint}>{loadingStats ? 'Cargando...' : `${projectsCount}`}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/completed' as any)}>
            <Text style={styles.rowText}>Proyectos completados</Text>
            <Text style={styles.rowHint}>{loadingStats ? 'Cargando...' : `${completedCount}`}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dispositivos</Text>
          {loadingDevices ? (
            <ActivityIndicator color={RED} />
          ) : (
            devices.map((d) => (
              <TouchableOpacity key={d.id} style={styles.row} onPress={() => handleLogoutDevice(d.id, d.name)}>
                <Text style={styles.rowText}>{d.name}</Text>
                <Ionicons name="log-out-outline" size={18} color={RED} />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seguridad</Text>
          <TouchableOpacity style={styles.row} onPress={() => setPasswordModalVisible(true)}>
            <Text style={styles.rowText}>Cambiar contraseña</Text>
            <Text style={styles.rowHint}>••••••••</Text>
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
              <TouchableOpacity style={modalStyles.save} onPress={handleChangePassword}>
                <Text style={{ color: WHITE }}>{isChangingPassword ? 'Guardando...' : 'Guardar'}</Text>
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
