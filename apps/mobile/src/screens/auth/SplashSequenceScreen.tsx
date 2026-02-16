/**
 * SplashSequenceScreen.tsx — Spec: homepage > timed image > timed image > landing.
 * Shows 2 full-screen images for 3s each with fade transitions, then navigates to Landing.
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, Dimensions } from 'react-native';
import Animated, { useSharedValue, withTiming, withDelay, runOnJS, useAnimatedStyle } from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');
const IMAGES = [
  require('../../assets/splash1.png'),
  require('../../assets/splash2.png'),
];

export default function SplashSequenceScreen({ navigation }: any) {
  const [idx, setIdx] = useState(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 400 }, () => {
        if (idx < IMAGES.length - 1) {
          runOnJS(setIdx)(idx + 1);
        } else {
          runOnJS(navigation.replace)('Landing');
        }
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, [idx]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <Image source={IMAGES[idx]} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#1A3C5E', width: W, height: H } });
