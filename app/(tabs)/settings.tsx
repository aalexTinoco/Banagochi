import Header from '@/components/header';
import ProfileCard from '@/components/profile-card';
import { GRAY, LIGHT_GRAY, RED, WHITE } from '@/css/globalcss';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { useUser, clearUser } from '@/app/state/user-store';
import { API, type Device } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();
  const user = useUser();
  
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [devicesModalVisible, setDevicesModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [devices, setDevices] = useState<Device[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  
  const [projectsCount, setProjectsCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // Load user statistics
  useEffect(() => {
    if (user?.id) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingStats(true);
      
      // Get user's projects
      const userProjects = await API.projects.getByProposer(user.id);
      
      // Get user's transactions to find participated projects
      const transactions = await API.transactions.getUserTransactions(user.id);
      
      // Count active projects
      const activeProjectsIds = new Set<string>();
      
      // Add projects where user is proposer
      userProjects.forEach(p => {
        if (p.status !== 'COMPLETED') {
          activeProjectsIds.add(p._id);
        }
      });
      
      // Add projects where user has donated
      if (transactions?.transactions) {
        transactions.transactions.forEach(t => {
          if (t.projectId) {
            activeProjectsIds.add(t.projectId);
          }
        });
      }
      
      setProjectsCount(activeProjectsIds.size);
      
      // Use impact summary if available
      if (user.impactSummary?.completedProjects !== undefined) {
        setCompletedCount(user.impactSummary.completedProjects);
      } else {
        // Count completed projects from transactions
        const allProjects = await API.projects.getAll();
        const completedProjects = allProjects.filter(p => 
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
      if (response.devices) {
        setDevices(response.devices);
      }
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
              loadDevices(); // Reload devices
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
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      return setPwdError('Completa todos los campos');
    }
    
    if (newPassword !== confirmPassword) {
      return setPwdError('Las contraseñas no coinciden');
    }
    
    if (newPassword.length < 8) {
      return setPwdError('La contraseña debe tener al menos 8 caracteres');
    }
    
    setIsChangingPassword(true);
    
    try {
      // Note: You'll need to implement this endpoint in your API
      // For now, we'll show a message that this feature is not available
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
        <ProfileCard name={user.name} email={user.email} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/(tabs)/projects' as any)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="folder-outline" size={20} color={GRAY} style={{ marginRight: 8 }} />
              <Text style={styles.rowText}>Proyectos activos</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {loadingStats ? (
                <ActivityIndicator size="small" color={GRAY} />
              ) : (
                <Text style={styles.rowHint}>{projectsCount}</Text>
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.row} onPress={() => router.push('/(tabs)/projects' as any)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="checkmark-circle-outline" size={20} color={GRAY} style={{ marginRight: 8 }} />
              <Text style={styles.rowText}>Proyectos completados</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {loadingStats ? (
                <ActivityIndicator size="small" color={GRAY} />
              ) : (
                <Text style={styles.rowHint}>{completedCount}</Text>
              )}
            </View>
          </TouchableOpacity>

          {user.impactSummary && (
            <TouchableOpacity style={styles.row} onPress={() => {}}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="stats-chart-outline" size={20} color={GRAY} style={{ marginRight: 8 }} />
                <Text style={styles.rowText}>Total contribuido</Text>
              </View>
              <Text style={styles.rowHint}>${user.impactSummary.totalContributed.toLocaleString()}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seguridad</Text>
          <TouchableOpacity style={styles.row} onPress={() => setPasswordModalVisible(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="lock-closed-outline" size={20} color={GRAY} style={{ marginRight: 8 }} />
              <Text style={styles.rowText}>Cambiar contraseña</Text>
            </View>
            <Text style={styles.rowHint}>••••••••</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.row} 
            onPress={() => {
              setDevicesModalVisible(true);
              loadDevices();
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="phone-portrait-outline" size={20} color={GRAY} style={{ marginRight: 8 }} />
              <Text style={styles.rowText}>Dispositivos conectados</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9aa0a6" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información personal</Text>
          <TouchableOpacity style={styles.row} onPress={() => {}}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location-outline" size={20} color={GRAY} style={{ marginRight: 8 }} />
              <Text style={styles.rowText}>Colonia</Text>
            </View>
            <Text style={styles.rowHint}>{user.colony || 'No especificada'}</Text>
          </TouchableOpacity>
          
          {user.domicilio && (
            <TouchableOpacity style={styles.row} onPress={() => {}}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="home-outline" size={20} color={GRAY} style={{ marginRight: 8 }} />
                <Text style={styles.rowText}>Domicilio</Text>
              </View>
              <Text style={[styles.rowHint, { maxWidth: 200 }]} numberOfLines={1}>{user.domicilio}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte y legal</Text>
          <TouchableOpacity style={styles.row} onPress={() => {}}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="help-circle-outline" size={20} color={GRAY} style={{ marginRight: 8 }} />
              <Text style={styles.rowText}>Centro de ayuda</Text>
            </View>
            <Text style={styles.rowHint}>Preguntas frecuentes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.row} onPress={() => {}}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="document-text-outline" size={20} color={GRAY} style={{ marginRight: 8 }} />
              <Text style={styles.rowText}>Términos y condiciones</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9aa0a6" />
          </TouchableOpacity>
        </View>

        <View style={styles.logoutWrap}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={WHITE} style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Password Change Modal */}
      <Modal visible={passwordModalVisible} animationType="slide" transparent>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.content}>
            <Text style={modalStyles.title}>Cambiar contraseña</Text>
            {pwdError ? <Text style={modalStyles.error}>{pwdError}</Text> : null}
            
            <TextInput 
              placeholder="Contraseña actual" 
              secureTextEntry 
              value={currentPassword} 
              onChangeText={setCurrentPassword} 
              style={modalStyles.input}
              editable={!isChangingPassword}
            />
            
            <TextInput 
              placeholder="Nueva contraseña" 
              secureTextEntry 
              value={newPassword} 
              onChangeText={setNewPassword} 
              style={modalStyles.input}
              editable={!isChangingPassword}
            />
            
            <TextInput 
              placeholder="Confirmar nueva contraseña" 
              secureTextEntry 
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
              style={modalStyles.input}
              editable={!isChangingPassword}
            />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <TouchableOpacity 
                style={modalStyles.cancel} 
                onPress={() => { 
                  setPasswordModalVisible(false); 
                  setPwdError(''); 
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                disabled={isChangingPassword}
              >
                <Text style={{ color: GRAY }}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={modalStyles.save} 
                onPress={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <ActivityIndicator color={WHITE} size="small" />
                ) : (
                  <Text style={{ color: WHITE, fontWeight: '700' }}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Devices Modal */}
      <Modal visible={devicesModalVisible} animationType="slide">
        <View style={{ flex: 1, backgroundColor: WHITE }}>
          <Header 
            showBack 
            onBack={() => setDevicesModalVisible(false)} 
            onRightPress={() => setDevicesModalVisible(false)} 
            rightIconName="close" 
          />
          
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: GRAY, marginBottom: 8 }}>
              Dispositivos conectados
            </Text>
            <Text style={{ color: '#6b7280', marginBottom: 20 }}>
              Gestiona los dispositivos donde has iniciado sesión
            </Text>

            {loadingDevices ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={RED} />
                <Text style={{ marginTop: 16, color: GRAY }}>Cargando dispositivos...</Text>
              </View>
            ) : devices.length > 0 ? (
              devices.map((device, index) => (
                <View key={index} style={styles.deviceCard}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Ionicons 
                        name={device.deviceName.toLowerCase().includes('iphone') || device.deviceName.toLowerCase().includes('ipad') ? 'phone-portrait' : 'phone-portrait-outline'} 
                        size={20} 
                        color={GRAY} 
                        style={{ marginRight: 8 }} 
                      />
                      <Text style={{ fontSize: 16, fontWeight: '700', color: GRAY }}>
                        {device.deviceName}
                      </Text>
                    </View>
                    <Text style={{ color: '#6b7280', fontSize: 13 }}>
                      Último acceso: {new Date(device.lastLogin).toLocaleString()}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <View style={[
                        styles.statusDot, 
                        { backgroundColor: device.active ? '#10b981' : '#6b7280' }
                      ]} />
                      <Text style={{ fontSize: 12, color: '#6b7280' }}>
                        {device.active ? 'Activo' : 'Inactivo'}
                      </Text>
                    </View>
                  </View>
                  
                  {device.active && (
                    <TouchableOpacity 
                      style={styles.deviceLogoutButton}
                      onPress={() => handleLogoutDevice(device.deviceId, device.deviceName)}
                    >
                      <Text style={{ color: RED, fontSize: 13, fontWeight: '600' }}>
                        Cerrar sesión
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            ) : (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Ionicons name="phone-portrait-outline" size={64} color={LIGHT_GRAY} />
                <Text style={{ marginTop: 16, color: GRAY }}>No hay dispositivos registrados</Text>
              </View>
            )}
          </ScrollView>
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
  logoutButton: { backgroundColor: RED, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  logoutText: { color: WHITE, fontWeight: '800' },
  deviceCard: {
    backgroundColor: WHITE,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  deviceLogoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RED,
  },
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
