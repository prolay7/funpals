/**
 * NearbyScreen.tsx — Shows users within user-selected radius on map + list.
 * Fetches from /nearby with lat/lng + radius params.
 * Presence dots: green=online, orange=on-call, grey=offline.
 */
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import { colors } from '../../theme/colors';

interface NearbyUser { id: string; display_name: string; username: string; distance_miles: number; is_online: boolean; is_on_call: boolean }

export default function NearbyScreen() {
  const [radius, setRadius] = useState(25);

  const { data, isLoading } = useQuery({
    queryKey: ['nearby', radius],
    queryFn: () => apiClient.get(`/nearby?lat=40.7128&lng=-74.0060&radius=${radius}`).then(r => r.data.data as NearbyUser[]),
    refetchInterval: 60_000,
  });

  const presenceColor = (u: NearbyUser) => u.is_on_call ? colors.onCall : u.is_online ? colors.online : colors.offline;

  if (isLoading) return <View style={styles.center}><ActivityIndicator color={colors.accent} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby People</Text>
        <Text style={styles.subtitle}>{data?.length ?? 0} users within {radius} miles</Text>
      </View>
      <FlatList
        data={data ?? []}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.presenceDot, { backgroundColor: presenceColor(item) }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.display_name}</Text>
              <Text style={styles.sub}>@{item.username} · {item.distance_miles} mi</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No users nearby. Try increasing the radius.</Text>}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.background },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:      { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.primary },
  title:       { fontSize: 22, fontWeight: '700', color: '#FFF' },
  subtitle:    { color: colors.accent, marginTop: 2, fontSize: 13 },
  card:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  presenceDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  name:        { fontWeight: '600', fontSize: 15, color: colors.text },
  sub:         { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  empty:       { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
});
