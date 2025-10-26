/**
 * Biometric Verification Modal - Step by Step
 * 1. Capture Selfie (camera only)
 * 2. Capture INE (camera only)
 * 3. Auto-submit for verification
 */

import { GRAY, LIGHT_GRAY, RED, WHITE } from '@/css/globalcss';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';

type VerificationStep = 'selfie' | 'ine' | 'verifying';

interface BiometricVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (selfie: any, ine: any) => Promise<void>;
  isLoading?: boolean;
}

export default function BiometricVerificationModal({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
}: BiometricVerificationModalProps) {
  const [currentStep, setCurrentStep] = useState<VerificationStep>('selfie');
  const [selfie, setSelfie] = useState<any>(null);
  const [ine, setIne] = useState<any>(null);
  const [capturingImage, setCapturingImage] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentStep('selfie');
      setSelfie(null);
      setIne(null);
    }
  }, [visible]);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentStep('selfie');
      setSelfie(null);
      setIne(null);
    }
  }, [visible]);

  // Auto-submit when both images are captured
  useEffect(() => {
    if (selfie && ine && !isLoading) {
      handleAutoSubmit();
    }
  }, [selfie, ine]);

  const handleTakePhoto = async (type: 'selfie' | 'ine') => {
    try {
      setCapturingImage(true);

      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permiso necesario',
          'Necesitamos acceso a tu cámara para verificar tu identidad.'
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: type === 'selfie' ? [1, 1] : [16, 9],
        quality: 0.8,
        cameraType: type === 'selfie' ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
      });

      if (!result.canceled && result.assets[0]) {
        if (type === 'selfie') {
          setSelfie(result.assets[0]);
          // Move to INE step automatically
          setCurrentStep('ine');
        } else {
          setIne(result.assets[0]);
          // Will auto-submit via useEffect
          setCurrentStep('verifying');
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto. Intenta nuevamente.');
    } finally {
      setCapturingImage(false);
    }
  };

  const handleRetake = (type: 'selfie' | 'ine') => {
    if (type === 'selfie') {
      setSelfie(null);
      setCurrentStep('selfie');
    } else {
      setIne(null);
      setCurrentStep('ine');
    }
  };

  const handleAutoSubmit = async () => {
    if (!selfie || !ine) return;

    await onSubmit(selfie, ine);
  };

  const handleClose = () => {
    if (isLoading) {
      Alert.alert(
        'Verificación en proceso',
        '¿Estás seguro de cancelar la verificación?',
        [
          { text: 'No', style: 'cancel' },
          { 
            text: 'Sí, cancelar', 
            style: 'destructive',
            onPress: onClose 
          },
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} disabled={isLoading}>
            <Text style={styles.cancelButton}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verificación de Identidad</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>🔒 Dispositivo nuevo detectado</Text>
            <Text style={styles.infoText}>
              Por tu seguridad, verificaremos tu identidad en dos pasos: primero tu rostro, luego tu INE.
            </Text>
          </View>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={styles.stepRow}>
              <View style={[styles.stepCircle, currentStep !== 'selfie' && styles.stepCircleCompleted]}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={[styles.stepLine, currentStep !== 'selfie' && styles.stepLineCompleted]} />
              <View style={[styles.stepCircle, currentStep === 'verifying' && styles.stepCircleCompleted]}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
            </View>
            <View style={styles.stepLabels}>
              <Text style={styles.stepLabel}>Selfie</Text>
              <Text style={styles.stepLabel}>INE</Text>
            </View>
          </View>

          {/* Step 1: Selfie */}
          {currentStep === 'selfie' && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Paso 1: Captura tu rostro</Text>
              <Text style={styles.stepDescription}>
                Toma una selfie clara de tu rostro. Asegúrate de tener buena iluminación.
              </Text>

              {selfie ? (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: selfie.uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.retakeButton}
                    onPress={() => handleRetake('selfie')}
                    disabled={isLoading}
                  >
                    <Text style={styles.retakeButtonText}>🔄 Tomar de nuevo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => setCurrentStep('ine')}
                    disabled={isLoading}
                  >
                    <Text style={styles.continueButtonText}>Continuar →</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={() => handleTakePhoto('selfie')}
                  disabled={capturingImage}
                >
                  {capturingImage ? (
                    <ActivityIndicator color={WHITE} />
                  ) : (
                    <>
                      <Text style={styles.captureIcon}>📸</Text>
                      <Text style={styles.captureText}>Tomar selfie</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Step 2: INE */}
          {currentStep === 'ine' && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Paso 2: Captura tu INE</Text>
              <Text style={styles.stepDescription}>
                Toma una foto de tu INE (credencial de elector). Asegúrate de que todos los datos sean legibles.
              </Text>

              {ine ? (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: ine.uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.retakeButton}
                    onPress={() => handleRetake('ine')}
                    disabled={isLoading}
                  >
                    <Text style={styles.retakeButtonText}>🔄 Tomar de nuevo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {selfie && (
                    <View style={styles.previousImageBox}>
                      <Text style={styles.previousImageLabel}>✓ Selfie capturada</Text>
                      <Image source={{ uri: selfie.uri }} style={styles.previousImageThumb} />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.captureButton}
                    onPress={() => handleTakePhoto('ine')}
                    disabled={capturingImage}
                  >
                    {capturingImage ? (
                      <ActivityIndicator color={WHITE} />
                    ) : (
                      <>
                        <Text style={styles.captureIcon}>🪪</Text>
                        <Text style={styles.captureText}>Tomar foto de INE</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {/* Step 3: Verifying */}
          {currentStep === 'verifying' && (
            <View style={styles.stepContent}>
              <View style={styles.verifyingBox}>
                <ActivityIndicator size="large" color={RED} />
                <Text style={styles.verifyingTitle}>Verificando tu identidad...</Text>
                <Text style={styles.verifyingText}>
                  Estamos comparando tu selfie con tu INE. Esto puede tomar unos segundos.
                </Text>
                
                <View style={styles.imagesRow}>
                  <View style={styles.imageBox}>
                    <Text style={styles.imageBoxLabel}>Selfie</Text>
                    {selfie && (
                      <Image source={{ uri: selfie.uri }} style={styles.imageBoxThumb} />
                    )}
                  </View>
                  <View style={styles.imageBox}>
                    <Text style={styles.imageBoxLabel}>INE</Text>
                    {ine && (
                      <Image source={{ uri: ine.uri }} style={styles.imageBoxThumb} />
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
    marginTop: Platform.OS === 'ios' ? 40 : 0,
  },
  cancelButton: {
    color: RED,
    fontSize: 16,
    width: 60,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: GRAY,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoBox: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: GRAY,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: GRAY,
    lineHeight: 20,
  },
  
  // Step Indicator
  stepIndicator: {
    marginBottom: 32,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LIGHT_GRAY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: LIGHT_GRAY,
  },
  stepCircleCompleted: {
    backgroundColor: RED,
    borderColor: RED,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: GRAY,
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: LIGHT_GRAY,
    marginHorizontal: 8,
  },
  stepLineCompleted: {
    backgroundColor: RED,
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  stepLabel: {
    fontSize: 13,
    color: GRAY,
    fontWeight: '600',
  },

  // Step Content
  stepContent: {
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: GRAY,
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 15,
    color: GRAY,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },

  // Capture Button
  captureButton: {
    backgroundColor: RED,
    paddingVertical: 48,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  captureIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  captureText: {
    fontSize: 18,
    fontWeight: '700',
    color: WHITE,
  },

  // Image Preview
  imagePreview: {
    width: '100%',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    maxWidth: 350,
    height: 300,
    borderRadius: 16,
    backgroundColor: LIGHT_GRAY,
    marginBottom: 16,
  },
  retakeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  retakeButtonText: {
    color: GRAY,
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: RED,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  continueButtonText: {
    color: WHITE,
    fontSize: 17,
    fontWeight: '700',
  },

  // Previous Image
  previousImageBox: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  previousImageLabel: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  previousImageThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: LIGHT_GRAY,
  },

  // Verifying
  verifyingBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  verifyingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: GRAY,
    marginTop: 24,
    marginBottom: 12,
  },
  verifyingText: {
    fontSize: 15,
    color: GRAY,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    justifyContent: 'center',
  },
  imageBox: {
    alignItems: 'center',
  },
  imageBoxLabel: {
    fontSize: 13,
    color: GRAY,
    fontWeight: '600',
    marginBottom: 8,
  },
  imageBoxThumb: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: LIGHT_GRAY,
  },
});
