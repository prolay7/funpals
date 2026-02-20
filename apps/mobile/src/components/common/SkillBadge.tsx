/**
 * SkillBadge.tsx — Compact pill chip for skills, interests, and availability tags.
 *
 * Modes:
 *   default  → teal outline, accent text (read-only display)
 *   selected → solid teal fill, white text (toggle-on state in forms)
 *   removable → teal outline + "×" remove button (edit list mode)
 *
 * Usage:
 *   <SkillBadge label="Photography" />
 *   <SkillBadge label="Hiking" selected onPress={toggle} />
 *   <SkillBadge label="Yoga" onRemove={() => removeInterest('Yoga')} />
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  label:      string;
  selected?:  boolean;
  onPress?:   () => void;
  onRemove?:  () => void;
  style?:     ViewStyle;
}

export default function SkillBadge({ label, selected = false, onPress, onRemove, style }: Props) {
  const inner = (
    <>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <Text style={[styles.removeIcon, selected && styles.labelSelected]}>×</Text>
        </TouchableOpacity>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.badge, selected && styles.badgeSelected, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {inner}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.badge, selected && styles.badgeSelected, style]}>
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection:    'row',
    alignItems:       'center',
    borderWidth:       1.5,
    borderColor:       colors.accent,
    borderRadius:      20,
    paddingVertical:   5,
    paddingHorizontal: 12,
    marginRight:       8,
    marginBottom:      8,
    backgroundColor:  'transparent',
  },
  badgeSelected: {
    backgroundColor: colors.accent,
  },
  label: {
    fontSize:   13,
    fontWeight: '600',
    color:      colors.accent,
  },
  labelSelected: {
    color: '#FFFFFF',
  },
  removeIcon: {
    fontSize:    16,
    fontWeight:  '700',
    color:       colors.accent,
    marginLeft:   5,
    lineHeight:   18,
  },
});
