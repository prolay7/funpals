/**
 * EventDetailScreen.tsx — Stub (Phase 5).
 * Full implementation: event info, RSVP (going / maybe / declined).
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Props = StackScreenProps<HomeStackParamList, 'EventDetail'>;

export default function EventDetailScreen({ route }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{route.params.title}</Text>
      <Text style={styles.sub}>Event detail — coming in Phase 5</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  title:     { fontSize: 20, fontWeight: '700', color: colors.primary },
  sub:       { fontSize: 14, color: colors.textMuted, marginTop: 8 },
});
