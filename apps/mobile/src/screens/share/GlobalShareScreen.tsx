/**
 * GlobalShareScreen.tsx — Stub (Phase 6).
 * Full implementation: share text content to a channel or globally.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function GlobalShareScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share</Text>
      <Text style={styles.sub}>Coming in Phase 6</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  title:     { fontSize: 20, fontWeight: '700', color: colors.primary },
  sub:       { fontSize: 14, color: colors.textMuted, marginTop: 8 },
});
