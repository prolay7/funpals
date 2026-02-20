/**
 * AppHeader.tsx — Consistent screen header.
 * Shows an optional back chevron, centred title, and an optional right action.
 * Use headerShown:false on the stack screen and render this manually so every
 * screen controls its own header content while sharing the same visual style.
 */
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';

interface Props {
  title:          string;
  onBack?:        () => void;
  rightLabel?:    string;
  onRightPress?:  () => void;
  light?:         boolean;   // light=true → white background; default → primary navy
}

export default function AppHeader({
  title, onBack, rightLabel, onRightPress, light = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const bg     = light ? colors.surface  : colors.primary;
  const fg     = light ? colors.primary  : '#FFFFFF';

  return (
    <View style={[styles.wrapper, { backgroundColor: bg, paddingTop: insets.top || StatusBar.currentHeight || 0 }]}>
      <StatusBar
        barStyle={light ? 'dark-content' : 'light-content'}
        backgroundColor={bg}
        translucent={Platform.OS === 'android'}
      />

      {/* Left — back button */}
      <View style={styles.side}>
        {onBack && (
          <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={[styles.chevron, { color: fg }]}>{'‹'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Centre — title */}
      <Text style={[styles.title, { color: fg }]} numberOfLines={1}>{title}</Text>

      {/* Right — optional action */}
      <View style={styles.side}>
        {rightLabel && onRightPress && (
          <TouchableOpacity onPress={onRightPress} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={[styles.rightLabel, { color: fg }]}>{rightLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:    {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: 16,
    paddingBottom:    14,
  },
  side:       { width: 56, alignItems: 'flex-start' },
  chevron:    { fontSize: 32, lineHeight: 36, fontWeight: '300', marginTop: -2 },
  title:      { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
  rightLabel: { fontSize: 15, fontWeight: '600' },
});
