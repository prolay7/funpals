/**
 * SearchScreen.tsx - Global search across users, posts, activities, groups, skills, meetings, categories.
 * Features: debounced search input, type filter chips, per-entity result cards, cross-tab navigation.
 * Data: GET /search?q=<query>&type=<type>
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity, ActivityIndicator,
  TextInput, ScrollView,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import { Avatar } from '../../components/common';
import { colors } from '../../theme/colors';
import { HomeStackParamList } from '../../navigation/types';

// ──────────────────────── Types ──────────────────────────────────────────────
interface UserResult     { id: string; display_name: string; username: string; photo_url: string | null }
interface PostResult     { id: string; title: string; content: string; display_name: string; created_at: string }
interface ActivityResult { id: string; title: string; description: string; category: string }
interface GroupResult    { id: string; name: string; description: string; type: string }
interface SkillResult    { id: string; name: string; status: string; description: string; display_name: string; photo_url: string | null }
interface CategoryResult { id: string; name: string; parent_id: string | null }
interface MeetingResult  { id: string; call_id: string; meeting_type: string; is_live: boolean; host: string }

interface SearchResults {
  users?:      UserResult[];
  posts?:      PostResult[];
  activities?: ActivityResult[];
  groups?:     GroupResult[];
  skills?:     SkillResult[];
  categories?: CategoryResult[];
  meetings?:   MeetingResult[];
}

// ──────────────────────── Constants ──────────────────────────────────────────
const TYPES = ['All', 'Users', 'Posts', 'Activities', 'Groups', 'Skills', 'Meetings', 'Categories'];

const SECTION_LABEL: Record<string, string> = {
  users: 'People', posts: 'Posts', activities: 'Activities',
  groups: 'Groups', skills: 'Skills', categories: 'Categories', meetings: 'Live Meetings',
};

const ENTITY_ORDER: (keyof SearchResults)[] = [
  'users', 'posts', 'activities', 'groups', 'skills', 'categories', 'meetings',
];

// ──────────────────────── Row Components ─────────────────────────────────────
function UserRow({ item, onPress }: { item: UserResult; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      <Avatar uri={item.photo_url ?? undefined} size={40} />
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{item.display_name}</Text>
        <Text style={styles.rowSub}>@{item.username}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

function PostRow({ item }: { item: PostResult }) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primary + '22' }]}>
        <Text style={styles.iconText}>📝</Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.rowSub} numberOfLines={2}>{item.content}</Text>
      </View>
    </View>
  );
}

function ActivityRow({ item, onPress }: { item: ActivityResult; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.iconCircle, { backgroundColor: colors.accent + '22' }]}>
        <Text style={styles.iconText}>🎯</Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
        {!!item.category && <Text style={styles.rowSub}>{item.category}</Text>}
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

function GroupRow({ item }: { item: GroupResult }) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: '#8B5CF622' }]}>
        <Text style={styles.iconText}>👥</Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.name}</Text>
        {!!item.description && <Text style={styles.rowSub} numberOfLines={1}>{item.description}</Text>}
      </View>
      <View style={styles.pill}>
        <Text style={styles.pillText}>{item.type}</Text>
      </View>
    </View>
  );
}

function SkillRow({ item }: { item: SkillResult }) {
  return (
    <View style={styles.row}>
      <Avatar uri={item.photo_url ?? undefined} size={40} />
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{item.name}</Text>
        <Text style={styles.rowSub}>{item.display_name} · {item.status}</Text>
      </View>
    </View>
  );
}

function CategoryRow({ item }: { item: CategoryResult }) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: '#F59E0B22' }]}>
        <Text style={styles.iconText}>🏷</Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{item.name}</Text>
      </View>
    </View>
  );
}

function MeetingRow({ item }: { item: MeetingResult }) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: '#EF444422' }]}>
        <Text style={styles.iconText}>🎙</Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{item.meeting_type} meeting</Text>
        <Text style={styles.rowSub}>Host: {item.host}</Text>
      </View>
      <View style={styles.liveBadge}>
        <Text style={styles.liveBadgeText}>LIVE</Text>
      </View>
    </View>
  );
}

// ──────────────────────── Section Header ─────────────────────────────────────
function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCount}>{count}</Text>
    </View>
  );
}

// ──────────────────────── Main Screen ────────────────────────────────────────
type Props = StackScreenProps<HomeStackParamList, 'Search'>;

export default function SearchScreen({ route, navigation }: Props) {
  const [searchText,     setSearchText]     = useState(route.params?.query ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(route.params?.query ?? '');
  const [activeType,     setActiveType]     = useState('All');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onChangeText = useCallback((text: string) => {
    setSearchText(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(text.trim()), 400);
  }, []);

  const typeParam = activeType === 'All' ? 'all' : activeType.toLowerCase();

  const { data, isLoading, isFetching } = useQuery<SearchResults>({
    queryKey: ['search', debouncedQuery, typeParam],
    queryFn: () =>
      apiClient
        .get(`/search?q=${encodeURIComponent(debouncedQuery)}&type=${typeParam}`)
        .then(r => r.data.data ?? {}),
    enabled: debouncedQuery.length >= 1,
    staleTime: 30_000,
  });

  const sections = useMemo(() => {
    if (!data) return [];
    return ENTITY_ORDER
      .filter(k => (data[k]?.length ?? 0) > 0)
      .map(k => ({ key: k, title: SECTION_LABEL[k], data: data[k] as any[] }));
  }, [data]);

  const hasResults = sections.length > 0;

  const navigateToUser = useCallback((item: UserResult) => {
    (navigation.getParent() as any)?.navigate('NearbyTab', {
      screen: 'UserDetail',
      params: { userId: item.id, displayName: item.display_name },
    });
  }, [navigation]);

  const navigateToActivity = useCallback((item: ActivityResult) => {
    (navigation.getParent() as any)?.navigate('ActivitiesTab', {
      screen: 'ActivityDetail',
      params: { activityId: item.id, title: item.title },
    });
  }, [navigation]);

  const renderItem = useCallback(({ item, section }: { item: any; section: { key: string } }) => {
    switch (section.key) {
      case 'users':      return <UserRow     item={item} onPress={() => navigateToUser(item)} />;
      case 'posts':      return <PostRow     item={item} />;
      case 'activities': return <ActivityRow item={item} onPress={() => navigateToActivity(item)} />;
      case 'groups':     return <GroupRow    item={item} />;
      case 'skills':     return <SkillRow    item={item} />;
      case 'categories': return <CategoryRow item={item} />;
      case 'meetings':   return <MeetingRow  item={item} />;
      default:           return null;
    }
  }, [navigateToUser, navigateToActivity]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; data: any[] } }) => (
      <SectionHeader title={section.title} count={section.data.length} />
    ),
    [],
  );

  return (
    <View style={styles.container}>
      {/* ── Search bar ──────────────────────────────────────────────── */}
      <View style={styles.searchBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.inputWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.input}
            value={searchText}
            onChangeText={onChangeText}
            placeholder="Search people, posts, activities..."
            placeholderTextColor={colors.textMuted}
            autoFocus
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* ── Type filter chips ────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {TYPES.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, activeType === t && styles.chipActive]}
            onPress={() => setActiveType(t)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, activeType === t && styles.chipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Results / states ─────────────────────────────────────────── */}
      {!debouncedQuery ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Search Funpals</Text>
          <Text style={styles.emptyText}>Find people, posts, activities, groups, and more.</Text>
        </View>
      ) : isLoading || isFetching ? (
        <View style={styles.empty}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : !hasResults ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>😶</Text>
          <Text style={styles.emptyTitle}>No results</Text>
          <Text style={styles.emptyText}>Try a different search term or type filter.</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => (item.id ?? String(index))}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: colors.background },

  // Search bar
  searchBar:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn:         { padding: 4, marginRight: 6 },
  backIcon:        { fontSize: 30, color: colors.text, lineHeight: 32 },
  inputWrap:       { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 8 },
  searchIcon:      { fontSize: 14, marginRight: 8 },
  input:           { flex: 1, fontSize: 15, color: colors.text, padding: 0 },

  // Chips
  chips:           { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  chip:            { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive:      { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText:        { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  chipTextActive:  { color: '#FFF' },

  // List
  list:            { paddingBottom: 40 },

  // Section header
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 },
  sectionTitle:    { flex: 1, fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionCount:    { fontSize: 11, color: colors.textMuted },

  // Rows
  row:             { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surface, marginHorizontal: 12, marginBottom: 2, borderRadius: 10 },
  rowBody:         { flex: 1, marginLeft: 12 },
  rowTitle:        { fontSize: 14, fontWeight: '600', color: colors.text },
  rowSub:          { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  chevron:         { fontSize: 20, color: colors.textMuted, marginLeft: 8 },
  iconCircle:      { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  iconText:        { fontSize: 18 },
  pill:            { backgroundColor: colors.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  pillText:        { fontSize: 10, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  liveBadge:       { backgroundColor: '#EF4444', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  liveBadgeText:   { fontSize: 10, fontWeight: '700', color: '#FFF' },

  // Empty / loading
  empty:           { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  emptyIcon:       { fontSize: 48, marginBottom: 16 },
  emptyTitle:      { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  emptyText:       { fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 40 },
});
