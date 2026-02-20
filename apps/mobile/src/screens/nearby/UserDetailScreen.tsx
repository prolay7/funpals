/**
 * UserDetailScreen.tsx — Public profile view of another user.
 *
 * Sections:
 *  • Hero: large avatar, display name, @username, online/offline badge
 *  • Bio
 *  • Interests (SkillBadge chips)
 *  • Available for (SkillBadge chips)
 *  • Expertise level (1-5 filled dots)
 *  • Action buttons: Message (navigates to ChatTab) · Meet (toast)
 *
 * Data: GET /users/:id
 */
import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useQuery } from '@tanstack/react-query';
import { NearbyStackParamList } from '../../navigation/types';
import { apiClient } from '../../utils/api';
import { useAppDispatch } from '../../store';
import { showToast } from '../../store/uiSlice';
import { AppHeader, Avatar, SkillBadge } from '../../components/common';
import { colors } from '../../theme/colors';

type Props = StackScreenProps<NearbyStackParamList, 'UserDetail'>;

interface UserProfile {
  id:              string;
  display_name:    string;
  username:        string;
  photo_url:       string | null;
  bio:             string | null;
  interests:       string[] | null;
  available_for:   string[] | null;
  expertise_level: number | null;
  age_range:       string | null;
  is_online?:      boolean;
  is_on_call?:     boolean;
}

const EXPERTISE_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Novice',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

export default function UserDetailScreen({ route, navigation }: Props) {
  const { userId, displayName } = route.params;
  const dispatch = useAppDispatch();

  const { data: user, isLoading, isError } = useQuery<UserProfile>({
    queryKey: ['user', userId],
    queryFn:  () => apiClient.get(`/users/${userId}`).then(r => r.data.data),
  });

  const handleMeet = useCallback(() => {
    dispatch(showToast({ message: `Meet request sent to ${user?.display_name ?? displayName}!`, type: 'success' }));
  }, [user, displayName, dispatch]);

  const handleMessage = useCallback(() => {
    dispatch(showToast({ message: 'Opening channels — tap the channel to message directly.', type: 'info' }));
    // Navigate to the Chat tab (cross-tab navigation via parent navigator)
    navigation.getParent()?.navigate('ChatTab');
  }, [navigation, dispatch]);

  if (isLoading) {
    return (
      <View style={styles.flex}>
        <AppHeader title={displayName} onBack={() => navigation.goBack()} />
        <View style={styles.centered}><ActivityIndicator color={colors.accent} size="large" /></View>
      </View>
    );
  }

  if (isError || !user) {
    return (
      <View style={styles.flex}>
        <AppHeader title={displayName} onBack={() => navigation.goBack()} />
        <View style={styles.centered}><Text style={styles.errorText}>Could not load profile.</Text></View>
      </View>
    );
  }

  const presence: 'online' | 'oncall' | 'offline' =
    user.is_on_call ? 'oncall' : user.is_online ? 'online' : 'offline';

  const interests = user.interests    ?? [];
  const available = user.available_for ?? [];
  const expertise = user.expertise_level ?? 0;

  return (
    <View style={styles.flex}>
      <AppHeader title={user.display_name} onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <Avatar uri={user.photo_url ?? undefined} size={96} presence={presence} />
          <Text style={styles.name}>{user.display_name}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          {!!user.age_range && <Text style={styles.meta}>{user.age_range}</Text>}
        </View>

        {/* ── Bio ── */}
        {!!user.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{user.bio}</Text>
          </View>
        )}

        {/* ── Expertise ── */}
        {expertise > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expertise Level</Text>
            <View style={styles.expertiseRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <View key={n} style={[styles.expertiseDot, n <= expertise && styles.expertiseDotFilled]} />
              ))}
              <Text style={styles.expertiseLabel}>{EXPERTISE_LABELS[expertise]}</Text>
            </View>
          </View>
        )}

        {/* ── Interests ── */}
        {interests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.chips}>
              {interests.map(tag => <SkillBadge key={tag} label={tag} />)}
            </View>
          </View>
        )}

        {/* ── Available for ── */}
        {available.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available for</Text>
            <View style={styles.chips}>
              {available.map(tag => <SkillBadge key={tag} label={tag} />)}
            </View>
          </View>
        )}

        {/* ── Actions ── */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.actionPrimary]} onPress={handleMessage} activeOpacity={0.8}>
            <Text style={styles.actionPrimaryText}>💬  Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionOutline]} onPress={handleMeet} activeOpacity={0.8}>
            <Text style={styles.actionOutlineText}>🤝  Meet</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex:     { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText:{ fontSize: 14, color: colors.error },
  scroll:   { paddingBottom: 40 },

  hero:     { alignItems: 'center', backgroundColor: colors.primary, paddingTop: 24, paddingBottom: 32 },
  name:     { fontSize: 22, fontWeight: '700', color: '#FFF', marginTop: 12 },
  username: { fontSize: 14, color: colors.accent, marginTop: 2 },
  meta:     { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 4 },

  section:      { marginHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
  bio:          { fontSize: 15, color: colors.text, lineHeight: 22 },

  expertiseRow:       { flexDirection: 'row', alignItems: 'center' },
  expertiseDot:       { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: colors.accent, marginRight: 6 },
  expertiseDotFilled: { backgroundColor: colors.accent },
  expertiseLabel:     { fontSize: 13, color: colors.textMuted, marginLeft: 6, fontWeight: '600' },

  chips: { flexDirection: 'row', flexWrap: 'wrap' },

  actions: { flexDirection: 'row', marginHorizontal: 20, marginTop: 32, gap: 12 },
  actionBtn:         { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  actionPrimary:     { backgroundColor: colors.accent },
  actionOutline:     { borderWidth: 1.5, borderColor: colors.accent },
  actionPrimaryText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  actionOutlineText: { color: colors.accent, fontWeight: '700', fontSize: 15 },
});
