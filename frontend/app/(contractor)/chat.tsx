import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import api from '../../src/api/client';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  timestamp: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const { colors } = useThemeStore();
  const jobId = params.jobId as string;
  const otherName = (params.otherName as string) || 'Chat';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const pollingRef = useRef<any>(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/${jobId}/messages`);
      setMessages(res.data);
    } catch (e) {
      console.error('Chat fetch error:', e);
    }
  };

  useEffect(() => {
    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 3000);
    return () => clearInterval(pollingRef.current);
  }, [jobId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      await api.post(`/chat/${jobId}/send`, { message: input.trim() });
      setInput('');
      fetchMessages();
    } catch (e: any) {
      console.error('Send error:', e);
    } finally {
      setSending(false);
    }
  };

  const isMe = (senderId: string) => senderId === user?.id;

  const renderMessage = ({ item }: { item: Message }) => {
    const mine = isMe(item.sender_id);
    return (
      <View style={[styles.bubble, mine ? styles.bubbleRight : styles.bubbleLeft, { backgroundColor: mine ? colors.accent : colors.surface }]}>
        {!mine && <Text style={[styles.senderName, { color: colors.textMuted }]}>{item.sender_name}</Text>}
        <Text style={[styles.messageText, { color: mine ? colors.accentText : colors.text }]}>{item.message}</Text>
        <Text style={[styles.time, { color: mine ? colors.accentText + '99' : colors.textMuted }]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} data-testid="chat-screen">
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: colors.text }]}>{otherName}</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>Job Chat</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyChatText, { color: colors.textMuted }]}>No messages yet</Text>
            <Text style={[styles.emptyChatSub, { color: colors.textMuted }]}>Start the conversation!</Text>
          </View>
        }
      />

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.inputRow, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg }]}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.accent : colors.surfaceAlt }]}
            onPress={sendMessage}
            disabled={!input.trim() || sending}
          >
            <Ionicons name="send" size={18} color={input.trim() ? colors.accentText : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4, marginRight: 10 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700' },
  headerSub: { fontSize: 12 },
  messageList: { padding: 16, flexGrow: 1 },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyChatText: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  emptyChatSub: { fontSize: 13, marginTop: 4 },
  bubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, marginBottom: 8 },
  bubbleLeft: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleRight: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  senderName: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  messageText: { fontSize: 14, lineHeight: 20 },
  time: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, borderTopWidth: 1, gap: 8 },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
