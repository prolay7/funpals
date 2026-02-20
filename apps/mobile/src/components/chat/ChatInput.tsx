/**
 * ChatInput.tsx — Message composition bar.
 * - Multiline TextInput that grows up to 4 lines.
 * - Send button: teal circle with ➤ arrow, disabled when text is empty.
 * - Emits typing WS events (debounced clear after 2 s of no input).
 * - Calls onSend(trimmedText) and clears the field on submit.
 */
import React, { useCallback, useRef, useState } from 'react';
import {
  View, TextInput, TouchableOpacity, Text, StyleSheet, Platform,
} from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  channelId: string;
  onSend:    (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
}

export default function ChatInput({ channelId, onSend, onTyping }: Props) {
  const [text, setText]         = useState('');
  const typingTimerRef          = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef             = useRef(false);

  const handleChangeText = useCallback((value: string) => {
    setText(value);

    if (!isTypingRef.current && value.length > 0) {
      isTypingRef.current = true;
      onTyping?.(true);
    }

    // Stop-typing signal after 2 s of inactivity
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        onTyping?.(false);
      }
    }, 2000);
  }, [onTyping]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Stop typing signal immediately on send
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTyping?.(false);
    }

    onSend(trimmed);
    setText('');
  }, [text, onSend, onTyping]);

  const canSend = text.trim().length > 0;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={handleChangeText}
        placeholder="Type a message..."
        placeholderTextColor={colors.textMuted}
        multiline
        maxLength={2000}
        returnKeyType="default"
        blurOnSubmit={false}
        textAlignVertical="center"
      />
      <TouchableOpacity
        style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
        onPress={handleSend}
        disabled={!canSend}
        activeOpacity={0.75}
      >
        <Text style={styles.sendIcon}>➤</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:    'row',
    alignItems:       'flex-end',
    paddingHorizontal: 12,
    paddingVertical:   10,
    backgroundColor:  colors.surface,
    borderTopWidth:   1,
    borderTopColor:   colors.border,
  },
  input: {
    flex:             1,
    minHeight:        42,
    maxHeight:        110,
    backgroundColor:  colors.background,
    borderRadius:     21,
    paddingHorizontal: 16,
    paddingVertical:  Platform.OS === 'ios' ? 11 : 8,
    fontSize:         15,
    color:            colors.text,
    marginRight:      10,
  },
  sendBtn: {
    width:           42,
    height:          42,
    borderRadius:    21,
    backgroundColor: colors.accent,
    alignItems:      'center',
    justifyContent:  'center',
  },
  sendBtnDisabled: { backgroundColor: colors.border },
  sendIcon: {
    color:      '#FFF',
    fontSize:   16,
    fontWeight: '700',
  },
});
