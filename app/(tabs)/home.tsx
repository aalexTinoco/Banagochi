import CardCarousel from '@/components/card-carousel';
import Header from '@/components/header';
import { GRAY, LIGHT_GRAY, RED, WHITE } from '@/css/globalcss';
import Constants from 'expo-constants';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { useUser } from '@/app/state/user-store';
import { clearUser } from '@/app/state/user-store';
import { API, type CreditCard, type Project, type Transaction } from '@/services/api';


// CardCarousel was moved to components/card-carousel.tsx

export default function HomeScreen() {
  const router = useRouter();
  const user = useUser();
  
  // State
  const [cards, setCards] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load data from API
  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      // Cargar tarjetas del usuario
      const cardsResponse = await API.cards.getUserCards(user.id);
      console.log('📥 Tarjetas recibidas del servidor:', cardsResponse);
      
      // El backend puede devolver un array directamente o un objeto con propiedad 'cards'
      const cardsArray = Array.isArray(cardsResponse) ? cardsResponse : (cardsResponse.cards || []);
      
      if (cardsArray && cardsArray.length > 0) {
        const formattedCards = cardsArray.map((card: any) => ({
          id: card._id,
          last4: card.last4 || card.cardNumber?.slice(-4) || '****',
          type: card.type === 'banortemujer' ? 'Banorte Mujer' : 
                card.type === 'banorteclasica' ? 'Banorte TDC Clásica' : 
                'Banorte TDC Oro',
          balance: card.maxCredit - card.creditUsed,
          currency: 'MXN',
          color: '#1E2A3A',
          image: card.type === 'banortemujer' 
            ? require('@/assets/images/Banorte_Mujer.png')
            : card.type === 'banorteclasica'
            ? require('@/assets/images/Banorte-TDC-Clasica.avif')
            : require('@/assets/images/Banorte-TDC-Oro.avif')
        }));
        
        console.log('✅ Tarjetas formateadas:', formattedCards);
        setCards(formattedCards);
      } else {
        console.log('⚠️ No hay tarjetas disponibles');
        setCards([]);
      }

      // Cargar proyectos del usuario
      const userProjectsRes: any = await API.projects.getProjectsByProposer(user.id);
      let userProjectsResponse: Project[] = [];
      
      if (Array.isArray(userProjectsRes)) {
        userProjectsResponse = userProjectsRes;
      } else if (userProjectsRes.project) {
        userProjectsResponse = [userProjectsRes.project];
      } else if (userProjectsRes.projects) {
        userProjectsResponse = userProjectsRes.projects;
      } else if (userProjectsRes.data) {
        userProjectsResponse = Array.isArray(userProjectsRes.data) ? userProjectsRes.data : [userProjectsRes.data];
      }
      
      console.log('📊 Proyectos del usuario:', userProjectsResponse.length);
      
      // Cargar transacciones del usuario para ver proyectos donde colabora
      const transactionsResponse = await API.transactions.getUserTransactions(user.id);
      
      // Combinar proyectos donde es proposer con proyectos donde ha colaborado
      const projectIds = new Set<string>();
      const projectsData: any[] = [];
      
      // Proyectos donde es proposer
      if (userProjectsResponse && userProjectsResponse.length > 0) {
        userProjectsResponse.forEach((p: Project) => {
          if (!projectIds.has(p._id)) {
            projectIds.add(p._id);
            projectsData.push({
              id: p._id,
              title: p.title,
              role: 'Organizador',
              progress: Math.round((p.currentAmount / p.fundingGoal) * 100),
            });
          }
        });
      }
      
      // Proyectos donde ha colaborado (de las transacciones)
      if (transactionsResponse?.transactions) {
        const collaboratedProjects = new Map<string, number>();
        
        transactionsResponse.transactions.forEach((t: Transaction) => {
          if (t.projectId && !projectIds.has(t.projectId)) {
            collaboratedProjects.set(t.projectId, (collaboratedProjects.get(t.projectId) || 0) + t.amount);
          }
        });
        
        // Cargar info completa de proyectos colaborados
        for (const [projectId] of collaboratedProjects) {
          try {
            const projectRes = await API.projects.getProjectById(projectId);
            const project = projectRes.project;
            if (project && !projectIds.has(project._id) && project.status !== 'COMPLETED') {
              projectIds.add(project._id);
              projectsData.push({
                id: project._id,
                title: project.title,
                role: 'Colaborador',
                progress: Math.round((project.currentAmount / project.fundingGoal) * 100),
              });
            }
          } catch (error) {
            console.error('Error loading collaborated project:', error);
          }
        }
      }
      
      setProjects(projectsData.slice(0, 5)); // Mostrar máximo 5
      
      // Actividad reciente (transacciones recientes)
      if (transactionsResponse?.transactions) {
        const recent = transactionsResponse.transactions
          .slice(0, 3)
          .map((t: Transaction, idx: number) => {
            // projectId es solo un string, necesitamos cargar el proyecto
            const timeAgo = Math.floor((Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60));
            return {
              id: `a${idx + 1}`,
              text: `Tu donación de $${t.amount} a un proyecto`,
              time: timeAgo < 24 ? `${timeAgo}h` : `${Math.floor(timeAgo / 24)}d`
            };
          });
        setRecentActivity(recent);
      }
      
      // Proyectos completados
      const allProjectsRes: any = await API.projects.getAllProjects();
      let allProjects: Project[] = [];
      
      if (Array.isArray(allProjectsRes)) {
        allProjects = allProjectsRes;
      } else if (allProjectsRes.project) {
        allProjects = [allProjectsRes.project];
      } else if (allProjectsRes.projects) {
        allProjects = allProjectsRes.projects;
      } else if (allProjectsRes.data) {
        allProjects = Array.isArray(allProjectsRes.data) ? allProjectsRes.data : [allProjectsRes.data];
      }
      
      const completed = allProjects
        .filter((p: Project) => p.status === 'COMPLETED' && transactionsResponse?.transactions?.some((t: Transaction) => {
          return t.projectId === p._id;
        }))
        .map((p: Project) => ({
          id: p._id,
          title: p.title,
          completedAt: p.updatedDate || p.creationDate,
        }))
        .slice(0, 3);
      setCompletedProjects(completed);
      
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Recargar datos cuando la pantalla recibe el foco
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadData();
      }
    }, [user])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    await clearUser();
    router.replace('/');
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Header onRightPress={() => router.replace('/')} showBack={false} rightIconName="log-out-outline" rightAccessibilityLabel="Cerrar sesión" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: GRAY }}>No hay sesión activa</Text>
          <TouchableOpacity onPress={() => router.replace('/')} style={{ marginTop: 20 }}>
            <Text style={{ color: RED, fontWeight: '700' }}>Ir a inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header onRightPress={handleLogout} showBack={false} rightIconName="log-out-outline" rightAccessibilityLabel="Cerrar sesión" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={RED} />
          <Text style={{ marginTop: 16, color: GRAY }}>Cargando datos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onRightPress={handleLogout} showBack={false} rightIconName="log-out-outline" rightAccessibilityLabel="Cerrar sesión" />

      <ScrollView 
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={RED} />
        }
      >
        <CardCarousel name={user.name} cards={cards.length > 0 ? cards : [
          { id: 'default', last4: '****', type: 'Sin tarjetas', balance: 0, currency: 'MXN', color: '#1E2A3A', image: require('@/assets/images/Banorte_Mujer.png') }
        ]} />

        {/* Sections below the carousel: project goals, recent movements, credit proposals, completed projects */}
        <View style={styles.sections}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Metas en proyectos</Text>
            {projects.length > 0 ? projects.map(p => (
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
            )) : (
              <Text style={styles.emptyText}>No tienes proyectos activos</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Movimientos recientes</Text>
            {recentActivity.length > 0 ? recentActivity.map(a => (
              <View key={a.id} style={styles.activityRow}>
                <Text style={styles.activityText}>{a.text}</Text>
                <Text style={styles.activityTime}>{a.time}</Text>
              </View>
            )) : (
              <Text style={styles.emptyText}>No hay actividad reciente</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Proyectos completados</Text>
            {completedProjects.length > 0 ? completedProjects.map(f => (
              <View key={f.id} style={styles.itemCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{f.title}</Text>
                  <Text style={styles.itemSubtitle}>Completado {new Date(f.completedAt).toLocaleDateString()}</Text>
                </View>
                <TouchableOpacity style={styles.smallButton} onPress={() => router.push(`/projects/${f.id}` as any)}>
                  <Text style={styles.smallButtonText}>Ver</Text>
                </TouchableOpacity>
              </View>
            )) : (
              <Text style={styles.emptyText}>Aún no has completado proyectos</Text>
            )}
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

  emptyText: {
    color: '#9aa0a6',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },

  // removed quick actions - keep styles minimal for mobile
});


