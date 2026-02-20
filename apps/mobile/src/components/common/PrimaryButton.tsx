/**
 * PrimaryButton.tsx — Reusable CTA button with loading state.
 *
 * Variants:
 *   primary  → solid teal fill (default)
 *   outline  → transparent with teal border
 *   ghost    → no border, teal text only
 */
import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';

type Variant = 'primary' | 'outline' | 'ghost';

interface Props {
  title:     string;
  onPress:   () => void;
  loading?:  boolean;
  disabled?: boolean;
  variant?:  Variant;
  style?:    ViewStyle;
}

export default function PrimaryButton({
  title, onPress, loading = false, disabled = false, variant = 'primary', style,
}: Props) {
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'outline' && styles.outline,
    variant === 'ghost'   && styles.ghost,
    isDisabled            && styles.disabled,
    style,
  ];

  const textColor =
    variant === 'primary' ? '#FFFFFF' :
    variant === 'outline' ? colors.accent :
    colors.accent;

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
    >
      {loading
        ? <ActivityIndicator size="small" color={variant === 'primary' ? '#FFF' : colors.accent} />
        : <Text style={[styles.label, { color: textColor }]}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    width:           '100%',
    paddingVertical:  15,
    borderRadius:     12,
    alignItems:       'center',
    justifyContent:   'center',
    minHeight:        50,
  },
  primary:  { backgroundColor: colors.accent },
  outline:  { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.accent },
  ghost:    { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  label:    { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
});
