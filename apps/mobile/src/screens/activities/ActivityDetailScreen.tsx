/**
 * ActivityDetailScreen.tsx — Stub (Phase 5).
 * Full implementation: full activity detail, external link, join button.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { ActivitiesStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Props = StackScreenProps<ActivitiesStackParamList, 'ActivityDetail'>;

export default function ActivityDetailScreen({ route }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{route.params.title}</Text>
      <Text style={styles.sub}>Activity detail — coming in Phase 5</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  title:     { fontSize: 20, fontWeight: '700', color: colors.primary },
  sub:       { fontSize: 14, color: colors.textMuted, marginTop: 8 },
});
