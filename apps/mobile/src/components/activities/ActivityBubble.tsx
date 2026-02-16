/**
 * ActivityBubble.tsx — RandomJoy-style floating activity suggestion widget.
 * Appears at random X position, floats upward, fades out after 5s.
 * Tapping opens the activity detail or external URL.
 */
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, Dimensions, Linking } from 'react-native';
import Animated, {
  useSharedValue, withTiming, withDelay, useAnimatedStyle, runOnJS,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import { colors } from '../../theme/colors';

const { width: SCREEN_W } = Dimensions.get('window');

interface Activity { id: string; title: string; image_url?: string; external_url?: string; category_name: string }
interface Props { activity: Activity; onDismiss: () => void }

export default function ActivityBubble({ activity, onDismiss }: Props) {
  const translateY = useSharedValue(0);
  const opacity    = useSharedValue(1);
  const left       = useMemo(() => 16 + Math.random() * (SCREEN_W - 160), []);

  useEffect(() => {
    translateY.value = withTiming(-220, { duration: 5000 });
    opacity.value    = withDelay(3000, withTiming(0, { duration: 2000 }, () => runOnJS(onDismiss)()));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const handleTap = () => {
    if (activity.external_url) Linking.openURL(activity.external_url).catch(() => {});
    onDismiss();
  };

  return (
    <Animated.View style={[styles.bubble, { left }, animStyle]}>
      <TouchableOpacity onPress={handleTap} activeOpacity={0.85}>
        {activity.image_url && (
          <FastImage source={{ uri: activity.image_url }} style={styles.image} resizeMode="cover" />
        )}
        <Text style={styles.category}>{activity.category_name}</Text>
        <Text style={styles.title} numberOfLines={2}>{activity.title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble:   { position: 'absolute', bottom: 100, width: 140, backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  image:    { width: '100%', height: 80 },
  category: { fontSize: 10, color: colors.accent, fontWeight: '600', paddingHorizontal: 10, paddingTop: 8 },
  title:    { fontSize: 12, fontWeight: '600', color: colors.text, paddingHorizontal: 10, paddingBottom: 10 },
});
