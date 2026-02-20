/**
 * UserDetailScreen.tsx — Stub (Phase 4).
 * Full implementation: user profile view, skills, goals, meet/message actions.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { NearbyStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Props = StackScreenProps<NearbyStackParamList, 'UserDetail'>;

export default function UserDetailScreen({ route }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{route.params.displayName}</Text>
      <Text style={styles.sub}>User profile — coming in Phase 4</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  title:     { fontSize: 20, fontWeight: '700', color: colors.primary },
  sub:       { fontSize: 14, color: colors.textMuted, marginTop: 8 },
});
