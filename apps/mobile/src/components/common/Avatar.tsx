/**
 * Avatar.tsx — Circular user avatar with optional presence dot.
 * Falls back to local placeholder when no URI is provided.
 * Presence dot colours: online=green, oncall=orange, offline=grey.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { colors } from '../../theme/colors';

type Presence = 'online' | 'oncall' | 'offline';

interface Props {
  uri?:      string | null;
  size?:     number;
  presence?: Presence | null;
}

const PRESENCE_COLOR: Record<Presence, string> = {
  online:  colors.online,
  oncall:  colors.onCall,
  offline: colors.offline,
};

const placeholder = require('../../assets/avatar_placeholder.png');

export default function Avatar({ uri, size = 48, presence }: Props) {
  const dotSize = Math.round(size * 0.28);

  return (
    <View style={{ width: size, height: size }}>
      <FastImage
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        source={uri ? { uri, priority: FastImage.priority.normal } : placeholder}
        resizeMode={FastImage.resizeMode.cover}
      />

      {presence && (
        <View
          style={[
            styles.dot,
            {
              width:        dotSize,
              height:       dotSize,
              borderRadius: dotSize / 2,
              bottom:       0,
              right:        0,
              backgroundColor: PRESENCE_COLOR[presence],
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.border },
  dot:   {
    position:    'absolute',
    borderWidth: 2,
    borderColor: colors.surface,
  },
});
