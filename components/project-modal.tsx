import { Project } from '@/app/state/projects-store';
import Header from '@/components/header';
import { GRAY, RED } from '@/css/globalcss';
import React from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

function formatDateLabel(d?: string) {
  if (!d) return '';
  const isoMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(d);
  if (!isoMatch) return d;
  const [, year, mm, dd] = isoMatch;
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const month = months[Number(mm) - 1] || mm;
  return `${Number(dd)} de ${month} ${year}`;
}

export default function ProjectModal({ project, visible, onClose }: { project: Project | null; visible: boolean; onClose: () => void }) {
  if (!visible) return null;
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalSafe}>
        <Header showBack onBack={onClose} onRightPress={onClose} rightIconName="close" />
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <Image source={project?.image ? project.image : require('@/assets/images/Banorte-TDC-Basica-.avif')} style={styles.modalImage} resizeMode="cover" />

          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <Text style={{ fontWeight: '800', color: GRAY, marginBottom: 8 }}>Insights</Text>
            {project && (() => {
              const mv = project.recentMovements ?? [];
              const total = mv.reduce((s, x) => s + (x.amount || 0), 0);
              const donors = Array.from(new Set(mv.map(x => x.name ?? 'Anónimo'))).length;
              const avg = donors > 0 ? Math.round(total / donors) : 0;
              const top = mv.slice().sort((a, b) => (b.amount || 0) - (a.amount || 0))[0];
              return (
                <View style={styles.insightsBox}>
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
            {(project?.recentMovements ?? []).map((m) => (
              <View key={m.id} style={styles.movementRow}>
                <View>
                  <Text style={{ color: GRAY, fontWeight: '700' }}>{m.name ?? 'Anónimo'}</Text>
                  <Text style={{ color: '#6b7280', marginTop: 4 }}>{m.date ? formatDateLabel(m.date) : m.time}</Text>
                </View>
                <Text style={{ color: RED, fontWeight: '800' }}>{m.amount ? `$${m.amount.toLocaleString()}` : ''}</Text>
              </View>
            ))}
          </View>

        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalSafe: { flex: 1, backgroundColor: '#fff' },
  modalImage: { width: '100%', height: 200, resizeMode: 'cover' },
  insightsBox: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  movementRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
