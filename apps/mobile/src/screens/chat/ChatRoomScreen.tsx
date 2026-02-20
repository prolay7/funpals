/**
 * ChatRoomScreen.tsx — Full-featured chat room.
 *
 * Features:
 *  • Fetches message history from GET /channels/:id/messages on mount
 *  • Appends real-time messages via Redux chatSlice (populated by useWebSocket)
 *  • Infinite scroll: tapping "Load older messages" fetches the next page
 *  • Sends messages via WebSocket { type: 'send_message', channelId, content }
 *  • Emits typing events via WebSocket and shows TypingIndicator for others
 *  • Inverted FlatList keeps newest messages at the bottom
 *  • AppHeader with back button and channel name
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { ChatStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store';
import { appendMessage, setMessages } from '../../store/chatSlice';
import { useWebSocket } from '../../hooks/useWebSocket';
import { apiClient } from '../../utils/api';
import { AppHeader } from '../../components/common';
import MessageBubble from '../../components/chat/MessageBubble';
import TypingIndicator from '../../components/chat/TypingIndicator';
import ChatInput from '../../components/chat/ChatInput';
import { colors } from '../../theme/colors';

type Props = StackScreenProps<ChatStackParamList, 'ChatRoom'>;

const PAGE_SIZE = 40;

interface Message {
  id:          string;
  content:     string;
  sender_id:   string;
  sender_name: string;
  created_at:  string;
  type:        string;
}

export default function ChatRoomScreen({ route, navigation }: Props) {
  const { channelId, channelName } = route.params;

  const dispatch    = useAppDispatch();
  const { send }    = useWebSocket();
  const currentUser = useAppSelector(s => s.auth.user);
  const messages    = useAppSelector(s => s.chat.messagesByChannel[channelId] ?? []);

  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore,     setHasMore]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  // Cursor = oldest message id fetched so far (for pagination)
  const cursorRef = useRef<string | null>(null);

  // ── Fetch initial message history ──────────────────────────────────────────
  const fetchMessages = useCallback(async (before?: string) => {
    try {
      const params: Record<string, string | number> = { limit: PAGE_SIZE };
      if (before) params.before = before;

      const res = await apiClient.get(`/channels/${channelId}/messages`, { params });
      const fetched: Message[] = res.data.data ?? [];

      if (before) {
        // Prepend older messages — deduplicate via Redux appendMessage pattern
        fetched.forEach(m =>
          dispatch(appendMessage({ channelId, message: m }))
        );
      } else {
        // Initial load: replace store slice for this channel
        dispatch(setMessages({ channelId, messages: fetched }));
      }

      if (fetched.length < PAGE_SIZE) setHasMore(false);
      if (fetched.length > 0) cursorRef.current = fetched[0].id;
    } catch (err) {
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [channelId, dispatch]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // ── Load older messages ────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || !cursorRef.current) return;
    setLoadingMore(true);
    fetchMessages(cursorRef.current);
  }, [loadingMore, hasMore, fetchMessages]);

  // ── Send a message ─────────────────────────────────────────────────────────
  const handleSend = useCallback((text: string) => {
    send({ type: 'send_message', channelId, content: text });

    // Optimistic local append
    const optimistic: Message = {
      id:          `optimistic-${Date.now()}`,
      content:     text,
      sender_id:   String(currentUser?.id ?? ''),
      sender_name: String(currentUser?.display_name ?? 'You'),
      created_at:  new Date().toISOString(),
      type:        'text',
    };
    dispatch(appendMessage({ channelId, message: optimistic }));
  }, [send, channelId, currentUser, dispatch]);

  // ── Typing events ──────────────────────────────────────────────────────────
  const handleTyping = useCallback((isTyping: boolean) => {
    send({ type: 'typing', channelId, isTyping });
  }, [send, channelId]);

  // ── Render ─────────────────────────────────────────────────────────────────
  // FlatList is inverted: messages array is reversed so newest is at index 0
  const reversedMessages = [...messages].reverse();
  const myId = String(currentUser?.id ?? '');

  const renderItem = useCallback(({ item }: { item: Message }) => (
    <MessageBubble message={item} isMine={item.sender_id === myId} />
  ), [myId]);

  const ListHeaderComponent = (
    <>
      {loadingMore && (
        <ActivityIndicator color={colors.accent} style={styles.loadMoreIndicator} />
      )}
      {hasMore && !loadingMore && messages.length >= PAGE_SIZE && (
        <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore}>
          <Text style={styles.loadMoreText}>Load older messages</Text>
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <AppHeader
        title={channelName}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.flex}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.accent} size="large" />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); fetchMessages(); }}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={reversedMessages}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            inverted
            contentContainerStyle={styles.listContent}
            ListFooterComponent={ListHeaderComponent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>

      <TypingIndicator channelId={channelId} />
      <ChatInput channelId={channelId} onSend={handleSend} onTyping={handleTyping} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:              { flex: 1, backgroundColor: colors.background },
  centered:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent:       { paddingVertical: 12 },
  loadMoreBtn:       {
    alignSelf:       'center',
    marginVertical:   12,
    paddingVertical:   8,
    paddingHorizontal: 20,
    backgroundColor:  colors.surface,
    borderRadius:     20,
    borderWidth:      1,
    borderColor:      colors.border,
  },
  loadMoreText:      { fontSize: 13, color: colors.accent, fontWeight: '600' },
  loadMoreIndicator: { marginVertical: 16 },
  errorText:         { fontSize: 14, color: colors.error, textAlign: 'center', marginBottom: 12 },
  retryBtn:          { paddingVertical: 10, paddingHorizontal: 24, backgroundColor: colors.accent, borderRadius: 8 },
  retryText:         { color: '#FFF', fontWeight: '600' },
});
