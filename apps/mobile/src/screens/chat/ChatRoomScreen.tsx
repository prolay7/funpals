/**
 * ChatRoomScreen.tsx — Stub (Phase 3).
 * Full implementation: message list, real-time WebSocket, chat input.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { ChatStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Props = StackScreenProps<ChatStackParamList, 'ChatRoom'>;

export default function ChatRoomScreen({ route }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{route.params.channelName}</Text>
      <Text style={styles.sub}>Chat room — coming in Phase 3</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  title:     { fontSize: 20, fontWeight: '700', color: colors.primary },
  sub:       { fontSize: 14, color: colors.textMuted, marginTop: 8 },
});
