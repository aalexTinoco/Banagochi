import ColoniaPicker from '@/components/colonia-picker';
import DialogueBubble from '@/components/dialogue-bubble';
import Header from '@/components/header';
import OptionCard from '@/components/option-card';
import PhotoCapture from '@/components/photo-capture';
import ProgressBar from '@/components/progress-bar';
import { GRAY, LIGHT_GRAY, RED, WHITE } from '@/css/globalcss';
import { API } from '@/services/api';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';


const DIALOGUE_STEP_COUNT = 3;
// name, email, password, selfie, ine, postal, colonia, calle, numero, referencia
const REGISTER_FIELD_COUNT = 10;

// Copomex API configuration
const COPOMEX_TOKEN = '81eca954-2d49-45b7-8bde-756e397541cf';
const COPOMEX_API_URL = 'https://api.copomex.com/query/get_colonia_por_cp';

// OptionCard, DialogueBubble, PhotoCapture, ColoniaPicker and ProgressBar
// have been moved to `components/` and are imported above.

export default function RegistrationFlow({ onBackToStart }: { onBackToStart: () => void }) {
    const router = useRouter();
    const [step, setStep] = useState(0); 
    const [selectedMotivation, setSelectedMotivation] = useState<string | null>(null);
    const [formError, setFormError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        // photo URIs
        selfie: null as string | null,
        ine: null as string | null,
        postal: '',
        colonia: '',
        // Address fields - will be concatenated before sending to backend
        calle: '',
        numero: '',
        referencia: '',
        // user consent to fetch Banorte data via Open Banking
        allowOpenBanking: false,
    });

    const [colonias, setColonias] = useState<string[]>([]);
    const [showColoniaPicker, setShowColoniaPicker] = useState(false);

    async function pickPhotoFor(key: 'selfie' | 'ine') {
        try {
            const perm = await ImagePicker.requestCameraPermissionsAsync();
            if (!perm.granted) {
                setFormError('Permiso de cámara denegado');
                return;
            }

            const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
            const uri = (res as any).assets?.[0]?.uri ?? (res as any).uri;
            if (uri) setFormData(prev => ({ ...prev, [key]: uri }));
        } catch (e) {
            console.warn(e);
            setFormError('No se pudo tomar la foto');
        }
    }

    // Real API call to fetch colonias from Copomex
    async function fetchColonias(postal: string) {
        // Validation
        if (!postal || postal.length !== 5) {
            return [];
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `${COPOMEX_API_URL}/${postal}?token=${COPOMEX_TOKEN}`
            );
            
            if (!response.ok) {
                throw new Error('No se pudo obtener las colonias');
            }

            const data = await response.json();
            
            console.log('Copomex API Response:', data); // Debug log
            
            // Check if the response has the expected structure
            if (data && !data.error && data.response && data.response.colonia) {
                const coloniasArray = data.response.colonia;
                
                if (Array.isArray(coloniasArray) && coloniasArray.length > 0) {
                    // Remove duplicates and filter out empty values
                    return [...new Set(coloniasArray.filter(Boolean))] as string[];
                }
            }

            return [];
        } catch (error) {
            console.error('Error fetching colonias:', error);
            return [];
        } finally {
            setIsLoading(false);
        }
    }

    // Register user with backend
    async function registerUser() {
        setIsLoading(true);
        setFormError('');

        try {
            // Validate all required fields
            if (!formData.name || !formData.email || !formData.password) {
                throw new Error('Por favor completa todos los campos requeridos');
            }

            if (!formData.selfie || !formData.ine) {
                throw new Error('Las fotos de verificación biométrica son requeridas');
            }

            if (!formData.colonia || !formData.calle || !formData.numero) {
                throw new Error('Por favor completa tu dirección (calle y número son requeridos)');
            }

            // Concatenate address fields into domicilio
            const domicilio = `${formData.calle} ${formData.numero}${formData.referencia ? ', ' + formData.referencia : ''}`.trim();

            // Prepare the image files for upload
            const selfieFile = {
                uri: formData.selfie,
                type: 'image/jpeg',
                name: 'selfie.jpg',
            };

            const ineFile = {
                uri: formData.ine,
                type: 'image/jpeg',
                name: 'ine.jpg',
            };

            // Call the API to register the user
            const response = await API.users.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: [{ type: 'user' }], // Default role
                colony: formData.colonia,
                domicilio: domicilio, // Concatenated address
                selfie: selfieFile as any,
                ine: ineFile as any,
            });

            if (response.success) {
                Alert.alert(
                    '¡Registro exitoso!',
                    'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                router.replace('/(auth)/login' as any);
                            },
                        },
                    ]
                );
            } else {
                throw new Error(response.message || 'Error al registrar usuario');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            setFormError(error.message || 'Error al crear la cuenta. Intenta nuevamente.');
            Alert.alert('Error', error.message || 'No se pudo completar el registro');
        } finally {
            setIsLoading(false);
        }
    }

    const dialogueTexts = useMemo(() => [
        '¡ Hola! Soy Maya, tu guía. 😊 Estoy aquí para presentarte Smart Cities.',
        ' Esta aplicación te permite proponer ideas, consultar servicios de tu ciudad, y pronto, gestionar trámites financieros con Banorte.',
        ' ¿Listo para crear tu cuenta y comenzar?',
    ], []);

    const formFields = useMemo(() => [
        { key: 'name', type: 'input', placeholder: 'Nombre Completo', title: '¡Comencemos con tu nombre!' },
        { key: 'email', type: 'input', placeholder: 'Correo Electrónico', title: 'Ahora, tu email...', keyboardType: 'email-address' },
        { key: 'password', type: 'input', placeholder: 'Contraseña Segura (mín. 6 caracteres)', title: 'Crea una contraseña.', secureTextEntry: true },
        { key: 'selfie', type: 'photo', title: 'Toma una foto de tu rostro' },
        { key: 'ine', type: 'photo', title: 'Toma una foto de tu INE (frente)' },
        { key: 'postal', type: 'input', placeholder: 'Código postal (5 dígitos)', title: '¿Cuál es tu código postal?', keyboardType: 'numeric' },
        { key: 'colonia', type: 'select', title: 'Selecciona tu colonia' },
        { key: 'calle', type: 'input', placeholder: 'Nombre de la calle', title: '¿Cuál es el nombre de tu calle?' },
        { key: 'numero', type: 'input', placeholder: 'Número exterior/interior', title: '¿Cuál es el número de tu domicilio?' },
        { key: 'referencia', type: 'input', placeholder: 'Referencias (opcional)', title: '¿Alguna referencia para ubicar tu domicilio?', multiline: true, optional: true },
    ], []);

    const isLastDialogueStep = step === DIALOGUE_STEP_COUNT - 1;
    const isMotivationStep = step === DIALOGUE_STEP_COUNT;
    const isFormStep = step >= DIALOGUE_STEP_COUNT + 1 && step < DIALOGUE_STEP_COUNT + 1 + REGISTER_FIELD_COUNT;
    const currentFormField = isFormStep ? formFields[step - (DIALOGUE_STEP_COUNT + 1)] : null;
    const isLastFormStep = step === DIALOGUE_STEP_COUNT + REGISTER_FIELD_COUNT;

    const handleNext = async () => {
        setFormError('');
        const MAX_STEP = DIALOGUE_STEP_COUNT + REGISTER_FIELD_COUNT;
        
        // Dialogue steps
        if (step < DIALOGUE_STEP_COUNT) {
            setStep(s => Math.min(s + 1, MAX_STEP));
            return;
        }
        
        // Motivation step
        if (isMotivationStep) {
            if (!selectedMotivation) {
                setFormError('Por favor, selecciona una opción para continuar.');
                return;
            }
            setStep(s => Math.min(s + 1, MAX_STEP));
            return;
        }
        
        // Form steps
        if (isFormStep) {
            if (!currentFormField) return;
            const key = currentFormField.key as keyof typeof formData;

            if (currentFormField.type === 'input') {
                const val = (formData as any)[key];
                // Allow empty values for optional fields
                const isOptional = (currentFormField as any).optional;
                if (!isOptional && (!val || val.trim().length === 0)) {
                    setFormError('Por favor, ingresa tu respuesta.');
                    return;
                }

                // Validate password length
                if (key === 'password' && val.length < 6) {
                    setFormError('La contraseña debe tener al menos 6 caracteres.');
                    return;
                }

                // Validate email format
                if (key === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(val)) {
                        setFormError('Por favor ingresa un email válido.');
                        return;
                    }
                }

                // If postal code, fetch colonias before moving on
                if (key === 'postal') {
                    if (val.length !== 5) {
                        setFormError('El código postal debe tener 5 dígitos.');
                        return;
                    }
                    
                    const cols = await fetchColonias(val as string);
                    if (!cols || cols.length === 0) {
                        setFormError('No se encontraron colonias para ese código postal.');
                        return;
                    }
                    setColonias(cols);
                }

                setStep(s => Math.min(s + 1, MAX_STEP));
                return;
            }

            if (currentFormField.type === 'photo') {
                const val = (formData as any)[key];
                if (!val) {
                    setFormError('Por favor toma la foto requerida.');
                    return;
                }
                setStep(s => Math.min(s + 1, MAX_STEP));
                return;
            }

            if (currentFormField.type === 'select') {
                const val = (formData as any)[key];
                if (!val) {
                    setFormError('Por favor selecciona una colonia.');
                    return;
                }
                setStep(s => Math.min(s + 1, MAX_STEP));
                return;
            }

            setStep(s => Math.min(s + 1, MAX_STEP));
            return;
        }

        // Last step - register user
        if (isLastFormStep) {
            await registerUser();
        }
    };

    const exitingRef = useRef(false);
    const handleBack = () => {
        setFormError('');
        setStep(prev => {
            if (prev > 0) return prev - 1;
            // we're at root of the flow -> navigate out once
            if (!exitingRef.current) {
                exitingRef.current = true;
                try {
                    onBackToStart();
                } catch (e) {
                    console.warn('Error navigating back to start', e);
                }
            }
            return 0;
        });
    };

    // header replaced by shared Header component

    if (step < DIALOGUE_STEP_COUNT) {
        return (
            <View style={styles.onboardingContainer}>
                <Header
                    showBack
                    onBack={handleBack}
                    onRightPress={() => router.push('/(auth)/login')}
                    rightIconName="log-in-outline"
                    rightAccessibilityLabel="Ir a login"
                />
                {isFormStep && (
                    <ProgressBar percent={((step - DIALOGUE_STEP_COUNT) / REGISTER_FIELD_COUNT) * 100} />
                )}
                <View style={onboardingStyles.contentCentered}>
                    <DialogueBubble 
                        dialogueText={dialogueTexts[step]}
                        onFinish={() => {
                            if (isLastDialogueStep) return; 
                            setTimeout(() => handleNext(), 1500); 
                        }}
                    />

                    {/* CTA appears directly below the dialogue bubble */}
                    <View style={onboardingStyles.ctaInline}>
                        <TouchableOpacity 
                            style={[styles.button, styles.primaryGreen]} 
                            onPress={handleNext}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.buttonText, styles.primaryGreenText]}>
                                {isLastDialogueStep ? 'CONTINUAR' : 'SIGUIENTE'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    if (isMotivationStep) {
        return (
            <View style={styles.onboardingContainer}>
                <Header
                    showBack
                    onBack={handleBack}
                    onRightPress={() => router.push('/(auth)/login')}
                    rightIconName="log-in-outline"
                    rightAccessibilityLabel="Ir a login"
                />
                {isFormStep && (
                    <ProgressBar percent={((step - DIALOGUE_STEP_COUNT) / REGISTER_FIELD_COUNT) * 100} />
                )}
                <View style={onboardingStyles.contentCentered}>
                    <View style={onboardingStyles.dialogContainer}>
                        <Image source={require('@/assets/images/maya.png')} style={onboardingStyles.maya} />
                        <View style={onboardingStyles.bubble}>
                            <Text style={onboardingStyles.bubbleText}>¿Y para qué te gustaría usar Smart Cities?</Text>
                        </View>
                    </View>

                    <View style={onboardingStyles.optionsContainer}>
                        {[
                            { id: 'project', text: 'Para proponer o gestionar proyectos.' },
                            { id: 'consult', text: 'Para consultar servicios y noticias de la comunidad.' },
                            { id: 'bank', text: 'Para acceder a servicios Banorte o trámites financieros.' },
                        ].map(option => (
                            <OptionCard
                                key={option.id}
                                text={option.text}
                                isSelected={selectedMotivation === option.id}
                                onPress={() => {
                                    setSelectedMotivation(option.id);
                                    setFormError('');
                                }}
                            />
                        ))}
                    </View>

                    {formError ? <Text style={onboardingStyles.errorText}>{formError}</Text> : null}

                    {/* CTA directly under options */}
                    <View style={onboardingStyles.ctaInline}>
                        <TouchableOpacity 
                            style={[
                                styles.button, 
                                selectedMotivation ? styles.primaryGreen : styles.disabled
                            ]} 
                            onPress={handleNext}
                            disabled={!selectedMotivation}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.buttonText, styles.primaryGreenText]}>CONTINUAR</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    if (isFormStep || isLastFormStep) {
        const inputKey = (isFormStep && currentFormField ? currentFormField.key : 'password') as keyof typeof formData;
        const nextButtonText = isLastFormStep ? 'CREAR CUENTA' : 'CONTINUAR';

        // compute validity depending on field type
        const fieldType = currentFormField?.type ?? 'input';
        const rawValue = (formData as any)[inputKey];
        
        let isInputValid = false;
        if (fieldType === 'photo') {
            isInputValid = !!rawValue;
        } else if (typeof rawValue === 'string') {
            isInputValid = rawValue.trim().length > 0;
        } else {
            isInputValid = !!rawValue;
        }

        return (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: WHITE }}>
                <Header
                    showBack
                    onBack={handleBack}
                    onRightPress={() => router.push('/(auth)/login')}
                    rightIconName="log-in-outline"
                    rightAccessibilityLabel="Ir a login"
                />
                {isFormStep && (
                    <View style={styles.progressBarContainer}>
                        <View style={[
                            styles.progressBar,
                            { width: `${((step - DIALOGUE_STEP_COUNT) / REGISTER_FIELD_COUNT) * 100}%` }
                        ]} />
                    </View>
                )}
                <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
                    
                    <View style={styles.formQuestion}>
                        <Text style={styles.formTitle}>
                            {isFormStep && currentFormField ? currentFormField.title : '¡Listo para crear tu cuenta!'}
                        </Text>
                        {isFormStep && currentFormField && (
                            <Animated.View entering={FadeIn.delay(200)} exiting={FadeOut} style={{ width: '100%' }}>
                                {currentFormField.type === 'input' && (
                                    <TextInput
                                        placeholder={currentFormField.placeholder}
                                        value={String((formData as any)[inputKey] ?? '')}
                                        onChangeText={(text) => {
                                            setFormData(prev => ({ ...prev, [inputKey]: text }));
                                            setFormError('');
                                        }}
                                        style={[
                                            styles.input,
                                            (currentFormField as any).multiline && styles.inputMultiline
                                        ]}
                                        keyboardType={(currentFormField.keyboardType as any) || 'default'}
                                        secureTextEntry={(currentFormField.secureTextEntry as any) || false}
                                        autoFocus={true}
                                        multiline={(currentFormField as any).multiline || false}
                                        numberOfLines={(currentFormField as any).multiline ? 3 : 1}
                                        editable={!isLoading}
                                    />
                                )}

                                {currentFormField.type === 'photo' && (
                                    <PhotoCapture 
                                        uri={(formData as any)[inputKey]} 
                                        onTake={() => pickPhotoFor(inputKey as any)} 
                                    />
                                )}

                                {currentFormField.type === 'select' && (
                                    <View style={{ width: '100%' }}>
                                        <TouchableOpacity
                                            style={styles.dropdownButton}
                                            onPress={() => setShowColoniaPicker(true)}
                                            activeOpacity={0.8}
                                            disabled={isLoading || colonias.length === 0}
                                        >
                                            <Text style={styles.dropdownText}>
                                                {(formData as any).colonia || 'Selecciona tu colonia'}
                                            </Text>
                                        </TouchableOpacity>

                                        <ColoniaPicker 
                                            visible={showColoniaPicker} 
                                            colonias={colonias} 
                                            selected={(formData as any).colonia} 
                                            onSelect={(col) => { 
                                                setFormData(prev => ({ ...prev, colonia: col })); 
                                                setFormError(''); 
                                                setShowColoniaPicker(false); 
                                            }} 
                                            onClose={() => setShowColoniaPicker(false)} 
                                        />
                                    </View>
                                )}
                            </Animated.View>
                        )}
                        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

                        {/* Show loading indicator */}
                        {isLoading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={RED} />
                                <Text style={styles.loadingText}>
                                    {isLastFormStep ? 'Creando tu cuenta...' : 'Cargando...'}
                                </Text>
                            </View>
                        )}

                        {/* Allow user to connect Banorte via Open Banking on the last step */}
                        {isLastFormStep && !isLoading && (
                            <View style={styles.bankSection}>
                                <Text style={styles.bankDesc}>
                                    Conecta con Banorte (banca abierta) para importar automáticamente tus datos financieros y agilizar el proceso.
                                </Text>
                                <TouchableOpacity
                                    style={[
                                        styles.bankButton, 
                                        (formData as any).allowOpenBanking && styles.bankButtonConnected
                                    ]}
                                    onPress={() => setFormData(prev => ({ 
                                        ...prev, 
                                        allowOpenBanking: !(prev as any).allowOpenBanking 
                                    }))}
                                    activeOpacity={0.85}
                                >
                                    {((formData as any).allowOpenBanking) ? (
                                        <Text style={[styles.bankButtonText, styles.bankButtonTextConnected]}>
                                            Conectado ✓
                                        </Text>
                                    ) : (
                                        <Text style={styles.bankButtonText}>Conectar con Banorte</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* CTA directly below the input/question */}
                        {!isLoading && (
                            <View style={onboardingStyles.ctaInline}>
                                <TouchableOpacity 
                                    style={[
                                        styles.button, 
                                        isInputValid ? styles.primaryGreen : styles.disabled
                                    ]} 
                                    onPress={handleNext}
                                    disabled={!isInputValid || isLoading}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.buttonText, styles.primaryGreenText]}>
                                        {nextButtonText}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    onboardingContainer: { 
        flex: 1, 
        backgroundColor: WHITE,
        justifyContent: 'space-between',
    },
    header: {
        width: '100%',
        paddingHorizontal: 24,
        marginTop: Constants.statusBarHeight + 10, 
        marginBottom: 40,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative', 
    },
    backButton: {
        position: 'absolute',
        left: 0,
        padding: 5,
    },
    headerLogoGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerLogo: {
        width: 45, 
        height: 45, 
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 24, 
        fontWeight: '700',
        color: RED,
    },
    headerRightButton: {
        position: 'absolute',
        right: 0,
        padding: 6,
    },
    headerRightText: {
        color: GRAY,
        fontSize: 13,
        fontWeight: '600',
    },
    progressBarContainer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        height: 8,
        backgroundColor: LIGHT_GRAY,
        borderRadius: 4,
        overflow: 'hidden',
        marginTop: 8,
    },
    progressBar: {
        height: '100%',
        backgroundColor: RED,
        borderRadius: 4,
    },
    formContainer: { 
        paddingHorizontal: 24,
        paddingVertical: 0,
        backgroundColor: WHITE,
        flexGrow: 1,
        justifyContent: 'space-between',
        maxWidth: 400,
        alignSelf: 'center',
    },
    formQuestion: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: 10,
        alignItems: 'center',
    },
    formTitle: { 
        fontSize: 24,
        fontWeight: '700',
        color: GRAY,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: LIGHT_GRAY,
        padding: 14,
        borderRadius: 12,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#fff',
        // subtle shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    inputMultiline: {
        minHeight: 80,
        textAlignVertical: 'top',
        paddingTop: 14,
    },
    loadingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        color: GRAY,
        fontSize: 14,
        fontWeight: '600',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    errorText: { 
        color: RED, 
        marginBottom: 15, 
        textAlign: 'center' 
    },
    button: {
        width: '100%',
        paddingVertical: 15, 
        paddingHorizontal: 28,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
    },
    primaryGreen: {
        // Use app primary (red) to match the index screen's CTA visual
        backgroundColor: RED,
        shadowColor: '#C82909',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    primaryGreenText: {
        color: WHITE,
        fontWeight: '800',
        fontSize: 16,
        letterSpacing: 1,
    },
    disabled: {
        backgroundColor: LIGHT_GRAY,
        shadowOpacity: 0,
        elevation: 0,
    },
    dropdownButton: {
        width: '100%',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: LIGHT_GRAY,
        backgroundColor: WHITE,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    dropdownText: {
        color: GRAY,
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    modalContent: {
        maxHeight: '70%',
        backgroundColor: WHITE,
        borderRadius: 12,
        padding: 12,
    },
    modalItem: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalItemText: {
        color: GRAY,
        fontSize: 16,
    },
    modalClose: {
        marginTop: 12,
        alignItems: 'center',
        padding: 12,
    },
    bankSection: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 6,
    },
    bankDesc: {
        color: GRAY,
        fontSize: 13,
        marginBottom: 8,
    },
    bankButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: LIGHT_GRAY,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    bankButtonConnected: {
        backgroundColor: RED,
        borderColor: RED,
    },
    bankButtonText: {
        color: GRAY,
        fontWeight: '700',
    },
    bankButtonTextConnected: {
        color: WHITE,
    },
});

const onboardingStyles = StyleSheet.create({
    contentCentered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24, 
    },
    dialogContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
        maxWidth: 400,
    },
    maya: {
        width: 100,
        height: 100,
        marginRight: 10,
    },
    bubble: {
        backgroundColor: WHITE,
        padding: 18, 
        borderRadius: 15,
        borderTopLeftRadius: 5, 
        borderWidth: 1,
        borderColor: LIGHT_GRAY,
        flex: 1,
        minHeight: 80,
        justifyContent: 'center',
    },
    bubbleText: {
        color: GRAY,
        fontSize: 17,
        fontWeight: '500',
        lineHeight: 25,
    },
    optionsContainer: {
        width: '100%',
        maxWidth: 400,
        gap: 15, 
        marginBottom: 20,
    },
    optionCard: {
        width: '100%',
        backgroundColor: WHITE,
        padding: 20, 
        borderRadius: 15,
        borderWidth: 2,
        borderColor: LIGHT_GRAY,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    optionCardSelected: {
        borderColor: RED,
        backgroundColor: '#F0FFF0',
        borderWidth: 3,
    },
    optionText: {
        color: GRAY,
        fontSize: 16, 
        fontWeight: '600',
    },
    optionTextSelected: {
        color: RED,
        fontWeight: '700',
    },
    ctaFixed: {
        paddingHorizontal: 24,
        paddingBottom: 20,
        width: '100%',
        alignItems: 'center',
        maxWidth: 400, // match index screen button max width
        alignSelf: 'center',
    },
    ctaInline: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        marginTop: 16,
    },
    errorText: {
        color: RED, 
        marginBottom: 10, 
        textAlign: 'center', 
        paddingHorizontal: 24 
    }
});