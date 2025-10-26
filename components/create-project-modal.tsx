import Header from '@/components/header';
import { GRAY, RED, WHITE, LIGHT_GRAY } from '@/css/globalcss';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useUser } from '@/app/state/user-store';
import { API } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';

// Lista de colonias disponibles
const COLONIAS = [
  'Centro',
  'La Primavera',
  'San Pedro',
  'Las Flores',
  'El Mirador',
  'Zona Industrial',
  'Lomas',
  'Del Valle',
  'Santa María',
  'Jardines',
];

type CreateProjectModalProps = {
  visible: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
};

export default function CreateProjectModal({ visible, onClose, onProjectCreated }: CreateProjectModalProps) {
  const user = useUser();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [colonia, setColonia] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierAccount, setSupplierAccount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showColoniaPicker, setShowColoniaPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      // Reset form when modal opens
      setTitle('');
      setDescription('');
      setGoal('');
      setColonia(user?.colony || '');
      setSupplierName('');
      setSupplierAccount('');
      setShowColoniaPicker(false);
    }
  }, [visible, user]);

  const submit = async () => {
    // Validation
    if (!title.trim()) {
      return Alert.alert('Error', 'Ingrese un título para el proyecto');
    }
    if (!description.trim()) {
      return Alert.alert('Error', 'Ingrese una descripción');
    }
    if (!colonia) {
      return Alert.alert('Error', 'Seleccione una colonia');
    }
    if (!goal || Number(goal) <= 0) {
      return Alert.alert('Error', 'Ingrese una meta válida');
    }
    if (!supplierName.trim() || !supplierAccount.trim()) {
      return Alert.alert('Error', 'Ingrese la información del proveedor');
    }
    if (supplierAccount.length !== 18) {
      return Alert.alert('Error', 'La cuenta CLABE debe tener 18 dígitos');
    }
    if (!user?.id) {
      return Alert.alert('Error', 'No hay usuario autenticado');
    }

    setIsSubmitting(true);

    try {
      const createdProject = await API.projects.createProject({
        title: title.trim(),
        description: description.trim(),
        colonia,
        fundingGoal: Number(goal),
        supplierInfo: {
          name: supplierName.trim(),
          account: supplierAccount.trim(),
        },
        // Back-end requires proposerId and votingStats — provide them from the current user
        proposerId: user.id,
        votingStats: {
          votesNeeded: 0,
          votesFor: 0,
          voters: [],
        },
      } as any);

      // Crear tarjeta automáticamente al crear el proyecto
      const project = createdProject.data || createdProject.project;
      if (project?._id && user?.id) {
        try {
          // Generar número de tarjeta único basado en timestamp y userId
          const timestamp = Date.now().toString().slice(-8);
          const userIdPart = user.id.slice(-4);
          const cardNumber = `4152${timestamp}${userIdPart}`;
          
          // Determinar tipo de tarjeta basado en el monto del proyecto
          const fundingGoal = Number(goal);
          let cardType: 'banortemujer' | 'banorteclasica' | 'banorteoro';
          let maxCredit: number;
          
          if (fundingGoal < 5000) {
            cardType = 'banortemujer';
            maxCredit = 5000;
          } else if (fundingGoal < 20000) {
            cardType = 'banorteclasica';
            maxCredit = 20000;
          } else {
            cardType = 'banorteoro';
            maxCredit = 50000;
          }
          
          // Crear la tarjeta vinculada al proyecto
          await API.cards.createCard({
            userId: user.id,
            cardNumber,
            holderName: user.name || 'Usuario',
            expiry: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7), // 3 años
            type: cardType,
            maxCredit,
            cutoffDay: 15,
          });
          
          console.log('✅ Tarjeta creada automáticamente para el proyecto:', project._id);
        } catch (cardError) {
          console.error('⚠️ Error creando tarjeta automática:', cardError);
          // No bloqueamos el flujo si falla la creación de tarjeta
        }
      }

      Alert.alert(
        '¡Proyecto creado!',
        'Tu proyecto y tarjeta han sido creados exitosamente. Ahora necesita votos para ser aprobado.',
        [{ text: 'OK', onPress: () => {
          onClose();
          onProjectCreated();
        }}]
      );
    } catch (error: any) {
      console.error('Error creating project:', error);
      Alert.alert(
        'Error',
        error?.data?.message || 'No se pudo crear el proyecto. Intenta de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: WHITE }}>
        <Header showBack onBack={onClose} onRightPress={onClose} rightIconName="close" />
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: GRAY, marginBottom: 12 }}>Crear Proyecto</Text>

          <Text style={styles.label}>Título del proyecto</Text>
          <TextInput 
            value={title} 
            onChangeText={setTitle} 
            placeholder="Ej. Mejorar alumbrado público" 
            style={styles.formInput}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Descripción</Text>
          <TextInput 
            value={description} 
            onChangeText={setDescription} 
            placeholder="Describe el proyecto y su objetivo..." 
            style={[styles.formInput, { height: 100 }]} 
            multiline
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Colonia</Text>
          <TouchableOpacity 
            style={[styles.formInput, styles.pickerButton]}
            onPress={() => setShowColoniaPicker(true)}
            disabled={isSubmitting}
          >
            <Text style={colonia ? styles.pickerText : styles.pickerPlaceholder}>
              {colonia || 'Selecciona una colonia'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={GRAY} />
          </TouchableOpacity>

          <Text style={styles.label}>Meta de fondeo (MXN)</Text>
          <TextInput 
            value={goal} 
            onChangeText={setGoal} 
            keyboardType="numeric" 
            placeholder="Ej. 50000"
            style={styles.formInput}
            editable={!isSubmitting}
          />

          <Text style={{ fontSize: 16, fontWeight: '700', color: GRAY, marginTop: 16, marginBottom: 8 }}>
            Información del Proveedor
          </Text>

          <Text style={styles.label}>Nombre del proveedor</Text>
          <TextInput 
            value={supplierName} 
            onChangeText={setSupplierName} 
            placeholder="Ej. Constructora XYZ S.A. de C.V."
            style={styles.formInput}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Cuenta CLABE (18 dígitos)</Text>
          <TextInput 
            value={supplierAccount} 
            onChangeText={setSupplierAccount} 
            keyboardType="numeric"
            placeholder="123456789012345678"
            maxLength={18}
            style={styles.formInput}
            editable={!isSubmitting}
          />

          <View style={{ flexDirection: 'row', marginTop: 24, gap: 12 }}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: WHITE, borderWidth: 1, borderColor: '#eef2f6', flex: 1 }]} 
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={{ color: GRAY, fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: RED, flex: 1 }]} 
              onPress={submit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={WHITE} />
              ) : (
                <Text style={{ color: WHITE, fontWeight: '800' }}>Crear Proyecto</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Colonia Picker Modal */}
        <Modal visible={showColoniaPicker} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecciona una colonia</Text>
              <ScrollView style={{ maxHeight: 400 }}>
                {COLONIAS.map(col => (
                  <TouchableOpacity 
                    key={col} 
                    style={[styles.modalItem, colonia === col && styles.selected]} 
                    onPress={() => { 
                      setColonia(col); 
                      setShowColoniaPicker(false);
                    }}
                  >
                    <Text style={[styles.modalItemText, colonia === col && { color: RED, fontWeight: '700' }]}>
                      {col}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity 
                style={styles.modalClose} 
                onPress={() => setShowColoniaPicker(false)}
              >
                <Text style={{ color: GRAY, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  formInput: { 
    height: 44, 
    borderRadius: 10, 
    backgroundColor: WHITE, 
    paddingHorizontal: 12, 
    borderWidth: 1, 
    borderColor: '#eef2f6', 
    marginBottom: 12,
  },
  button: { 
    paddingVertical: 14, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  label: {
    color: '#6b7280',
    marginBottom: 6,
    fontWeight: '600',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    color: GRAY,
    fontSize: 16,
  },
  pickerPlaceholder: {
    color: '#9aa0a6',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: GRAY,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
  },
  modalItemText: {
    fontSize: 16,
    color: GRAY,
  },
  selected: {
    backgroundColor: '#FFF5F5',
  },
  modalClose: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: LIGHT_GRAY,
  },
});
