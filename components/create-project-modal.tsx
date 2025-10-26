import { Project } from '@/app/state/projects-store';
import Header from '@/components/header';
import { GRAY, RED } from '@/css/globalcss';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateProjectModal({ visible, onClose, onCreate, prefill, initialImage }: { visible: boolean; onClose: () => void; onCreate: (p: Project) => void; prefill?: Partial<Project>; initialImage?: any }) {
  const [title, setTitle] = useState(prefill?.title || '');
  const [desc, setDesc] = useState(prefill?.title ? `Iniciativa basada en: ${prefill.title}` : '');
  const [goal, setGoal] = useState(String(prefill?.goal || 10000));
  const [cardImage, setCardImage] = useState<any>(initialImage ?? require('@/assets/images/Banorte-TDC-Basica-.avif'));

  useEffect(() => {
    if (visible) {
      setTitle(prefill?.title || '');
      setDesc(prefill?.title ? `Iniciativa basada en: ${prefill.title}` : '');
      setGoal(String(prefill?.goal || 10000));
      setCardImage(initialImage ?? require('@/assets/images/Banorte-TDC-Basica-.avif'));
    }
  }, [visible, prefill, initialImage]);

  const submit = () => {
    if (!title.trim()) return Alert.alert('Falta título', 'Ingrese un título para el proyecto');
    const id = `p_new_${Date.now()}`;
    const g = Math.max(1000, Number(goal) || 1000);
    const newP: Project = { id, title: title || 'Proyecto sin título', role: 'Organizador', donated: 0, goal: g, recentMovements: [], image: cardImage };
    onCreate(newP);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Header showBack onBack={onClose} onRightPress={onClose} rightIconName="close" />
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: GRAY, marginBottom: 12 }}>Crear tarjeta de proyecto</Text>

          <Text style={{ color: '#6b7280', marginBottom: 6 }}>Título</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Ej. Jardín comunitario" style={styles.formInput} />

          <Text style={{ color: '#6b7280', marginTop: 12, marginBottom: 6 }}>Descripción</Text>
          <TextInput value={desc} onChangeText={setDesc} placeholder="¿Qué quieres lograr?" style={[styles.formInput, { height: 100 }]} multiline />

          <Text style={{ color: '#6b7280', marginTop: 12, marginBottom: 6 }}>Meta (MXN)</Text>
          <TextInput value={goal} onChangeText={setGoal} keyboardType="numeric" style={styles.formInput} />

          <Text style={{ fontWeight: '800', marginTop: 16, marginBottom: 8 }}>Preview</Text>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#f3f4f6' }}>
            <Image source={cardImage} style={{ width: '100%', height: 140, borderRadius: 8, marginBottom: 12 }} resizeMode="cover" />
            <Text style={{ fontWeight: '800', fontSize: 16, color: GRAY }}>{title || 'Proyecto sin título'}</Text>
            <Text style={{ color: '#6b7280', marginTop: 8 }}>{desc || 'Descripción breve...'}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <Text style={{ color: '#6b7280' }}>Meta</Text>
              <Text style={{ fontWeight: '800' }}>${Number(goal || 0).toLocaleString()}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', marginTop: 18 }}>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eef2f6', marginRight: 8 }]} onPress={onClose}>
              <Text style={{ color: GRAY }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: RED }]} onPress={submit}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>Crear tarjeta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  formInput: { height: 44, borderRadius: 10, backgroundColor: '#fff', paddingHorizontal: 12, borderWidth: 1, borderColor: '#eef2f6', marginBottom: 8 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
