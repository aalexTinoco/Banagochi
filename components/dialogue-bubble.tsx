import { GRAY, LIGHT_GRAY, WHITE } from '@/css/globalcss';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function DialogueBubble({ dialogueText, onFinish }: { dialogueText: string; onFinish?: () => void }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    const textLength = dialogueText.length;
    let index = 0;

    const interval = setInterval(() => {
      if (index < textLength) {
        setDisplayedText(prev => prev + dialogueText.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        if (onFinish) onFinish();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [dialogueText, onFinish]);

  return (
    <View style={styles.dialogContainer}>
      <Image source={require('@/assets/images/maya.png')} style={styles.maya} />
      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>{displayedText}{isTyping ? '|' : ''}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dialogContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    maxWidth: 400,
  },
  maya: { width: 100, height: 100, marginRight: 10 },
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
  bubbleText: { color: GRAY, fontSize: 17, fontWeight: '500', lineHeight: 25 },
});
