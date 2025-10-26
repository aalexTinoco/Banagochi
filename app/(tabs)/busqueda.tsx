                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    import { Project, useProjects } from '@/app/state/projects-store';
import CreateProjectModal from '@/components/create-project-modal';
import Header from '@/components/header';
import SearchBar from '@/components/search-bar';
import { GRAY, RED, WHITE } from '@/css/globalcss';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

  // search active projects (donated < goal)
  const activeProjects = useMemo(() => projects.filter(p => p.donated < p.goal), [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activeProjects;
    return activeProjects.filter(p => p.title.toLowerCase().includes(q) || (p.role || '').toLowerCase().includes(q));
  }, [query, activeProjects]);

  const [suggModalVisible, setSuggModalVisible] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const [createVisible, setCreateVisible] = useState(false);
  const [cardImage, setCardImage] = useState<any>(require('@/assets/images/Banorte-TDC-Basica-.avif'));

  // create form state
  const [newTitle, setNewTitle] = useState('');
  const [newGoal, setNewGoal] = useState('10000');

  const openSuggestions = (p: Project) => {
    setSelected(p);
    setSuggModalVisible(true);
  };

  const startCreateFor = (p?: Project) => {
    // prefill title/desc when coming from a suggestion and set image if available
    if (p) {
      setNewTitle(p.title + ' — campaña comunitaria');
      if ((p as any).image) setCardImage((p as any).image);
    }
    setSuggModalVisible(false);
    setCreateVisible(true);
  };

  // createProject handled by CreateProjectModal via onCreate

  // Build dynamic reasons/suggestions for a selected project
  const buildReasons = (p?: Project | null) => {
    if (!p) return [] as string[];
    const reasons: string[] = [];
    reasons.push(`Impacto local: "${p.title}" mejora la calidad de vida en tu comunidad.`);
    reasons.push(p.goal > 10000 ? 'Alto potencial de impacto si se alcanza la meta.' : 'Meta alcanzable con microdonaciones regulares.');
    reasons.push('Permite visibilidad para quienes quieran colaborar y voluntariados locales.');
    reasons.push('Crear este proyecto puede atraer patrocinadores y apoyo institucional.');
    return reasons;
  };

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
          <TouchableOpacity key={p.id} style={styles.resultCard} onPress={() => openSuggestions(p)} activeOpacity={0.9}>
            <View style={{ flex: 1 }}>
              <Text style={styles.resultTitle}>{p.title}</Text>
              <Text style={styles.resultSub}>{p.role} • Recaudado ${p.donated.toLocaleString()} / ${p.goal.toLocaleString()}</Text>
              <Text style={styles.resultDate}>{(p.recentMovements?.[0]?.date) ? formatDateLabel(p.recentMovements?.[0]?.date) : ''}</Text>
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
            <Text style={{ color: '#6b7280', marginBottom: 12 }}>{selected?.role} • Meta ${selected?.goal?.toLocaleString()}</Text>

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
              {selected && selected.donated >= (selected.goal || 0) ? (
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
