import { GRAY, LIGHT_GRAY, RED, WHITE } from '@/css/globalcss';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function OptionCard({ text, isSelected, onPress }: { text: string; isSelected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.optionCard, isSelected && styles.optionCardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});
