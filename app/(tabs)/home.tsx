import CardCarousel from '@/components/card-carousel';
import Header from '@/components/header';
import { GRAY, LIGHT_GRAY, RED, WHITE } from '@/css/globalcss';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


// CardCarousel was moved to components/card-carousel.tsx

export default function HomeScreen() {
  const router = useRouter();

  // Example/mock user data. In real usage pass this from your auth/user context.
  const userName = 'Alejandro';
  const cards = [
    { id: 'mujer', last4: '4321', type: 'Banorte Mujer', balance: 2540.32, currency: 'MXN', color: '#1E2A3A', image: require('@/assets/images/Banorte_Mujer.png') },
    { id: 'clasica', last4: '9876', type: 'Banorte TDC Clásica', balance: 12000.0, currency: 'MXN', color: '#1E2A3A', image: require('@/assets/images/Banorte-TDC-Clasica.avif') },
    { id: 'oro', last4: '5566', type: 'Banorte TDC Oro', balance: 320.5, currency: 'MXN', color: '#1E2A3A', image: require('@/assets/images/Banorte-TDC-Oro.avif') },
  ];

  return (
    <View style={styles.container}>
      <Header onRightPress={() => router.replace('/')} showBack={false} rightIconName="log-out-outline" rightAccessibilityLabel="Cerrar sesión" />

      <ScrollView contentContainerStyle={styles.body}>
        <CardCarousel name={userName} cards={cards} />

        {/* Sections below the carousel: project goals, recent movements, credit proposals, completed projects */}
        <View style={styles.sections}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Metas en proyectos</Text>
            {[
              { id: 'p1', title: 'Mejorar alumbrado público', progress: 62, role: 'Colaborador' },
              { id: 'p2', title: 'Parque comunitario', progress: 28, role: 'Organizador' },
            ].map(p => (
              <TouchableOpacity key={p.id} style={styles.itemCard} onPress={() => router.push(`/projects/${p.id}` as any)} activeOpacity={0.8}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{p.title}</Text>
                  <Text style={styles.itemSubtitle}>{p.role}</Text>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressFill, { width: `${p.progress}%` }]} />
                  </View>
                </View>
                <View style={styles.itemBadge}><Text style={styles.itemBadgeText}>{p.progress}%</Text></View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Movimientos recientes</Text>
            {[{
              id: 'a1', text: 'Tu donación de $150 a Parque comunitario', time: '2h'
            }, {
              id: 'a2', text: 'María comentó en Mejorar alumbrado público', time: '5h'
            }, {
              id: 'a3', text: 'Se ha aprobado el presupuesto inicial para Parq. comunitario', time: '1d'
            }].map(a => (
              <View key={a.id} style={styles.activityRow}>
                <Text style={styles.activityText}>{a.text}</Text>
                <Text style={styles.activityTime}>{a.time}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Propuestas de crédito y financiación</Text>
            {[{ id: 'c1', title: 'Microcrédito para emprendedores', amount: 50000, status: 'En revisión' }].map(c => (
              <View key={c.id} style={styles.itemCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{c.title}</Text>
                  <Text style={styles.itemSubtitle}>${c.amount.toLocaleString()} • {c.status}</Text>
                </View>
                <TouchableOpacity style={styles.smallButton} onPress={() => router.push(`/credit/${c.id}` as any)}>
                  <Text style={styles.smallButtonText}>Ver</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Proyectos completados</Text>
            {[{ id: 'f1', title: 'Reciclaje vecinal', completedAt: '2025-09-22' }].map(f => (
              <View key={f.id} style={styles.itemCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{f.title}</Text>
                  <Text style={styles.itemSubtitle}>Completado {new Date(f.completedAt).toLocaleDateString()}</Text>
                </View>
                <TouchableOpacity style={styles.smallButton} onPress={() => router.push(`/projects/${f.id}` as any)}>
                  <Text style={styles.smallButtonText}>Ver</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE },
  header: { width: '100%', paddingHorizontal: 24, marginTop: Constants.statusBarHeight + 10, marginBottom: 40 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  headerLogoGroup: { flexDirection: 'row', alignItems: 'center' },
  headerLogo: { width: 45, height: 45, marginRight: 8 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: RED },

  backButton: { position: 'absolute', left: 0, padding: 6 },

  signOut: { position: 'absolute', right: 0, padding: 6, flexDirection: 'row', alignItems: 'center' },
  signOutText: { color: GRAY, marginLeft: 6, fontWeight: '600', fontSize: 13 },

  body: { paddingHorizontal: 16, paddingBottom: 40 },
  carouselContainer: { marginTop: 12, marginBottom: 20, alignItems: 'center' },
  welcome: { fontSize: 18, color: GRAY, marginBottom: 6 },
  subtitle: { color: GRAY, marginBottom: 12 },
  card: {
    marginHorizontal: 8,
    borderRadius: 14,
    padding: 18,
  height: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardType: { color: WHITE, fontWeight: '700' },
  cardBalance: { color: WHITE, fontWeight: '700', marginTop: 22 },
  cardNumber: { color: 'rgba(255,255,255,0.95)', fontSize: 22, fontWeight: '800', letterSpacing: 3 },
  cardFooter: { alignItems: 'flex-end' },
  useText: { color: 'rgba(255,255,255,0.95)', fontWeight: '700' },

  cardImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },
  cardOverlay: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  cardFooterSelected: {
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  selectedBadgeText: {
    color: WHITE,
    marginLeft: 8,
    fontWeight: '700',
  },

  actionWrapper: {
    marginTop: 16,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: RED,
  },
  primaryOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: RED,
  },
  primaryText: { color: WHITE, fontWeight: '800' },
  primaryOutlineText: { color: RED, fontWeight: '800' },
  buttonText: { fontSize: 16 },

  pager: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  dot: { height: 8, backgroundColor: LIGHT_GRAY, borderRadius: 8, marginHorizontal: 6, width: 8 },

  sections: { width: '100%', maxWidth: 820, marginTop: 18 },
  section: { marginBottom: 18, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: GRAY, marginBottom: 10 },
  itemCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  itemTitle: { fontSize: 15, fontWeight: '700', color: GRAY },
  itemSubtitle: { fontSize: 13, color: '#7a8288', marginTop: 4 },
  itemBadge: { backgroundColor: LIGHT_GRAY, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 10 },
  itemBadgeText: { color: GRAY, fontWeight: '700' },

  activityRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  activityText: { color: GRAY, flex: 1 },
  activityTime: { color: '#9aa0a6', marginLeft: 8 },

  smallButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: LIGHT_GRAY },
  smallButtonText: { color: GRAY, fontWeight: '700' },

  progressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: RED,
  },

  // removed quick actions - keep styles minimal for mobile
});


