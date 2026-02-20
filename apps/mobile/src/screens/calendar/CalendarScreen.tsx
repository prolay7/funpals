/**
 * CalendarScreen.tsx — Monthly calendar with event list.
 *
 * Features:
 *  • Custom month grid (no third-party calendar lib required)
 *  • Prev / next month navigation
 *  • Teal dot on days that have events
 *  • Selected day gets teal circle highlight; today gets teal border
 *  • Event list below calendar filtered to the selected day
 *  • Tap an event card to navigate to EventDetail
 *
 * Data: GET /calendar
 * Navigation: HomeStackParamList - Calendar
 */
import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../navigation/types';
import { apiClient } from '../../utils/api';
import { AppHeader } from '../../components/common';
import { colors } from '../../theme/colors';

type NavProp = StackNavigationProp<HomeStackParamList, 'Calendar'>;

interface CalEvent {
  id:          string;
  title:       string;
  description: string | null;
  location:    string | null;
  starts_at:   string;
  ends_at:     string;
  is_group:    boolean;
  my_rsvp:     string | null;
}

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const { width: SCREEN_W } = Dimensions.get('window');
const CELL_W = Math.floor((SCREEN_W - 32) / 7);

// ── Helpers ──────────────────────────────────────────────────────────────────

function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function formatTime(iso: string): string {
  const d    = new Date(iso);
  const h    = d.getHours();
  const mm   = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh   = h % 12 || 12;
  return hh + ':' + mm + ' ' + ampm;
}

function buildGrid(year: number, month: number): (number | null)[][] {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

const RSVP_BG: Record<string, string> = {
  going:    '#22C55E',
  maybe:    '#F59E0B',
  declined: '#EF4444',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function CalendarScreen() {
  const navigation = useNavigation<NavProp>();
  const today = new Date();

  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selected, setSelected] = useState(toYMD(today));

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const { data: events = [], isLoading } = useQuery<CalEvent[]>({
    queryKey: ['events'],
    queryFn:  () => apiClient.get('/calendar').then(r => r.data.data ?? []),
    staleTime: 60_000,
  });

  const eventDates = useMemo(() => {
    const set = new Set<string>();
    events.forEach(e => set.add(toYMD(new Date(e.starts_at))));
    return set;
  }, [events]);

  const dayEvents = useMemo(
    () => events.filter(e => toYMD(new Date(e.starts_at)) === selected),
    [events, selected],
  );

  const grid = useMemo(() => buildGrid(year, month), [year, month]);

  return (
    <View style={styles.flex}>
      <AppHeader title="Calendar" onBack={() => navigation.goBack()} />

      <FlatList
        data={dayEvents}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.calWrapper}>

            {/* Month navigation */}
            <View style={styles.monthNav}>
              <TouchableOpacity
                onPress={() => setViewDate(new Date(year, month - 1, 1))}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.navChevron}>{'\u2039'}</Text>
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{MONTHS[month]} {year}</Text>
              <TouchableOpacity
                onPress={() => setViewDate(new Date(year, month + 1, 1))}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.navChevron}>{'\u203a'}</Text>
              </TouchableOpacity>
            </View>

            {/* Day-of-week header */}
            <View style={styles.dayHeader}>
              {DAYS.map(d => <Text key={d} style={styles.dayLabel}>{d}</Text>)}
            </View>

            {/* Date grid */}
            {grid.map((row, ri) => (
              <View key={ri} style={styles.gridRow}>
                {row.map((day, ci) => {
                  if (!day) return <View key={ci} style={styles.cell} />;
                  const padM  = String(month + 1).padStart(2, '0');
                  const padD  = String(day).padStart(2, '0');
                  const ymd   = year + '-' + padM + '-' + padD;
                  const isSel = ymd === selected;
                  const isTod = ymd === toYMD(today);
                  const hasDot = eventDates.has(ymd);
                  return (
                    <TouchableOpacity
                      key={ci}
                      style={[
                        styles.cell,
                        isSel && styles.cellSelected,
                        isTod && !isSel && styles.cellToday,
                      ]}
                      onPress={() => setSelected(ymd)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dayNum,
                        isSel && styles.dayNumSel,
                        isTod && !isSel && styles.dayNumTod,
                      ]}>
                        {day}
                      </Text>
                      {hasDot && <View style={[styles.dot, isSel && styles.dotSel]} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {/* Events section header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selected === toYMD(today) ? "Today's Events" : 'Events - ' + selected}
              </Text>
              {isLoading && <ActivityIndicator color={colors.accent} size="small" />}
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.eventCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('EventDetail', { eventId: item.id, title: item.title })}
          >
            <View style={[styles.rsvpBar, { backgroundColor: RSVP_BG[item.my_rsvp ?? ''] ?? colors.border }]} />
            <View style={styles.eventBody}>
              <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.eventTime}>
                {formatTime(item.starts_at)} {'\u2013'} {formatTime(item.ends_at)}
              </Text>
              {!!item.location && (
                <Text style={styles.eventLoc} numberOfLines={1}>{'📍 ' + item.location}</Text>
              )}
            </View>
            {item.is_group && (
              <View style={styles.groupBadge}>
                <Text style={styles.groupBadgeText}>Group</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No events on this day</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex:        { flex: 1, backgroundColor: colors.background },
  listContent: { paddingBottom: 32 },
  calWrapper:  { backgroundColor: colors.surface, marginBottom: 8 },

  monthNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  navChevron: { fontSize: 28, color: colors.primary, fontWeight: '300', lineHeight: 32 },
  monthLabel: { fontSize: 17, fontWeight: '700', color: colors.text },

  dayHeader:  { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 4 },
  dayLabel:   {
    width: CELL_W, textAlign: 'center', fontSize: 11,
    fontWeight: '600', color: colors.textMuted,
  },

  gridRow:      { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 2 },
  cell:         {
    width: CELL_W, height: CELL_W, alignItems: 'center',
    justifyContent: 'center', borderRadius: CELL_W / 2,
  },
  cellSelected: { backgroundColor: colors.accent },
  cellToday:    { borderWidth: 1.5, borderColor: colors.accent },
  dayNum:       { fontSize: 14, fontWeight: '500', color: colors.text },
  dayNumSel:    { color: '#FFF', fontWeight: '700' },
  dayNumTod:    { color: colors.accent, fontWeight: '700' },
  dot:          {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: colors.accent, marginTop: 2,
  },
  dotSel: { backgroundColor: '#FFF' },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },

  eventCard: {
    flexDirection: 'row', backgroundColor: colors.surface,
    marginHorizontal: 16, marginBottom: 10,
    borderRadius: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  rsvpBar:    { width: 4 },
  eventBody:  { flex: 1, padding: 12 },
  eventTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 3 },
  eventTime:  { fontSize: 12, color: colors.textMuted },
  eventLoc:   { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  groupBadge:     { justifyContent: 'center', paddingHorizontal: 10 },
  groupBadgeText: { fontSize: 11, fontWeight: '700', color: colors.accent },

  empty:     { alignItems: 'center', paddingVertical: 32, marginHorizontal: 16 },
  emptyText: { fontSize: 14, color: colors.textMuted, fontStyle: 'italic' },
});
