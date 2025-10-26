import { RED, GRAY, WHITE } from '@/css/globalcss';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PhotoCaptureProps {
  uri?: string | null;
  onTake: () => void;
  label?: string;
  type?: 'selfie' | 'id';
  step?: number;
  totalSteps?: number;
}

export default function PhotoCapture({ 
  uri, 
  onTake, 
  label, 
  type = 'selfie',
  step = 1,
  totalSteps = 2
}: PhotoCaptureProps) {
  const isSelfie = type === 'selfie';
  
  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressSection}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Paso {step} de {totalSteps}</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
        </View>
      </View>

      {/* Card */}
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: isSelfie ? '#eff6ff' : '#fef3c7' }]}>
            <Ionicons 
              name={isSelfie ? 'person-circle-outline' : 'card-outline'} 
              size={32} 
              color={isSelfie ? '#3b82f6' : '#f59e0b'} 
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.cardTitle}>
              {isSelfie ? 'Selfie de verificación' : 'Identificación oficial'}
            </Text>
            <Text style={styles.cardSubtitle}>
              {isSelfie ? 'Toma una foto de tu rostro' : 'Toma una foto de tu INE'}
            </Text>
          </View>
        </View>

        {/* Photo preview or placeholder */}
        <View style={styles.photoContainer}>
          {uri ? (
            <View style={styles.photoWrapper}>
              <Image source={{ uri }} style={styles.photoPreview} contentFit="cover" />
              <View style={styles.photoOverlay}>
                <View style={styles.successBadge}>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  <Text style={styles.successText}>Capturada</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={[styles.photoPlaceholder, { borderColor: isSelfie ? '#3b82f6' : '#f59e0b' }]}>
              <View style={[styles.placeholderIcon, { backgroundColor: isSelfie ? '#eff6ff' : '#fef3c7' }]}>
                <Ionicons 
                  name={isSelfie ? 'camera' : 'document-text'} 
                  size={48} 
                  color={isSelfie ? '#3b82f6' : '#f59e0b'} 
                />
              </View>
              <Text style={styles.placeholderText}>
                {isSelfie ? 'Sin foto' : 'Sin documento'}
              </Text>
              <Text style={styles.placeholderHint}>
                {isSelfie ? 'Toca el botón para tomar tu selfie' : 'Toca el botón para fotografiar tu INE'}
              </Text>
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>
            {isSelfie ? 'Instrucciones para tu selfie:' : 'Instrucciones para tu INE:'}
          </Text>
          {isSelfie ? (
            <>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.instructionText}>Rostro completamente visible</Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.instructionText}>Buena iluminación</Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.instructionText}>Sin lentes oscuros o accesorios</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.instructionText}>Todos los datos visibles</Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.instructionText}>Sin reflejos o sombras</Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.instructionText}>Enfoque nítido</Text>
              </View>
            </>
          )}
        </View>

        {/* Action button */}
        <TouchableOpacity 
          style={[styles.captureButton, uri && styles.retakeButton]} 
          onPress={onTake} 
          activeOpacity={0.8}
        >
          <Ionicons 
            name={uri ? 'refresh' : 'camera'} 
            size={20} 
            color="#fff" 
            style={{ marginRight: 8 }}
          />
          <Text style={styles.captureButtonText}>
            {uri ? 'Retomar foto' : (isSelfie ? 'Tomar selfie' : 'Tomar foto de INE')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  progressSection: {
    marginBottom: 16,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: RED,
    borderRadius: 2,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: GRAY,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  photoContainer: {
    marginBottom: 20,
  },
  photoWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 240,
    borderRadius: 12,
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  successText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  photoPlaceholder: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  placeholderIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  placeholderHint: {
    fontSize: 12,
    color: '#d1d5db',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  instructions: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: GRAY,
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    color: '#4b5563',
    marginLeft: 8,
  },
  captureButton: {
    flexDirection: 'row',
    backgroundColor: RED,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeButton: {
    backgroundColor: '#6b7280',
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
