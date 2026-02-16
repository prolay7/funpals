/**
 * ChannelListScreen.tsx — Lists all channels with default + favourites first.
 */
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import { colors } from '../../theme/colors';

export default function ChannelListScreen({ navigation }: any) {
  const { data, isLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: () => apiClient.get('/channels').then(r => r.data.data),
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Channels</Text></View>
      {isLoading
        ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />
        : <FlatList data={data ?? []} keyExtractor={(i: any) => i.id} contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }: any) => (
              <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ChatRoom', { channelId: item.id, channelName: item.name })}>
                <View style={[styles.dot, { backgroundColor: item.is_default ? colors.accent : colors.textMuted }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.desc}>{item.description ?? 'Tap to join the conversation'}</Text>
                </View>
                {item.is_favorite && <Text style={styles.star}>⭐</Text>}
              </TouchableOpacity>
            )}
          />
      }
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header:    { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.primary },
  title:     { fontSize: 22, fontWeight: '700', color: '#FFF' },
  card:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  dot:       { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  name:      { fontWeight: '600', fontSize: 15, color: colors.text },
  desc:      { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  star:      { fontSize: 16 },
});
