import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// styles use local colors; avoid unused imports
import { Project } from '@/app/state/projects-store';

export default function ProjectCard({ project, width, onPress }: { project: Project; width?: number; onPress?: () => void }) {
  const percent = Math.round((project.donated / project.goal) * 100);
  return (
    <TouchableOpacity style={[styles.shareCard, width ? { width } : {}, { backgroundColor: '#fff' }]} activeOpacity={0.9} onPress={onPress}>
      <ImageBackground source={project.image ? project.image : require('@/assets/images/Banorte-TDC-Basica-.avif')} style={styles.cardImage} imageStyle={{ borderRadius: 12 }}>
        <View style={styles.cardImageOverlay}>
          <Text style={styles.shareCardTitleWhite}>{project.title}</Text>
          <View style={styles.shareCardFooterRow}>
            <View style={styles.progressContainerSmallLight}>
              <View style={[styles.progressFillLight, { width: `${Math.min(100, Math.max(0, percent))}%` }]} />
            </View>
            <Text style={styles.smallMetaLight}>{`$${project.donated.toLocaleString()} de $${project.goal.toLocaleString()}`}</Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shareCard: { borderRadius: 14, padding: 14, marginRight: 12, marginVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardImage: { width: '100%', height: 160, borderRadius: 12, overflow: 'hidden', justifyContent: 'flex-end' },
  cardImageOverlay: { backgroundColor: 'rgba(0,0,0,0.28)', padding: 12, borderRadius: 12 },
  shareCardTitleWhite: { fontSize: 15, fontWeight: '800', color: '#fff' },
  shareCardFooterRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressContainerSmallLight: { height: 8, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 8, overflow: 'hidden', flex: 1, marginRight: 8 },
  progressFillLight: { height: '100%', backgroundColor: 'rgba(255,255,255,0.95)' },
  smallMetaLight: { marginTop: 8, color: 'rgba(255,255,255,0.9)' },
});
