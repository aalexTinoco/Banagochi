import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Asumo que estas constantes existen en '@/css/globalcss'
const GRAY = '#5E6D7E';       // Gris para texto secundario
const RED = '#e81d4b';        // Rojo principal (para logo/patrocinadores si aplica)
const GREEN = '#6ACD00';      // Verde Duolingo (para el botón principal)
const WHITE = '#FFFFFF';      // Blanco

// Obtener dimensiones para un diseño responsive básico
const { width } = Dimensions.get('window');

// Componente para un logo de patrocinador (simulado)
const SponsorLogo = ({ name, source }) => (
    <View style={sponsorStyles.logoContainer}>
        {/* Usarías tu propia imagen para el logo de Banorte y otros */}
        <Image
            source={source} 
            style={sponsorStyles.logo}
            contentFit="contain"
        />
        <Text style={sponsorStyles.logoText}>{name}</Text>
    </View>
);

export default function AuthStart() {
  const router = useRouter();

  return (
    // Usamos ScrollView para asegurar que el contenido se ve bien en pantallas pequeñas
    <ScrollView contentContainerStyle={styles.scrollContainer} style={{ flex: 1, backgroundColor: WHITE }}>
        
        {/* 1. Encabezado Fijo (como el de Duolingo) */}
        <View style={styles.header}>
            <View style={styles.headerLogoGroup}>
                {/* Asume que header-logo.png es la imagen pequeña del periquito */}
                <Image
                    source={require('@/assets/images/header-logo.png')}
                    style={styles.headerLogo}
                    contentFit="contain"
                />
                <Text style={styles.headerTitle}>Smart Cities</Text>
            </View>
            {/* Si tuvieras un selector de idioma a la derecha (opcional, Duolingo lo tiene) */}
            {/* <Text style={styles.siteLanguage}>SITE LANGUAGE: ENGLISH</Text> */}
        </View>

        {/* 2. Contenido Principal Centrado */}
        <View style={styles.mainContent}>
            
            {/* Fila Principal */}
            <View style={styles.mainRow}>
                
                {/* Columna Izquierda: Imagen Grande */}
                <View style={styles.leftColumn}>
                    {/* Asume que maya.png es la imagen grande del periquito */}
                    <Image
                        source={require('@/assets/images/maya.png')}
                        style={styles.maya}
                        contentFit="contain"
                    />
                </View>

                {/* Columna Derecha: Texto y Botones */}
                <View style={styles.rightColumn}>
                    <Text style={styles.mainTitle}>the secure, fun, and effective way to build community projects</Text>

                    <View style={styles.buttons}>
                        {/* Botón Principal (Verde sólido, estilo GET STARTED de Duolingo) */}
                        <TouchableOpacity
                            style={[styles.button, styles.primaryGreen]}
                            onPress={() => router.push('/register' as any)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.buttonText, styles.primaryGreenText]}>GET STARTED</Text>
                        </TouchableOpacity>

                        {/* Botón Secundario (Borde blanco, estilo I ALREADY HAVE AN ACCOUNT) */}
                        <TouchableOpacity
                            style={[styles.button, styles.secondaryOutline]}
                            onPress={() => router.push('/login' as any)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.buttonText, styles.secondaryOutlineText]}>I ALREADY HAVE AN ACCOUNT</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>

        {/* 3. Footer/Barra de Patrocinadores (Sponsors) */}
        <View style={sponsorStyles.sponsorBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={sponsorStyles.sponsorContent}>
                <SponsorLogo name="Banorte" source={require('@/assets/images/header-logo.png')} />
                <SponsorLogo name="Gobierno" source={require('@/assets/images/header-logo.png')} />
                <SponsorLogo name="Tecnológico" source={require('@/assets/images/header-logo.png')} />
                <SponsorLogo name="Comunidad" source={require('@/assets/images/header-logo.png')} />
            </ScrollView>
        </View>
        
    </ScrollView>
  );
}

// ------------------------------------------------------------------

const styles = StyleSheet.create({
  // Contenedor para el ScrollView para que se vea limpio
  scrollContainer: {
    flexGrow: 1, // Permite que el contenido ocupe el espacio disponible
    justifyContent: 'space-between', // Coloca el footer al final
    paddingTop: 20,
    paddingBottom: 0, // Quitamos padding para que la barra de sponsors toque el borde
  },

  // 1. Estilos del Encabezado (posicionado arriba y centrado horizontalmente)
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerLogoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 25, // Más pequeño
    height: 25,
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: RED, // Mantengo el color de tu logo
  },
  siteLanguage: {
    fontSize: 14,
    color: GRAY,
    fontWeight: '600',
  },

  // 2. Contenido Principal (El centro de la página, centrado vertical y horizontal)
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 1000, // Limita el ancho en pantallas grandes (similar a Duolingo)
  },

  // Columna Izquierda: Periquito
  leftColumn: {
    flex: 1, // Le damos flexibilidad
    alignItems: 'center',
    paddingRight: width * 0.05, // Espaciado dinámico
  },
  maya: {
    width: width * 0.35, // El periquito toma un porcentaje del ancho
    height: width * 0.35,
    minWidth: 200, // Tamaño mínimo
    minHeight: 200,
    maxWidth: 350, // Tamaño máximo
    maxHeight: 350,
  },

  // Columna Derecha: Texto y Botones
  rightColumn: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: width * 0.05, // Espaciado dinámico
    justifyContent: 'center',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: GRAY,
    marginBottom: 30,
    lineHeight: 40,
  },
  buttons: {
    width: 300, // Fija el ancho de los botones para que se vean mejor
    gap: 15,
  },

  // Estilos de los botones inspirados en Duolingo
  button: {
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra Duolingo
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  // Botón GET STARTED (Verde Duolingo)
  primaryGreen: {
    backgroundColor: GREEN,
    // Sombra más intensa y oscura para el efecto 3D que pediste antes, ajustado al verde
    shadowColor: '#3d7c00', 
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  primaryGreenText: {
    color: WHITE,
    fontWeight: '800', // Más negrita
    fontSize: 16,
    letterSpacing: 1,
  },

  // Botón I ALREADY HAVE AN ACCOUNT (Outline/Borde blanco)
  secondaryOutline: {
    backgroundColor: WHITE,
    borderWidth: 2,
    borderColor: '#E5E5E5', // Borde gris muy claro
    shadowOpacity: 0, // Sin sombra para que parezca "hundido"
    elevation: 0,
  },
  secondaryOutlineText: {
    color: GRAY,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
});

// ------------------------------------------------------------------

// Estilos específicos para la barra de patrocinadores
const sponsorStyles = StyleSheet.create({
    sponsorBar: {
        width: '100%',
        height: 80, // Altura fija para la barra
        backgroundColor: '#F7F7F7', // Un gris muy claro para el fondo
        borderTopWidth: 1,
        borderTopColor: '#EBEBEB', // Borde superior sutil
        justifyContent: 'center',
    },
    sponsorContent: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 15, // Espacio entre logos
    },
    logo: {
        width: 40,
        height: 40,
        marginRight: 8,
    },
    logoText: {
        fontSize: 14,
        fontWeight: '600',
        color: GRAY,
    },
});