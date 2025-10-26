import { GRAY, LIGHT_GRAY, RED, WHITE } from '@/css/globalcss';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type CardInfo = {
  id: string;
  last4: string;
  type: string;
  balance: number;
  currency?: string;
  color?: string;
  image?: any;
};

export default function CardCarousel({ name, cards }: { name: string; cards: CardInfo[] }) {
  const [index, setIndex] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const width = Math.min(Dimensions.get('window').width - 48, 380);

  const isLocked = selectedCardId !== null;
  const currentCard = cards[index];

  const handleAction = () => {
    if (!currentCard) return;
    if (selectedCardId === currentCard.id) {
      setSelectedCardId(null);
      return;
    }
    setSelectedCardId(currentCard.id);
  };

  return (
    <View style={styles.carouselContainer}>
      <Text style={styles.welcome}>Hola, <Text style={{ fontWeight: '800' }}>{name}</Text></Text>
      <Text style={styles.subtitle}>Selecciona una tarjeta para usar</Text>

      <ScrollView
        horizontal
        pagingEnabled
        snapToAlignment="center"
        contentContainerStyle={{ paddingHorizontal: 12 }}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={!isLocked}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / (width + 16));
          setIndex(newIndex);
        }}
      >
        {cards.map((c) => {
          const isSelected = selectedCardId === c.id;
          const containerStyle = [styles.card, { width }];

          if (c.image) {
            return (
              <ImageBackground key={c.id} source={c.image} style={containerStyle} imageStyle={{ borderRadius: 14 }}>
                <View style={styles.cardOverlay}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.cardType}>{c.type}</Text>
                    <Text style={styles.cardBalance}>{c.currency ?? 'MXN'} {c.balance.toFixed(2)}</Text>
                  </View>
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={styles.cardNumber}>•••• •••• •••• {c.last4}</Text>
                  </View>
                  <View style={[styles.cardFooter, isSelected && styles.cardFooterSelected]}>
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark-circle" size={20} color={WHITE} />
                        <Text style={[styles.selectedBadgeText]}>Seleccionada</Text>
                      </View>
                    )}
                  </View>
                </View>
              </ImageBackground>
            );
          }

          return (
            <View key={c.id} style={[...containerStyle, { backgroundColor: c.color ?? RED }]}> 
              <View style={styles.cardTopRow}>
                <Text style={styles.cardType}>{c.type}</Text>
                <Text style={styles.cardBalance}>{c.currency ?? 'MXN'} {c.balance.toFixed(2)}</Text>
              </View>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.cardNumber}>•••• •••• •••• {c.last4}</Text>
              </View>
              <View style={[styles.cardFooter, isSelected && styles.cardFooterSelected]}>
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color={WHITE} />
                    <Text style={[styles.selectedBadgeText]}>Seleccionada</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.pager}> 
        {cards.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && { backgroundColor: RED, width: 22 }]} />
        ))}
      </View>

      <View style={styles.actionWrapper}>
        <TouchableOpacity
          style={[styles.button, selectedCardId === currentCard?.id ? styles.primaryOutline : styles.primary]}
          onPress={handleAction}
          activeOpacity={0.85}
        >
          <Text style={[styles.buttonText, selectedCardId === currentCard?.id ? styles.primaryOutlineText : styles.primaryText]}>
            {selectedCardId === currentCard?.id ? 'Cambiar tarjeta' : 'Usar esta tarjeta'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: { marginTop: 12, marginBottom: 20, alignItems: 'center' },
  welcome: { fontSize: 18, color: GRAY, marginBottom: 6 },
  subtitle: { color: GRAY, marginBottom: 12 },
  card: {
    marginHorizontal: 8,
    borderRadius: 14,
    padding: 18,
    height: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardType: { color: WHITE, fontWeight: '700' },
  cardBalance: { color: WHITE, fontWeight: '700', marginTop: 22 },
  cardNumber: { color: 'rgba(255,255,255,0.95)', fontSize: 22, fontWeight: '800', letterSpacing: 3 },
  cardFooter: { alignItems: 'flex-end' },
  cardImage: { width: '100%', height: 120, borderRadius: 10 },
  cardOverlay: { flex: 1, padding: 18, justifyContent: 'space-between' },
  cardFooterSelected: { alignItems: 'flex-start', paddingTop: 8 },
  selectedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.18)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  selectedBadgeText: { color: WHITE, marginLeft: 8, fontWeight: '700' },

  actionWrapper: { marginTop: 16, width: '100%', maxWidth: 420, alignSelf: 'center', paddingHorizontal: 16 },
  button: { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: RED },
  primaryOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: RED },
  primaryText: { color: WHITE, fontWeight: '800' },
  primaryOutlineText: { color: RED, fontWeight: '800' },
  buttonText: { fontSize: 16 },

  pager: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  dot: { height: 8, backgroundColor: LIGHT_GRAY, borderRadius: 8, marginHorizontal: 6, width: 8 },
});
