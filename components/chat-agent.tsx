import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface ChatAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  sender: 'user' | 'agent';
  text: string;
}

const ChatAgentModal = ({ open, onOpenChange }: ChatAgentModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, newMessage]);
    const messageToSend = input;
    setInput('');
    setLoading(true);

    try {
      // show typing placeholder
      setMessages((prev) => [...prev, { sender: 'agent', text: '...' }]);

      const res = await fetch('https://faqbanorte-production.up.railway.app/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'cristianvargas_01', message: messageToSend }),
      });

      const data = await res.json();

      // replace the "..." with real response
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { sender: 'agent', text: data.response || 'No se pudo obtener respuesta.' },
      ]);
    } catch (error) {
      console.error('Error al conectar con el agente:', error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { sender: 'agent', text: 'Hubo un error al conectar con el agente.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={open} animationType="slide" transparent={false} onRequestClose={() => onOpenChange(false)}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Maya 🤖</Text>
            <Pressable onPress={() => onOpenChange(false)} style={styles.closeButton} accessibilityRole="button">
              <Text style={styles.closeText}>Cerrar</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.messagesContainer} contentContainerStyle={{ padding: 12 }}>
            {messages.length === 0 && (
              <Text style={styles.emptyText}>Hola 👋, soy tu asistente Banorte. ¿En qué puedo ayudarte hoy?</Text>
            )}

            {messages.map((msg, index) => (
              <View key={index} style={[styles.messageRow, msg.sender === 'user' ? styles.msgRowEnd : styles.msgRowStart]}>
                <View style={[styles.bubble, msg.sender === 'user' ? styles.bubbleUser : styles.bubbleAgent]}>
                  <Text style={styles.bubbleText}>{msg.text}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              placeholder="Escribe tu mensaje..."
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => sendMessage()}
              editable={!loading}
              style={styles.textInput}
            />
            <TouchableOpacity onPress={sendMessage} disabled={loading || !input.trim()} style={styles.sendButton}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendText}>Enviar</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 18, fontWeight: '600' },
  closeButton: { padding: 8 },
  closeText: { color: '#6b7280' },
  messagesContainer: { flex: 1, backgroundColor: '#f9fafb' },
  emptyText: { textAlign: 'center', color: '#6b7280', marginTop: 12 },
  messageRow: { marginVertical: 6, paddingHorizontal: 12 },
  msgRowStart: { alignItems: 'flex-start' },
  msgRowEnd: { alignItems: 'flex-end' },
  bubble: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, maxWidth: '75%' },
  bubbleUser: { backgroundColor: '#ef476f' },
  bubbleAgent: { backgroundColor: '#f3f4f6' },
  bubbleText: { color: '#111827' },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', alignItems: 'center' },
  textInput: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f3f4f6' },
  sendButton: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#DB2777', borderRadius: 8, marginLeft: 8 },
  sendText: { color: '#fff', fontWeight: '600' },
  triggerContainer: { position: 'absolute', bottom: 16, right: 16, zIndex: 9999 },
  triggerButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  triggerImage: { width: 44, height: 44, borderRadius: 22, position: 'absolute', left: -8, top: -6, zIndex: 0 },
  triggerTextContainer: { paddingLeft: 36 },
  triggerText: { color: '#fff', fontWeight: '700' },
  triggerButtonRed: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EB0029', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, elevation: 6, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
});

export default function ChatAgent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ChatAgentModal open={open} onOpenChange={setOpen} />

      <View style={styles.triggerContainer} pointerEvents="box-none">
        <TouchableOpacity activeOpacity={0.9} onPress={() => setOpen(true)} style={styles.triggerButtonRed}>
          {/* Maya image tucked behind the left side */}
          <Image source={require('@/assets/images/maya.png')} style={styles.triggerImage} />

          <View style={styles.triggerTextContainer}>
            <Text style={styles.triggerText}>Chatea conmigo</Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
}
