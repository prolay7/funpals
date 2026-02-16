/**
 * HomeScreen.tsx — Main home with ActivityBubble floating suggestions.
 * Polls /activities/random every 15-30s for new bubbles.
 * Shows DailyGoalBanner on first login of the day.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useAppSelector } from '../../store';
import { apiClient } from '../../utils/api';
import ActivityBubble from '../../components/activities/ActivityBubble';
import { colors } from '../../theme/colors';

const { width: W } = Dimensions.get('window');

export default function HomeScreen() {
  const user   = useAppSelector(s => s.auth.user);
  const [bubble, setBubble] = useState<any>(null);

  const fetchBubble = async () => {
    try {
      const { data } = await apiClient.get('/activities/random');
      setBubble(data.data);
    } catch {}
  };

  useEffect(() => {
    const schedule = () => {
      const delay = 15_000 + Math.random() * 15_000; // 15-30s
      const t = setTimeout(() => { fetchBubble(); schedule(); }, delay);
      return t;
    };
    fetchBubble();
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {(user as any)?.display_name} 👋</Text>
        <Text style={styles.subtitle}>What are you up to today?</Text>
      </View>
      {bubble && (
        <ActivityBubble
          activity={bubble}
          onDismiss={() => setBubble(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header:    { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, backgroundColor: colors.primary },
  greeting:  { fontSize: 24, fontWeight: '700', color: '#FFF' },
  subtitle:  { fontSize: 14, color: colors.accent, marginTop: 4 },
});
