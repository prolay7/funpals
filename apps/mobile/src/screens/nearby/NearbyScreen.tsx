/**
 * NearbyScreen.tsx — Shows users within user-selected radius on map + list.
 * Phase 8: RadiusChips, NearbyUserCard, react-native-maps MapView with user pins.
 * Presence dots: green=online, orange=on-call, grey=offline.
 * Location is hardcoded to NYC (40.7128, -74.0060) until device-location is added.
 */
import React, { useCallback, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import MapView, { Circle, Marker, Region } from 'react-native-maps';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import { useAppDispatch } from '../../store';
import { showToast } from '../../store/uiSlice';
import { AppHeader } from '../../components/common';
import RadiusChips from '../../components/nearby/RadiusChips';
import NearbyUserCard, { NearbyUser } from '../../components/nearby/NearbyUserCard';
import { colors } from '../../theme/colors';
import { NearbyStackParamList } from '../../navigation/types';

const { height: SCREEN_H } = Dimensions.get('window');
const MAP_HEIGHT = Math.round(SCREEN_H * 0.35);

// Hardcoded to NYC; replace with device geolocation in a future phase
const MY_LAT = 40.7128;
const MY_LNG = -74.0060;

/** Deterministic approximate position: angle from user-ID hash, distance from API. */
function approximatePosition(distanceMiles: number, seed: string) {
  const angle =
    (seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360) *
    (Math.PI / 180);
  const latDelta = (distanceMiles / 69) * Math.cos(angle);
  const lngDelta =
    (distanceMiles / 69) * Math.sin(angle) / Math.cos(MY_LAT * (Math.PI / 180));
  return { latitude: MY_LAT + latDelta, longitude: MY_LNG + lngDelta };
}

function getRegion(radiusMiles: number): Region {
  const delta = (radiusMiles / 69) * 2.6;
  return { latitude: MY_LAT, longitude: MY_LNG, latitudeDelta: delta, longitudeDelta: delta };
}

type Props = StackScreenProps<NearbyStackParamList, 'Nearby'>;

export default function NearbyScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [radius, setRadius] = useState(25);
  const mapRef = useRef<MapView>(null);

  const { data, isLoading } = useQuery<NearbyUser[]>({
    queryKey: ['nearby', radius],
    queryFn: () =>
      apiClient
        .get(`/nearby?lat=${MY_LAT}&lng=${MY_LNG}&radius=${radius}`)
        .then(r => r.data.data ?? []),
    refetchInterval: 60_000,
  });

  const users = data ?? [];

  const handleRadiusChange = useCallback((r: number) => {
    setRadius(r);
    mapRef.current?.animateToRegion(getRegion(r), 400);
  }, []);

  const handleUserPress = useCallback((user: NearbyUser) => {
    navigation.navigate('UserDetail', { userId: user.id, displayName: user.display_name });
  }, [navigation]);

  const handleMessage = useCallback((user: NearbyUser) => {
    dispatch(showToast({ message: 'Opening chat — find them in your channels.', type: 'info' }));
    (navigation.getParent() as any)?.navigate('ChatTab');
  }, [dispatch, navigation]);

  const handleMeet = useCallback((user: NearbyUser) => {
    dispatch(showToast({ message: `Meet request sent to ${user.display_name}!`, type: 'success' }));
  }, [dispatch]);

  const presenceColor = (u: NearbyUser) =>
    u.is_on_call ? colors.onCall : u.is_online ? colors.online : colors.offline;

  return (
    <View style={styles.container}>
      <AppHeader title="Nearby People" />

      {/* ── Radius filter ────────────────────────────────────────── */}
      <RadiusChips value={radius} onChange={handleRadiusChange} />

      {/* ── Map ──────────────────────────────────────────────────── */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={getRegion(radius)}
        pitchEnabled={false}
        rotateEnabled={false}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {/* Current-user pin */}
        <Marker
          coordinate={{ latitude: MY_LAT, longitude: MY_LNG }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.myPin}>
            <Text style={styles.myPinText}>Me</Text>
          </View>
        </Marker>

        {/* Radius circle */}
        <Circle
          center={{ latitude: MY_LAT, longitude: MY_LNG }}
          radius={radius * 1609.344}
          fillColor="rgba(14,127,107,0.07)"
          strokeColor="rgba(14,127,107,0.35)"
          strokeWidth={1.5}
        />

        {/* Nearby user pins */}
        {users.map(u => (
          <Marker
            key={u.id}
            coordinate={approximatePosition(u.distance_miles, u.id)}
            onPress={() => handleUserPress(u)}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[styles.userPin, { borderColor: presenceColor(u) }]}>
              <Text style={styles.userPinText}>{u.display_name[0].toUpperCase()}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* ── User list ────────────────────────────────────────────── */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.listHeader}>
              {users.length} {users.length === 1 ? 'person' : 'people'} within {radius} miles
            </Text>
          }
          renderItem={({ item }) => (
            <NearbyUserCard
              user={item}
              onPress={() => handleUserPress(item)}
              onMessage={() => handleMessage(item)}
              onMeet={() => handleMeet(item)}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No users nearby. Try increasing the radius.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.background },
  map:         { width: '100%', height: MAP_HEIGHT },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list:        { paddingTop: 8, paddingBottom: 40 },
  listHeader:  { fontSize: 13, fontWeight: '600', color: colors.textMuted, paddingHorizontal: 20, paddingVertical: 10 },
  empty:       { textAlign: 'center', color: colors.textMuted, marginTop: 40, paddingHorizontal: 40 },
  // Map markers
  myPin:       { backgroundColor: colors.primary, borderRadius: 16, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 2, borderColor: '#FFF' },
  myPinText:   { color: '#FFF', fontWeight: '700', fontSize: 11 },
  userPin:     { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 2, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  userPinText: { fontSize: 13, fontWeight: '700', color: colors.text },
});
