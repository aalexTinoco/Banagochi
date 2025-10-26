import { GRAY, RED, WHITE } from '@/css/globalcss';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
 
export default function AuthStart() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={{ flex: 1, backgroundColor: WHITE }}>
        <View style={styles.header}>
            <View style={styles.headerLogoGroup}>
                <Image
                    source={require('@/assets/images/header-logo.png')}
                    style={styles.headerLogo}
                    contentFit="contain"
                />
                <Text style={styles.headerTitle}>Smart Cities</Text>
            </View>
        </View>
        <View style={styles.mainContent}>
            <View style={styles.imageSection}>
                <Image
                    source={require('@/assets/images/maya.png')}
                    style={styles.maya}
                    contentFit="contain"
                />
            </View>
            <View style={styles.textButtonSection}>
                <Text style={styles.mainTitle}>La aplicación segura, efectiva y ajustable para la gestión de proyectos comunitarios</Text>
                <View style={styles.buttons}>
                    <TouchableOpacity
                        style={[styles.button, styles.primaryGreen]}
                        onPress={() => router.push('/register' as any)}
                        activeOpacity={0.8}>
                        <Text style={[styles.buttonText, styles.primaryGreenText]}>EMPEZAR</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.secondaryOutline]}
                        onPress={() => router.push('/login' as any)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.buttonText, styles.secondaryOutlineText]}>YA TENGO UNA CUENTA</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
        
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 0, 
    backgroundColor: WHITE,
  },

  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40, 
    paddingHorizontal: 24,
    marginTop: Constants.statusBarHeight + 10, 
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

  mainContent: {
    flex: 1,
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingBottom: 40, 
  },

  imageSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  maya: {
    width: 250, 
    height: 250,
  },

  textButtonSection: {
    width: '100%', 
    maxWidth: 400, 
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: GRAY,
    marginBottom: 40,
    lineHeight: 36,
    textAlign: 'center',
  },
  buttons: {
    width: '100%', 
    gap: 15,
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
  secondaryOutline: {
    backgroundColor: WHITE,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    shadowOpacity: 0,
    elevation: 0,
  },
  secondaryOutlineText: {
    color: GRAY,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});