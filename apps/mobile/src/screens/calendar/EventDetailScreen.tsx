/**
 * EventDetailScreen.tsx — Full event view with RSVP.
 *
 * Sections:
 *  • Hero bar (navy, title + date)
 *  • Detail rows: date, time, location, group/private badge
 *  • Description
 *  • RSVP buttons: Going / Maybe / Declined (highlights current status)
 *
 * Data:    GET /calendar/:id
 * Actions: POST /calendar/:id/rsvp { status: 'going' | 'maybe' | 'declined' }
 * Navigation: HomeStackParamList - EventDetail
 */
import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { HomeStackParamList } from '../../navigation/types';
import { apiClient } from '../../utils/api';
import { useAppDispatch } from '../../store';
import { showToast } from '../../store/uiSlice';
import { AppHeader } from '../../components/common';
import { colors } from '../../theme/colors';

type Props = StackScreenProps<HomeStackParamList, 'EventDetail'>;

interface EventDetail {
  id:          string;
  title:       string;
  description: string | null;
  location:    string | null;
  starts_at:   string;
  ends_at:     string;
  is_group:    boolean;
  my_rsvp:     string | null;
}

type RsvpStatus = 'going' | 'maybe' | 'declined';

const RSVP_OPTIONS: { key: RsvpStatus; label: string; emoji: string; activeColor: string }[] = [
  { key: 'going',    label: 'Going',    emoji: '\u2713', activeColor: '#22C55E' },
  { key: 'maybe',    label: 'Maybe',    emoji: '?',      activeColor: '#F59E0B' },
  { key: 'declined', label: 'Declined', emoji: '\u2715', activeColor: '#EF4444' },
];

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function DetailRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
}

export default function EventDetailScreen({ route, navigation }: Props) {
  const { eventId, title } = route.params;
  const dispatch    = useAppDispatch();
  const queryClient = useQueryClient();
  const [rsvping, setRsvping] = useState(false);

  const { data: event, isLoading, isError } = useQuery<EventDetail>({
    queryKey: ['event', eventId],
    queryFn:  () => apiClient.get('/calendar/' + eventId).then(r => r.data.data),
  });

  const handleRsvp = useCallback(async (status: RsvpStatus) => {
    if (rsvping || event?.my_rsvp === status) return;
    setRsvping(true);
    try {
      await apiClient.post('/calendar/' + eventId + '/rsvp', { status });
      await queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      await queryClient.invalidateQueries({ queryKey: ['events'] });
      const found = RSVP_OPTIONS.find(o => o.key === status);
      dispatch(showToast({ message: 'RSVP updated: ' + (found?.label ?? status), type: 'success' }));
    } catch {
      dispatch(showToast({ message: 'Failed to update RSVP. Please try again.', type: 'error' }));
    } finally {
      setRsvping(false);
    }
  }, [eventId, event, rsvping, dispatch, queryClient]);

  if (isLoading) {
    return (
      <View style={styles.flex}>
        <AppHeader title={title} onBack={() => navigation.goBack()} />
        <View style={styles.centered}><ActivityIndicator color={colors.accent} size="large" /></View>
      </View>
    );
  }

  if (isError || !event) {
    return (
      <View style={styles.flex}>
        <AppHeader title={title} onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Could not load event details.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <AppHeader title={event.title} onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{event.title}</Text>
          <Text style={styles.heroDate}>{fmtDate(event.starts_at)}</Text>
        </View>

        {/* Detail rows */}
        <View style={styles.detailBlock}>
          <DetailRow icon="🗓" text={fmtDate(event.starts_at)} />
          <DetailRow icon="🕐" text={fmtTime(event.starts_at) + ' \u2013 ' + fmtTime(event.ends_at)} />
          {!!event.location && <DetailRow icon="📍" text={event.location} />}
          <DetailRow
            icon={event.is_group ? '👥' : '🔒'}
            text={event.is_group ? 'Group event' : 'Private event'}
          />
        </View>

        {/* Description */}
        {!!event.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        )}

        {/* RSVP */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your RSVP</Text>
          <View style={styles.rsvpRow}>
            {RSVP_OPTIONS.map(opt => {
              const isActive = event.my_rsvp === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.rsvpBtn,
                    { borderColor: opt.activeColor },
                    isActive && { backgroundColor: opt.activeColor },
                  ]}
                  onPress={() => handleRsvp(opt.key)}
                  disabled={rsvping}
                  activeOpacity={0.8}
                >
                  {rsvping && isActive
                    ? <ActivityIndicator color="#FFF" size="small" />
                    : (
                      <>
                        <Text style={[styles.rsvpEmoji, { color: isActive ? '#FFF' : opt.activeColor }]}>
                          {opt.emoji}
                        </Text>
                        <Text style={[styles.rsvpLabel, { color: isActive ? '#FFF' : opt.activeColor }]}>
                          {opt.label}
                        </Text>
                      </>
                    )
                  }
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: colors.background },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 14, color: colors.error },
  scroll:    { paddingBottom: 40 },

  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 6, lineHeight: 28 },
  heroDate:  { fontSize: 13, color: 'rgba(255,255,255,0.65)' },

  detailBlock: {
    backgroundColor: colors.surface,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  detailIcon: { fontSize: 18, marginRight: 12, width: 26, textAlign: 'center' },
  detailText: { fontSize: 14, color: colors.text, flex: 1 },

  section: { marginHorizontal: 20, marginTop: 24 },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: colors.textMuted,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12,
  },
  description: { fontSize: 15, color: colors.text, lineHeight: 24 },

  rsvpRow: { flexDirection: 'row', gap: 10 },
  rsvpBtn: {
    flex: 1, alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10, borderWidth: 1.5,
    backgroundColor: colors.surface,
  },
  rsvpEmoji: { fontSize: 16, marginBottom: 4 },
  rsvpLabel: { fontSize: 13, fontWeight: '700' },
});
