/**
 * ActivityDetailScreen.tsx — Full activity detail view.
 *
 * Sections:
 *  • Hero image (FastImage, graceful fallback)
 *  • Category badge
 *  • Title + description
 *  • "Join Activity" button → POST /activities/:id/join → success toast
 *
 * Data: GET /activities/:id
 * Navigation: ActivitiesStackParamList › ActivityDetail
 */
import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity, Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { StackScreenProps } from '@react-navigation/stack';
import { useQuery } from '@tanstack/react-query';
import { ActivitiesStackParamList } from '../../navigation/types';
import { apiClient } from '../../utils/api';
import { useAppDispatch } from '../../store';
import { showToast } from '../../store/uiSlice';
import { AppHeader } from '../../components/common';
import { colors } from '../../theme/colors';

type Props = StackScreenProps<ActivitiesStackParamList, 'ActivityDetail'>;

interface Activity {
  id:            string;
  title:         string;
  description:   string | null;
  image_url:     string | null;
  category_name: string;
  category_icon: string | null;
  is_active:     boolean;
}

const { width: SCREEN_W } = Dimensions.get('window');
const HERO_H = Math.round(SCREEN_W * 0.55);

export default function ActivityDetailScreen({ route, navigation }: Props) {
  const { activityId, title } = route.params;
  const dispatch = useAppDispatch();
  const [joining, setJoining] = useState(false);

  const { data: activity, isLoading, isError } = useQuery<Activity>({
    queryKey: ['activity', activityId],
    queryFn:  () => apiClient.get(`/activities/${activityId}`).then(r => r.data.data),
  });

  const handleJoin = useCallback(async () => {
    setJoining(true);
    try {
      await apiClient.post(`/activities/${activityId}/join`);
      dispatch(showToast({ message: `You joined "${activity?.title ?? title}"!`, type: 'success' }));
    } catch {
      dispatch(showToast({ message: 'Failed to join. Please try again.', type: 'error' }));
    } finally {
      setJoining(false);
    }
  }, [activityId, activity, title, dispatch]);

  if (isLoading) {
    return (
      <View style={styles.flex}>
        <AppHeader title={title} onBack={() => navigation.goBack()} />
        <View style={styles.centered}><ActivityIndicator color={colors.accent} size="large" /></View>
      </View>
    );
  }

  if (isError || !activity) {
    return (
      <View style={styles.flex}>
        <AppHeader title={title} onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Could not load activity.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <AppHeader title={activity.title} onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Hero image ── */}
        {activity.image_url ? (
          <FastImage
            source={{ uri: activity.image_url, priority: FastImage.priority.high }}
            style={styles.hero}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder]}>
            <Text style={styles.heroEmoji}>{activity.category_icon ?? '🎯'}</Text>
          </View>
        )}

        {/* ── Category badge ── */}
        <View style={styles.body}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {activity.category_icon ? `${activity.category_icon}  ` : ''}{activity.category_name}
            </Text>
          </View>

          {/* ── Title ── */}
          <Text style={styles.title}>{activity.title}</Text>

          {/* ── Description ── */}
          {activity.description ? (
            <Text style={styles.description}>{activity.description}</Text>
          ) : (
            <Text style={styles.noDesc}>No description available.</Text>
          )}
        </View>
      </ScrollView>

      {/* ── Sticky join button ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.joinBtn, joining && styles.joinBtnDisabled]}
          onPress={handleJoin}
          disabled={joining}
          activeOpacity={0.8}
        >
          {joining
            ? <ActivityIndicator color="#FFF" size="small" />
            : <Text style={styles.joinBtnText}>Join Activity</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex:    { flex: 1, backgroundColor: colors.background },
  centered:{ flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:  { paddingBottom: 100 },
  errorText:{ fontSize: 14, color: colors.error },

  hero:            { width: SCREEN_W, height: HERO_H },
  heroPlaceholder: { backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  heroEmoji:       { fontSize: 64 },

  body: { padding: 20 },

  categoryBadge: {
    alignSelf:        'flex-start',
    backgroundColor:  `${colors.accent}18`,
    borderRadius:     20,
    paddingVertical:   5,
    paddingHorizontal: 12,
    marginBottom:     12,
  },
  categoryText: { fontSize: 13, fontWeight: '600', color: colors.accent },

  title:       { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 14, lineHeight: 30 },
  description: { fontSize: 15, color: colors.text, lineHeight: 24 },
  noDesc:      { fontSize: 14, color: colors.textMuted, fontStyle: 'italic' },

  footer: {
    position:         'absolute',
    bottom:            0,
    left:              0,
    right:             0,
    backgroundColor:   colors.surface,
    paddingHorizontal: 20,
    paddingVertical:   14,
    borderTopWidth:    1,
    borderTopColor:    colors.border,
  },
  joinBtn:         { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  joinBtnDisabled: { opacity: 0.6 },
  joinBtnText:     { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
