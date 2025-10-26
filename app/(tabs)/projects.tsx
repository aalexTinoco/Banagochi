import { Project, useProjects } from '@/app/state/projects-store';
import Header from '@/components/header';
import { GRAY, LIGHT_GRAY, RED, WHITE } from '@/css/globalcss';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Dimensions, Image, ImageBackground, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Se elimina el componente PieChart.

// Format ISO date (YYYY-MM-DD) into Spanish human readable form: "24 de octubre 2025"
function formatDateLabel(d?: string) {
  if (!d) return '';
  const isoMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(d);
  if (!isoMatch) return d;
  const [, year, mm, dd] = isoMatch;
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const month = months[Number(mm) - 1] || mm;
  return `${Number(dd)} de ${month} ${year}`;
}


export default function ProjectsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Project | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // shared projects store
  const [projects] = useProjects();

  // dynamic suggestions derived from projects and selected project
  const suggestions = useMemo(() => {
    const items: { id: string; title: string }[] = [];
    const active = projects.filter(p => p.donated < p.goal);
    const completed = projects.filter(p => p.donated >= p.goal);

    // If a project is selected, prioritize suggestions for it
    if (selected) {
      if (selected.donated < selected.goal) {
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

  const windowW = Dimensions.get('window').width;
  const cardW = Math.min(windowW - 96, 320);

  const openProject = (p: Project) => {
    setSelected(p);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Header showBack={false} rightIconName="log-out-outline" onRightPress={() => router.replace('/')} rightAccessibilityLabel="Cerrar sesión" />

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.sectionTitle}>Proyectos compartidos</Text>

        {/* Carousel of shared image cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 16, paddingRight: 32 }}>
          {projects.map((p) => (
            <TouchableOpacity key={p.id} style={[styles.shareCard, { width: cardW }]} activeOpacity={0.9} onPress={() => openProject(p)}>
              <ImageBackground source={p.image ? p.image : require('@/assets/images/Banorte-TDC-Basica-.avif')} style={styles.cardImage} imageStyle={{ borderRadius: 12 }}>
                <View style={styles.cardImageOverlay}>
                  <Text style={styles.shareCardTitleWhite}>{p.title}</Text>
                  <View style={styles.shareCardFooterRow}>
                    <View style={styles.progressContainerSmallLight}>
                      <View style={[styles.progressFillLight, { width: `${Math.round((p.donated / p.goal) * 100)}%` }]} />
                    </View>
                    <Text style={styles.smallMetaLight}>{`$${p.donated.toLocaleString()} de $${p.goal.toLocaleString()}`}</Text>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Completed section below - simulated as list */}
        <View style={{ marginTop: 22 }}>
          <Text style={styles.sectionTitle}>Completados</Text>
          {projects.slice(0, 2).map((c) => (
            <TouchableOpacity key={c.id} style={styles.itemCard} activeOpacity={0.85} onPress={() => openProject(c)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{c.title}</Text>
                <Text style={styles.itemSubtitle}>Completado</Text>
              </View>
              <View style={styles.itemBadge}><Text style={styles.itemBadgeText}>Ver</Text></View>
            </TouchableOpacity>
          ))}
        </View>

        {/* suggestions area */}
        <View style={{ marginTop: 18 }}>
          <Text style={styles.sectionTitle}>Sugerencias</Text>
          {suggestions.map(s => (
            <View key={s.id} style={styles.suggestionCard}><Text style={{ color: GRAY, fontWeight: '700' }}>{s.title}</Text></View>
          ))}
        </View>
      </ScrollView>

      {/* Modal showing project details (goal, donated, movements) */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalSafe}>
          {/* Keep the Header inside modal so header persists */}
          <Header showBack={true} onBack={() => setModalVisible(false)} onRightPress={() => setModalVisible(false)} rightIconName="close" />

          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Big image of the project */}
            <Image source={selected?.image ? selected.image : require('@/assets/images/Banorte-TDC-Basica-.avif')} style={styles.modalImage} resizeMode="contain" />

            {/* Always show Actions (Insights + Movements) — tabs removed per request */}
            <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
              <Text style={{ fontWeight: '800', color: GRAY, marginBottom: 8 }}>Insights</Text>

              {/* Insights box: total, donors, avg, top donor */}
              {selected && (() => {
                const mv = selected.recentMovements ?? [];
                const total = mv.reduce((s, x) => s + (x.amount || 0), 0);
                const donors = Array.from(new Set(mv.map(x => x.name ?? 'Anónimo'))).length;
                const avg = donors > 0 ? Math.round(total / donors) : 0;
                const top = mv.slice().sort((a, b) => (b.amount || 0) - (a.amount || 0))[0];
                return (
                  <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <View>
                        <Text style={{ color: '#6b7280' }}>Total en periodo</Text>
                        <Text style={{ fontWeight: '800', fontSize: 16 }}>${total.toLocaleString()}</Text>
                      </View>
                      <View>
                        <Text style={{ color: '#6b7280' }}>Donantes</Text>
                        <Text style={{ fontWeight: '800', fontSize: 16 }}>{donors}</Text>
                      </View>
                      <View>
                        <Text style={{ color: '#6b7280' }}>Promedio</Text>
                        <Text style={{ fontWeight: '800', fontSize: 16 }}>${avg.toLocaleString()}</Text>
                      </View>
                    </View>

                    <View style={{ borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8 }}>
                      <Text style={{ color: '#6b7280', marginBottom: 6 }}>Mayor donación</Text>
                      <Text style={{ fontWeight: '800' }}>{top ? `${top.name ?? 'Anónimo'} • $${(top.amount || 0).toLocaleString()}` : '—'}</Text>
                    </View>
                  </View>
                );
              })()}

              <Text style={{ fontWeight: '800', color: GRAY, marginBottom: 8 }}>Movimientos</Text>
                {(selected?.recentMovements ?? []).map((m) => (
                <View key={m.id} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ color: GRAY, fontWeight: '700' }}>{m.name ?? 'Anónimo'}</Text>
                    <Text style={{ color: '#6b7280', marginTop: 4 }}>{m.date ? formatDateLabel(m.date) : m.time}</Text>
                  </View>
                  <Text style={{ color: RED, fontWeight: '800' }}>{m.amount ? `$${m.amount.toLocaleString()}` : ''}</Text>
                </View>
              ))}
            </View>

            {/* Suggestion area below movements */}
            <View style={{ paddingHorizontal: 16, marginTop: 18 }}>

              {/* Insights derivados de los movimientos (etiqueta actualizada) */}
              {selected && (() => {
                const map: Record<string, number> = {};
                (selected.recentMovements ?? []).forEach(m => {
                  const day = m.date ?? m.time;
                  map[day] = (map[day] || 0) + (m.amount || 0);
                });
                const buckets = Object.keys(map).sort().map(k => ({ label: k.replace(/2025-|-/g, ''), value: map[k] }));
                const total = buckets.reduce((s, b) => s + b.value, 0);
                const top = buckets.slice().sort((a, b) => b.value - a.value)[0];
                const avg = buckets.length ? Math.round(total / buckets.length) : 0;
                return (
                  <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}>
                    <Text style={{ fontWeight: '800', marginBottom: 8 }}>Insights de Movimientos Recientes</Text>
                    <Text style={{ color: '#6b7280', marginBottom: 6 }}>Total en periodo: <Text style={{ fontWeight: '800' }}>${total.toLocaleString()}</Text></Text>
                    <Text style={{ color: '#6b7280', marginBottom: 6 }}>Promedio diario (por fechas registradas): <Text style={{ fontWeight: '800' }}>${avg.toLocaleString()}</Text></Text>
                    <Text style={{ color: '#6b7280', marginBottom: 6 }}>Día con más ingresos: <Text style={{ fontWeight: '800' }}>{top ? `${top.label} • $${top.value.toLocaleString()}` : '—'}</Text></Text>
                    <View style={{ marginTop: 8 }}>
                      <Text style={{ color: GRAY, fontWeight: '700', marginBottom: 6 }}>Sugerencias automáticas</Text>
                      <Text style={{ color: '#374151', marginBottom: 4 }}>• Promociona el proyecto el día {top ? top.label : '—'} — fue el día con más ingresos.</Text>
                      <Text style={{ color: '#374151', marginBottom: 4 }}>• Considera recordatorios los días con menor actividad para aumentar contribuciones.</Text>
                      <Text style={{ color: '#374151' }}>• Ofrece incentivos (menciones o pequeños reconocimientos) para aumentar el monto promedio.</Text>
                    </View>
                  </View>
                );
              })()}

              {suggestions.map((s: any) => (
                <TouchableOpacity key={s.id} style={styles.suggestionRow} onPress={() => { /* simulate */ }}>
                  <Text style={{ color: GRAY }}>{s.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
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