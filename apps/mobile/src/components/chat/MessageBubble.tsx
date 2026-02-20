/**
 * MessageBubble.tsx — Individual chat message bubble.
 *
 * isMine = true  → teal fill, right-aligned, no sender name
 * isMine = false → white card, left-aligned, sender name shown
 * Timestamp displayed as HH:mm below the message text.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface Message {
  id:          string;
  content:     string;
  sender_id:   string;
  sender_name: string;
  created_at:  string;
  type:        string;
}

interface Props {
  message: Message;
  isMine:  boolean;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function MessageBubble({ message, isMine }: Props) {
  return (
    <View style={[styles.row, isMine ? styles.rowRight : styles.rowLeft]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        {!isMine && (
          <Text style={styles.senderName}>{message.sender_name}</Text>
        )}
        <Text style={[styles.content, isMine ? styles.contentMine : styles.contentTheirs]}>
          {message.content}
        </Text>
        <Text style={[styles.time, isMine ? styles.timeMine : styles.timeTheirs]}>
          {formatTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row:          { marginVertical: 4, paddingHorizontal: 12 },
  rowRight:     { alignItems: 'flex-end' },
  rowLeft:      { alignItems: 'flex-start' },

  bubble: {
    maxWidth:     '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical:   10,
    shadowColor:  '#000',
    shadowOpacity: 0.06,
    shadowRadius:  4,
    elevation:    2,
  },
  bubbleMine: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },

  senderName: {
    fontSize:    12,
    fontWeight:  '600',
    color:       colors.accent,
    marginBottom: 3,
  },

  content:      { fontSize: 15, lineHeight: 22 },
  contentMine:  { color: '#FFFFFF' },
  contentTheirs:{ color: colors.text },

  time:         { fontSize: 11, marginTop: 4 },
  timeMine:     { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  timeTheirs:   { color: colors.textMuted, textAlign: 'right' },
});
