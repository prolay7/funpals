/**
 * OpenPostsScreen.tsx — Stub (Phase 6).
 * Full implementation: post feed + create post (title, content, tags).
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function OpenPostsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Open Posts</Text>
      <Text style={styles.sub}>Coming in Phase 6</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  title:     { fontSize: 20, fontWeight: '700', color: colors.primary },
  sub:       { fontSize: 14, color: colors.textMuted, marginTop: 8 },
});
