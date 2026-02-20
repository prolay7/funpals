/**
 * RadiusChips.tsx — Quick-select radius filter for NearbyScreen.
 * Options: 10 / 25 / 50 / 100 miles.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const OPTIONS = [10, 25, 50, 100] as const;
type RadiusOption = (typeof OPTIONS)[number];

interface Props {
  value:    number;
  onChange: (radius: RadiusOption) => void;
}

export default function RadiusChips({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {OPTIONS.map(r => (
        <TouchableOpacity
          key={r}
          style={[styles.chip, value === r && styles.chipActive]}
          onPress={() => onChange(r)}
          activeOpacity={0.8}
        >
          <Text style={[styles.label, value === r && styles.labelActive]}>{r} mi</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row:         { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  chip:        { flex: 1, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center' },
  chipActive:  { borderColor: colors.accent, backgroundColor: colors.accent + '18' },
  label:       { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  labelActive: { color: colors.accent },
});
