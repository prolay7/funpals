/**
 * Toast.tsx — Slide-in notification banner.
 * Reads toastMessage + toastType from Redux uiSlice.
 * Auto-dismisses after 3 s. Must be mounted once at the root (AppNavigator).
 *
 * Variants:
 *   success → teal/accent   (#0E7F6B)
 *   error   → red           (#EF4444)
 *   info    → primary navy  (#1A3C5E)
 */
import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store';
import { clearToast, ToastType } from '../../store/uiSlice';
import { colors } from '../../theme/colors';

const { width: SCREEN_W } = Dimensions.get('window');
const TOAST_H = 54;
const DURATION = 3000;

const BG_COLOR: Record<ToastType, string> = {
  success: colors.accent,
  error:   colors.error,
  info:    colors.primary,
};

const ICON: Record<ToastType, string> = {
  success: '✓',
  error:   '✗',
  info:    'ℹ',
};

export default function Toast() {
  const dispatch     = useAppDispatch();
  const message      = useAppSelector(s => s.ui.toastMessage);
  const type         = useAppSelector(s => s.ui.toastType);
  const insets       = useSafeAreaInsets();
  const translateY   = useSharedValue(-(TOAST_H + 20));
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = () => dispatch(clearToast());

  useEffect(() => {
    if (message) {
      // Slide in
      translateY.value = withTiming(0, { duration: 280 });

      // Auto-dismiss after DURATION
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        translateY.value = withTiming(-(TOAST_H + 20), { duration: 280 }, () => runOnJS(dismiss)());
      }, DURATION);
    } else {
      translateY.value = withDelay(50, withTiming(-(TOAST_H + 20), { duration: 200 }));
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [message]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        { top: insets.top + 8, backgroundColor: BG_COLOR[type] },
        animStyle,
      ]}
    >
      <Text style={styles.icon}>{ICON[type]}</Text>
      <Text style={styles.text} numberOfLines={2}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position:        'absolute',
    left:            16,
    right:           16,
    maxWidth:        SCREEN_W - 32,
    minHeight:       TOAST_H,
    borderRadius:    12,
    flexDirection:   'row',
    alignItems:      'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex:          9999,
    shadowColor:     '#000',
    shadowOpacity:   0.18,
    shadowRadius:    10,
    elevation:       10,
  },
  icon: { fontSize: 18, color: '#FFF', marginRight: 10, fontWeight: '700' },
  text: { flex: 1, color: '#FFF', fontSize: 14, fontWeight: '600', lineHeight: 20 },
});
