/**
 * TypingIndicator.tsx — Animated three-dot "someone is typing" indicator.
 * Reads typingByChannel[channelId] from Redux.
 * Each dot pulses opacity in sequence with a staggered delay.
 * Renders nothing when no one is typing in this channel.
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { useAppSelector } from '../../store';
import { colors } from '../../theme/colors';

interface Props {
  channelId: string;
}

function Dot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1,   duration: 350, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        Animated.delay(700 - delay),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return <Animated.View style={[styles.dot, { opacity }]} />;
}

export default function TypingIndicator({ channelId }: Props) {
  const typers = useAppSelector(s => s.chat.typingByChannel[channelId] ?? []);

  if (typers.length === 0) return null;

  const label = typers.length === 1 ? 'Someone is typing' : `${typers.length} people are typing`;

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Dot delay={0} />
        <Dot delay={200} />
        <Dot delay={400} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: 16,
    paddingVertical:  6,
  },
  bubble: {
    flexDirection:   'row',
    backgroundColor: colors.surface,
    borderRadius:    12,
    paddingHorizontal: 10,
    paddingVertical:  8,
    alignItems:      'center',
    marginRight:      8,
    shadowColor:     '#000',
    shadowOpacity:   0.06,
    shadowRadius:    4,
    elevation:       2,
  },
  dot: {
    width:        8,
    height:       8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
    marginHorizontal: 2,
  },
  label: {
    fontSize: 12,
    color:    colors.textMuted,
    fontStyle: 'italic',
  },
});
