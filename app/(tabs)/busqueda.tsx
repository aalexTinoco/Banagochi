                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    import { Project, useProjects } from '@/app/state/projects-store';
import CreateProjectModal from '@/components/create-project-modal';
import Header from '@/components/header';
import SearchBar from '@/components/search-bar';
import { GRAY, RED, WHITE } from '@/css/globalcss';
import { ProjectsService } from '@/services/api';
import type { Project as APIProject } from '@/services/types/projects.types';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    function formatDateLabel(d?: string) {
  if (!d) return '';
  const isoMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(d);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
  if (!isoMatch) return d;
  const [, year, mm, dd] = isoMatch;
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const month = months[Number(mm) - 1] || mm;
  return `${Number(dd)} de ${month} ${year}`;
}

export default function BusquedaScreen() {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [projects, addProject] = useProjects();
  const [apiProjects, setApiProjects] = useState<APIProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects from API on mount
  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 Fetching projects from API...');
      const data = await ProjectsService.getAll();
      console.log('✅ Projects loaded:', data.length);
      
      setApiProjects(data);
    } catch (err: any) {
      console.error('❌ Error loading projects:', err);
      setError('No se pudieron cargar los proyectos');
    } finally {
      setLoading(false);
    }
  }

  // Search active projects (currentAmount < fundingGoal and status = FUNDING or VOTING)
  const activeProjects = useMemo(() => {
    return apiProjects.filter(p => 
      p.active && 
      p.currentAmount < p.fundingGoal &&
      (p.status === 'FUNDING' || p.status === 'VOTING')
    );
  }, [apiProjects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activeProjects;
    return activeProjects.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.colonia.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }, [query, activeProjects]);

  const [suggModalVisible, setSuggModalVisible] = useState(false);
  const [selected, setSelected] = useState<APIProject | null>(null);
  const [createVisible, setCreateVisible] = useState(false);
  const [cardImage, setCardImage] = useState<any>(require('@/assets/images/Banorte-TDC-Basica-.avif'));

  // create form state
  const [newTitle, setNewTitle] = useState('');
  const [newGoal, setNewGoal] = useState('10000');

  const openSuggestions = (p: APIProject) => {
    setSelected(p);
    setSuggModalVisible(true);
  };

  const startCreateFor = (p?: APIProject) => {
    // prefill title/desc when coming from a suggestion and set image if available
    if (p) {
      setNewTitle(p.title + ' — campaña comunitaria');
      if (p.coverImage) setCardImage({ uri: p.coverImage });
    }
    setSuggModalVisible(false);
    setCreateVisible(true);
  };

  // createProject handled by CreateProjectModal via onCreate

  // Build dynamic reasons/suggestions for a selected project
  const buildReasons = (p?: APIProject | null) => {
    if (!p) return [] as string[];
    const reasons: string[] = [];
    reasons.push(`Impacto local: "${p.title}" mejora la calidad de vida en ${p.colonia}.`);
    reasons.push(p.fundingGoal > 10000 ? 'Alto potencial de impacto si se alcanza la meta.' : 'Meta alcanzable con microdonaciones regulares.');
    reasons.push('Permite visibilidad para quienes quieran colaborar y voluntariados locales.');
    reasons.push('Crear este proyecto puede atraer patrocinadores y apoyo institucional.');
    return reasons;
  };

  // Helper function to get status label
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'VOTING': 'En votación',
      'FUNDING': 'Recaudando fondos',
      'IN_PROGRESS': 'En progreso',
      'COMPLETED': 'Completado',
      'REJECTED': 'Rechazado',
    };
    return labels[status] || status;
  };

  if (loading) {
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

  if (error) {
    return (
      <View style={styles.container}>
        <Header showBack={false} rightIconName="log-out-outline" onRightPress={() => router.replace('/')} rightAccessibilityLabel="Cerrar sesión" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: RED, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>Error</Text>
          <Text style={{ color: GRAY, textAlign: 'center', marginBottom: 20 }}>{error}</Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: RED }]} onPress={loadProjects}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header showBack={false} rightIconName="log-out-outline" onRightPress={() => router.replace('/')} rightAccessibilityLabel="Cerrar sesión" />

      <View style={styles.searchArea}>
        <Text style={styles.title}>Buscar proyectos en tu comunidad</Text>
        <SearchBar value={query} onChange={setQuery} placeholder="Buscar por título o categoría" />
        <Text style={styles.hint}>Resultados: {filtered.length} proyecto(s) activos</Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 80 }}>
        {filtered.map(p => (
          <TouchableOpacity key={p._id} style={styles.resultCard} onPress={() => openSuggestions(p)} activeOpacity={0.9}>
            <View style={{ flex: 1 }}>
              <Text style={styles.resultTitle}>{p.title}</Text>
              <Text style={styles.resultSub}>
                {getStatusLabel(p.status)} • {p.colonia} • Recaudado ${p.currentAmount.toLocaleString()} / ${p.fundingGoal.toLocaleString()}
              </Text>
              <Text style={styles.resultDate}>
                {p.creationDate ? formatDateLabel(p.creationDate.split('T')[0]) : ''}
              </Text>
            </View>
            <View style={styles.actionColumn}>
              <TouchableOpacity style={styles.ghostButton} onPress={() => openSuggestions(p)}>
                <Text style={{ color: RED, fontWeight: '800' }}>Ver</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {/* CTA to create new project directly */}
        <View style={{ marginTop: 18, marginBottom: 80 }}>
          <Text style={{ fontWeight: '800', color: GRAY, marginBottom: 8 }}>¿No encuentras lo que buscas?</Text>
          <TouchableOpacity style={styles.createCard} onPress={() => { setSelected(null); setCreateVisible(true); }}>
            <Image source={require('@/assets/images/Banorte_Mujer.png')} style={{ width: 56, height: 56, borderRadius: 10, marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', color: GRAY }}>Crear un nuevo proyecto</Text>
              <Text style={{ color: '#6b7280', marginTop: 4 }}>Crea la tarjeta con título, meta y descripción para empezar a recaudar.</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Suggestions modal when selecting a project */}
      <Modal visible={suggModalVisible} animationType="slide" onRequestClose={() => setSuggModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <Header showBack={true} onBack={() => setSuggModalVisible(false)} rightIconName="close" onRightPress={() => setSuggModalVisible(false)} />
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: GRAY, marginBottom: 8 }}>{selected?.title}</Text>
            <Text style={{ color: '#6b7280', marginBottom: 12 }}>
              {selected && getStatusLabel(selected.status)} • {selected?.colonia} • Meta ${selected?.fundingGoal?.toLocaleString()}
            </Text>
            <Text style={{ color: '#374151', marginBottom: 16 }}>{selected?.description}</Text>

            <Text style={{ fontWeight: '800', marginBottom: 8 }}>¿Por qué crear o apoyar este proyecto?</Text>
            {buildReasons(selected).map((r, i) => (
              <View key={i} style={{ backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#f3f4f6' }}>
                <Text style={{ color: '#374151' }}>{r}</Text>
              </View>
            ))}

            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eef2f6', marginRight: 8 }]} onPress={() => setSuggModalVisible(false)}>
                <Text style={{ color: GRAY }}>Cancelar</Text>
              </TouchableOpacity>
              {selected && selected.currentAmount >= selected.fundingGoal ? (
                <View style={[styles.button, { backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ color: '#6b7280', fontWeight: '700' }}>Proyecto completado</Text>
                </View>
              ) : (
                <TouchableOpacity style={[styles.button, { backgroundColor: RED }]} onPress={() => startCreateFor(selected || undefined)}>
                  <Text style={{ color: '#fff', fontWeight: '800' }}>Empezar</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Create project modal (componentized) */}
      <CreateProjectModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        prefill={{ title: newTitle, goal: Number(newGoal) }}
        initialImage={cardImage}
        onCreate={(p) => {
          addProject(p);
          setCreateVisible(false);
          setNewTitle(''); setNewGoal('10000');
          setCardImage(require('@/assets/images/Banorte-TDC-Basica-.avif'));
          Alert.alert('Creado', 'Tu tarjeta del proyecto ha sido creada y añadida a proyectos activos.');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE },
  searchArea: { padding: 16 },
  title: { fontSize: 18, fontWeight: '800', color: GRAY, marginBottom: 8 },
  input: { height: 44, borderRadius: 10, backgroundColor: '#fff', paddingHorizontal: 12, borderWidth: 1, borderColor: '#eef2f6' },
  hint: { color: '#6b7280', marginTop: 8 },
  resultCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  resultTitle: { fontWeight: '800', color: GRAY },
  resultSub: { color: '#6b7280', marginTop: 6 },
  resultDate: { color: '#9ca3af', marginTop: 6, fontSize: 12 },
  actionColumn: { marginLeft: 12, alignItems: 'center' },
  ghostButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eef2f6' },
  createCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  button: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  formInput: { height: 44, borderRadius: 10, backgroundColor: '#fff', paddingHorizontal: 12, borderWidth: 1, borderColor: '#eef2f6' },
});
