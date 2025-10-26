import Header from '@/components/header';
import ProjectCard from '@/components/project-card';
import ProjectModal from '@/components/project-modal';
import CreateProjectModal from '@/components/create-project-modal';
import { GRAY, LIGHT_GRAY, RED, WHITE } from '@/css/globalcss';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useUser } from '@/app/state/user-store';
import { API, type Project as APIProject } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';

// Local Project type for UI
type UIProject = {
  id: string;
  title: string;
  role?: string;
  donated: number;
  goal: number;
  recentMovements?: Array<{ id: string; name?: string; amount?: number; time: string; date?: string }>;
  image?: any;
  description?: string;
  colonia?: string;
  status?: string;
  coverImage?: string;
};


export default function ProjectsScreen() {
  const router = useRouter();
  const user = useUser();
  
  const [selected, setSelected] = useState<UIProject | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [projects, setProjects] = useState<UIProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load projects from API
  const loadProjects = async () => {
    try {
      setIsLoading(true);
      console.log('📥 Cargando proyectos activos...');
      
      const response: any = await API.projects.getAllProjects();
      console.log('📦 Respuesta del API:', response);
      
      // Handle both array and object response formats
      let allProjects: APIProject[] = [];
      
      if (Array.isArray(response)) {
        allProjects = response;
      } else if (response.project) {
        // Single project wrapped in object
        allProjects = [response.project];
      } else if (response.projects) {
        // Multiple projects in object
        allProjects = response.projects;
      } else if (response.data) {
        allProjects = Array.isArray(response.data) ? response.data : [response.data];
      }
      
      console.log('✅ Proyectos encontrados:', allProjects.length);
      
      // Transform API projects to UI format
      const uiProjects: UIProject[] = allProjects.map((p: APIProject) => ({
        id: p._id,
        title: p.title,
        description: p.description,
        colonia: p.colonia,
        donated: p.currentAmount,
        goal: p.fundingGoal,
        status: p.status,
        coverImage: p.coverImage,
        image: p.coverImage ? { uri: p.coverImage } : require('@/assets/images/Banorte-TDC-Basica-.avif'),
        recentMovements: [], // Se cargarían desde transacciones si es necesario
      }));
      
      console.log('🎯 Proyectos UI formateados:', uiProjects.length);
      setProjects(uiProjects);
    } catch (error) {
      console.error('❌ Error loading projects:', error);
      Alert.alert('Error', 'No se pudieron cargar los proyectos');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProjects();
  };

  const handleCreateProject = () => {
    setCreateModalVisible(true);
  };

  const handleProjectCreated = () => {
    setCreateModalVisible(false);
    loadProjects(); // Reload projects after creation
  };

  // dynamic suggestions derived from projects and selected project
  const suggestions = useMemo(() => {
    const items: { id: string; title: string }[] = [];
    const active = projects.filter(p => p.status !== 'COMPLETED' && p.donated < p.goal);
    const completed = projects.filter(p => p.status === 'COMPLETED' || p.donated >= p.goal);

    // If a project is selected, prioritize suggestions for it
    if (selected) {
      if (selected.donated < selected.goal && selected.status !== 'COMPLETED') {
        items.push({ id: `promote_${selected.id}`, title: `Promocionar "${selected.title}" para alcanzar la meta` });
        items.push({ id: `event_${selected.id}`, title: `Organizar un evento/actividad para "${selected.title}"` });
        items.push({ id: `match_${selected.id}`, title: `Buscar patrocinador que haga matches para "${selected.title}"` });
      } else {
        items.push({ id: `share_${selected.id}`, title: `Compartir resultados y agradecimientos por "${selected.title}"` });
        items.push({ id: `case_${selected.id}`, title: `Crear caso de éxito para "${selected.title}"` });
      }
    }

    // General suggestions based on counts of active/completed projects
    if (active.length > 0) {
      items.push({ id: 'active_summary', title: `Hay ${active.length} proyecto(s) activos. Considera una campaña conjunta.` });
    }
    if (completed.length > 0) {
      items.push({ id: 'completed_summary', title: `${completed.length} proyecto(s) completados. Publicar resultados y testimonios.` });
    }

    // Suggest outreach if there are few donors overall
    const totalDonors = new Set(projects.flatMap(p => (p.recentMovements ?? []).map(m => m.name ?? 'Anónimo'))).size;
    if (totalDonors < 3 && active.length > 0) {
      items.push({ id: 'outreach', title: 'Pocos donantes registrados — planificar estrategia de outreach para aumentar donaciones.' });
    }

    return items;
  }, [projects, selected]);

  const windowW = useWindowDimensions().width;
  const cardW = Math.min(windowW - 96, 320);

  const openProject = (p: UIProject) => {
    setSelected(p);
    setModalVisible(true);
  };

  const completedProjects = useMemo(() => {
    return projects.filter(p => p.status === 'COMPLETED' || p.donated >= p.goal);
  }, [projects]);

  const activeProjects = useMemo(() => {
    return projects.filter(p => p.status !== 'COMPLETED' && p.donated < p.goal);
  }, [projects]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Header showBack={false} rightIconName="log-out-outline" onRightPress={() => router.replace('/')} rightAccessibilityLabel="Cerrar sesión" />
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
        <Header showBack={false} rightIconName="log-out-outline" onRightPress={() => router.replace('/')} rightAccessibilityLabel="Cerrar sesión" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={RED} />
          <Text style={{ marginTop: 16, color: GRAY }}>Cargando proyectos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header showBack={false} rightIconName="log-out-outline" onRightPress={() => router.replace('/')} rightAccessibilityLabel="Cerrar sesión" />

      <ScrollView 
        contentContainerStyle={styles.body}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={RED} />
        }
      >
        {/* Header with create button */}
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Proyectos activos</Text>
          <TouchableOpacity onPress={handleCreateProject} style={styles.createButton}>
            <Ionicons name="add-circle" size={24} color={RED} />
            <Text style={styles.createButtonText}>Crear</Text>
          </TouchableOpacity>
        </View>

        {/* Carousel of active projects */}
        {activeProjects.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16, paddingRight: 32 }}>
            {activeProjects.map((p) => (
              <ProjectCard key={p.id} project={p} width={cardW} onPress={() => openProject(p)} />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>No hay proyectos activos</Text>
        )}

        {/* Completed section below */}
        <View style={{ marginTop: 22 }}>
          <Text style={styles.sectionTitle}>Completados</Text>
          {completedProjects.length > 0 ? completedProjects.slice(0, 5).map((c) => (
            <TouchableOpacity key={c.id} style={styles.itemCard} activeOpacity={0.85} onPress={() => openProject(c)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{c.title}</Text>
                <Text style={styles.itemSubtitle}>Completado • ${c.donated.toLocaleString()} recaudados</Text>
              </View>
              <View style={styles.itemBadge}><Text style={styles.itemBadgeText}>Ver</Text></View>
            </TouchableOpacity>
          )) : (
            <Text style={styles.emptyText}>Aún no hay proyectos completados</Text>
          )}
        </View>

        {/* suggestions area */}
        {suggestions.length > 0 && (
          <View style={{ marginTop: 18 }}>
            <Text style={styles.sectionTitle}>Sugerencias</Text>
            {suggestions.map(s => (
              <View key={s.id} style={styles.suggestionCard}><Text style={{ color: GRAY, fontWeight: '700' }}>{s.title}</Text></View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <ProjectModal project={selected} visible={modalVisible} onClose={() => setModalVisible(false)} />
      <CreateProjectModal 
        visible={createModalVisible} 
        onClose={() => setCreateModalVisible(false)}
        onProjectCreated={handleProjectCreated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE },
  body: { paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: GRAY, marginBottom: 10, paddingHorizontal: 16 },
  shareCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginRight: 12, marginVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  shareCardInner: { flex: 1, justifyContent: 'space-between' },
  shareCardTitle: { fontSize: 15, fontWeight: '800', color: GRAY },
  shareCardFooter: { marginTop: 12 },
  progressContainerSmall: { height: 8, backgroundColor: LIGHT_GRAY, borderRadius: 8, overflow: 'hidden' },
  smallMeta: { marginTop: 8, color: '#6b7280' },

  itemCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginHorizontal: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  itemTitle: { fontSize: 15, fontWeight: '700', color: GRAY },
  itemSubtitle: { fontSize: 13, color: '#7a8288', marginTop: 4 },
  itemBadge: { backgroundColor: LIGHT_GRAY, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 10 },
  itemBadgeText: { color: GRAY, fontWeight: '700' },

  suggestionCard: { backgroundColor: '#fff', padding: 12, marginHorizontal: 16, borderRadius: 10, marginBottom: 8 },
  suggestionRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: RED,
  },
  createButtonText: {
    color: RED,
    fontWeight: '700',
    marginLeft: 4,
  },
  emptyText: {
    color: '#9aa0a6',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },

  modalSafe: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: GRAY },

  progressContainer: { width: '100%', height: 12, backgroundColor: LIGHT_GRAY, borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: RED },
  cardImage: { height: 180, borderRadius: 12, overflow: 'hidden', justifyContent: 'flex-end' },
  cardImageOverlay: { backgroundColor: 'rgba(0,0,0,0.28)', padding: 12, borderRadius: 12 },
  shareCardTitleWhite: { fontSize: 15, fontWeight: '800', color: '#fff' },
  shareCardFooterRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressContainerSmallLight: { height: 8, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 8, overflow: 'hidden', flex: 1, marginRight: 8 },
  progressFillLight: { height: '100%', backgroundColor: 'rgba(255,255,255,0.95)' },
  smallMetaLight: { marginTop: 8, color: 'rgba(255,255,255,0.9)' },
  modalImage: { width: '100%', height: 200, resizeMode: 'cover' },
  progressBox: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  progressBoxTitle: { fontWeight: '800', color: GRAY, marginBottom: 8 },
  progressBoxRow: { flexDirection: 'row', alignItems: 'center' },
  miniLabel: { color: '#6b7280', fontSize: 12 },
  miniValue: { fontWeight: '800', marginTop: 6 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 8 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#eef2f6' },
  tabActive: { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' },
  tabTextActive: { fontWeight: '800', color: GRAY },
  tabText: { color: '#6b7280' },
  movementRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
});