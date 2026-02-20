/**
 * NearbyUserCard.tsx — Card showing a nearby user with presence status,
 * distance, and quick-action buttons (Message, Meet).
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Avatar } from '../common';
import { colors } from '../../theme/colors';

export interface NearbyUser {
  id:             string;
  display_name:   string;
  username:       string;
  distance_miles: number;
  is_online:      boolean;
  is_on_call:     boolean;
  photo_url:      string | null;
}

interface Props {
  user:      NearbyUser;
  onPress:   () => void;
  onMessage: () => void;
  onMeet:    () => void;
}

export default function NearbyUserCard({ user, onPress, onMessage, onMeet }: Props) {
  const presence: 'online' | 'oncall' | 'offline' =
    user.is_on_call ? 'oncall' : user.is_online ? 'online' : 'offline';

  const presenceColor =
    user.is_on_call ? colors.onCall : user.is_online ? colors.online : colors.offline;

  const presenceLabel =
    user.is_on_call ? 'On call' : user.is_online ? 'Online' : 'Offline';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Avatar uri={user.photo_url ?? undefined} size={52} presence={presence} />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{user.display_name}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        <View style={styles.meta}>
          <View style={[styles.dot, { backgroundColor: presenceColor }]} />
          <Text style={styles.metaText}>{presenceLabel} · {user.distance_miles} mi away</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onMessage}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
        >
          <Text style={styles.iconBtnText}>💬</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, styles.iconBtnMeet]}
          onPress={onMeet}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
        >
          <Text style={styles.iconBtnText}>🤝</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:        { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginHorizontal: 16, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  body:        { flex: 1, marginLeft: 12 },
  name:        { fontSize: 15, fontWeight: '700', color: colors.text },
  username:    { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  meta:        { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  dot:         { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  metaText:    { fontSize: 12, color: colors.textMuted },
  actions:     { flexDirection: 'row', gap: 8, marginLeft: 8 },
  iconBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  iconBtnMeet: { borderColor: colors.accent + '66' },
  iconBtnText: { fontSize: 16 },
});
