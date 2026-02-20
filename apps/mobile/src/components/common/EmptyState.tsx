/**
 * EmptyState.tsx — Centred placeholder for empty lists or zero-result screens.
 * Displays an emoji icon, a title, an optional subtitle, and an optional CTA.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  icon?:        string;   // emoji character
  title:        string;
  subtitle?:    string;
  actionLabel?: string;
  onAction?:    () => void;
}

export default function EmptyState({
  icon = '🔍', title, subtitle, actionLabel, onAction,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.btn} onPress={onAction} activeOpacity={0.8}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  icon:     { fontSize: 52, marginBottom: 16 },
  title:    { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  btn:      {
    marginTop:       20,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius:    10,
  },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
