import { GRAY, RED, WHITE } from '@/css/globalcss';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ColoniaPicker({ visible, colonias, selected, onSelect, onClose }: { visible: boolean; colonias: string[]; selected?: string; onSelect: (c: string) => void; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            {colonias.map(col => (
              <TouchableOpacity key={col} style={[styles.modalItem, selected === col && styles.selected]} onPress={() => { onSelect(col); }}>
                <Text style={[styles.modalItemText, selected === col && { color: RED }]}>{col}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.modalClose} onPress={onClose}><Text style={{ color: GRAY }}>Cerrar</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 24 },
  modalContent: { maxHeight: '70%', backgroundColor: WHITE, borderRadius: 12, padding: 12 },
  modalItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalItemText: { color: GRAY, fontSize: 16 },
  modalClose: { marginTop: 12, alignItems: 'center', padding: 12 },
  selected: { backgroundColor: '#F8FEF8' },
});
