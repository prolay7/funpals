/**
 * LoadingSpinner.tsx — Activity indicator in two modes.
 *   fullScreen=true  → centred on a semi-transparent overlay (blocks interaction)
 *   fullScreen=false → inline indicator (default)
 */
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  fullScreen?: boolean;
  size?:       'small' | 'large';
  color?:      string;
}

export default function LoadingSpinner({
  fullScreen = false,
  size       = 'large',
  color      = colors.accent,
}: Props) {
  if (fullScreen) {
    return (
      <View style={styles.overlay} pointerEvents="box-only">
        <View style={styles.box}>
          <ActivityIndicator size={size} color={color} />
        </View>
      </View>
    );
  }

  return <ActivityIndicator size={size} color={color} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems:      'center',
    justifyContent:  'center',
    zIndex:          999,
  },
  box: {
    backgroundColor: '#FFFFFF',
    borderRadius:    16,
    padding:         24,
    shadowColor:     '#000',
    shadowOpacity:   0.12,
    shadowRadius:    12,
    elevation:       8,
  },
});
