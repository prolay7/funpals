import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import FastImage from 'react-native-fast-image';
import { apiClient } from '../../utils/api';
import { colors } from '../../theme/colors';

const CATEGORIES = ['All','games','parks','trails','libraries','books','other'];

export default function BrowseActivitiesScreen({ navigation }: any) {
  const [cat, setCat] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['activities', cat],
    queryFn: () => apiClient.get(`/activities${cat ? `?category=${cat}` : ''}`).then(r => r.data.data),
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Activities</Text></View>
      <FlatList horizontal showsHorizontalScrollIndicator={false}
        data={CATEGORIES} keyExtractor={i => i} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.chip, (item === '' ? cat === '' : cat === item) && styles.chipActive]}
            onPress={() => setCat(item === 'All' ? '' : item)}>
            <Text style={[(item === '' ? cat === '' : cat === item) ? { color: '#FFF' } : { color: colors.primary }, { fontSize: 13, fontWeight: '600' }]}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      {isLoading ? <ActivityIndicator color={colors.accent} />
        : <FlatList data={data ?? []} keyExtractor={(i: any) => i.id} contentContainerStyle={{ padding: 16 }}
            numColumns={2} columnWrapperStyle={{ gap: 12 }}
            renderItem={({ item }: any) => (
              <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ActivityDetail', { activity: item })}>
                {item.image_url && <FastImage source={{ uri: item.image_url }} style={styles.cardImg} />}
                <View style={{ padding: 10 }}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.cardCat}>{item.category_name}</Text>
                </View>
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
  chip:      { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  chipActive:{ backgroundColor: colors.accent, borderColor: colors.accent },
  card:      { flex: 1, backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardImg:   { width: '100%', height: 100 },
  cardTitle: { fontWeight: '600', fontSize: 13, color: colors.text },
  cardCat:   { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
