/**
 * GlobalShareScreen.tsx - Global share feed with category filter.
 * Features: category chips, infinite scroll, pull-to-refresh, FAB compose.
 * Data: GET /share/global  |  POST /share/global
 */
import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
  Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import { useAppDispatch } from '../../store';
import { showToast } from '../../store/uiSlice';
import { AppHeader, Avatar } from '../../components/common';
import { colors } from '../../theme/colors';

interface Share {
  id:           string;
  content:      string;
  category:     string | null;
  display_name: string;
  photo_url:    string | null;
  created_at:   string;
}

const CATEGORIES = ['All', 'Tips', 'Resources', 'News', 'Events', 'Other'];

const CAT_COLOR: Record<string, string> = {
  Tips: '#0E7F6B', Resources: '#3B82F6', News: '#F59E0B',
  Events: '#8B5CF6', Other: '#64748B',
};

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60)    return 'just now';
  if (secs < 3600)  return Math.floor(secs / 60) + 'm ago';
  if (secs < 86400) return Math.floor(secs / 3600) + 'h ago';
  return Math.floor(secs / 86400) + 'd ago';
}

const PAGE = 20;

function ShareCard({ item }: { item: Share }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Avatar uri={item.photo_url ?? undefined} size={36} />
        <View style={styles.meta}>
          <Text style={styles.author}>{item.display_name}</Text>
          <Text style={styles.ts}>{timeAgo(item.created_at)}</Text>
        </View>
        {item.category && (
          <View style={[styles.catBadge, { backgroundColor: CAT_COLOR[item.category] ?? colors.textMuted }]}>
            <Text style={styles.catText}>{item.category}</Text>
          </View>
        )}
      </View>
      <Text style={styles.content}>{item.content}</Text>
    </View>
  );
}

export default function GlobalShareScreen() {
  const navigation  = useNavigation();
  const dispatch    = useAppDispatch();
  const queryClient = useQueryClient();
  const [activeCat,  setActiveCat]  = useState('All');
  const [compose,    setCompose]    = useState(false);
  const [shareText,  setShareText]  = useState('');
  const [shareCat,   setShareCat]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const catParam = activeCat === 'All' ? undefined : activeCat;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<Share[]>({
      queryKey: ['shares', activeCat],
      queryFn: ({ pageParam }) => {
        const params: string[] = [];
        if (catParam) params.push('category=' + catParam);
        if (pageParam) params.push('cursor=' + pageParam);
        const qs = params.length ? '?' + params.join('&') : '';
        return apiClient.get('/share/global' + qs).then(r => r.data.data ?? []);
      },
      initialPageParam: undefined,
      getNextPageParam: (lastPage) =>
        lastPage.length < PAGE ? undefined : lastPage[lastPage.length - 1].id,
    });

  const allShares: Share[] = data?.pages.flat() ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['shares', activeCat] });
    setRefreshing(false);
  }, [queryClient, activeCat]);

  const handleSubmit = useCallback(async () => {
    if (!shareText.trim()) {
      dispatch(showToast({ message: 'Content cannot be empty.', type: 'error' })); return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, string> = { content: shareText.trim() };
      if (shareCat) body.category = shareCat;
      await apiClient.post('/share/global', body);
      await queryClient.invalidateQueries({ queryKey: ['shares'] });
      dispatch(showToast({ message: 'Shared globally!', type: 'success' }));
      setCompose(false); setShareText(''); setShareCat('');
    } catch { dispatch(showToast({ message: 'Failed to share. Please try again.', type: 'error' })); }
    finally { setSubmitting(false); }
  }, [shareText, shareCat, dispatch, queryClient]);

  return (
    <View style={styles.flex}>
      <AppHeader title="Global Share" onBack={() => navigation.goBack()} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cats}>
        {CATEGORIES.map(c => (
          <TouchableOpacity key={c} style={[styles.catChip, activeCat === c && styles.catChipActive]}
            onPress={() => setActiveCat(c)} activeOpacity={0.8}>
            <Text style={[styles.catChipText, activeCat === c && styles.catChipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator color={colors.accent} size="large" /></View>
      ) : (
        <FlatList
          data={allShares} keyExtractor={i => i.id}
          renderItem={({ item }) => <ShareCard item={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
          onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} /> : null}
          ListEmptyComponent={<View style={styles.centered}><Text style={styles.emptyText}>Nothing shared yet in this category.</Text></View>}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => setCompose(true)} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
      <Modal visible={compose} transparent animationType="slide" onRequestClose={() => setCompose(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalWrap}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={() => setCompose(false)} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Share Globally</Text>
            <Text style={styles.label}>Content</Text>
            <TextInput style={[styles.input, styles.inputMulti]} value={shareText} onChangeText={setShareText}
              placeholder="Share something with the community..." placeholderTextColor={colors.textMuted}
              multiline maxLength={2000} textAlignVertical="top" autoFocus />
            <Text style={styles.charCount}>{shareText.length}/2000</Text>
            <Text style={styles.label}>Category (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
              {CATEGORIES.filter(c => c !== 'All').map(c => (
                <TouchableOpacity key={c} style={[styles.catChip, shareCat === c && styles.catChipActive]}
                  onPress={() => setShareCat(shareCat === c ? '' : c)} activeOpacity={0.8}>
                  <Text style={[styles.catChipText, shareCat === c && styles.catChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitDisabled]}
              onPress={handleSubmit} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.submitText}>Share Now</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex:              { flex: 1, backgroundColor: colors.background },
  centered:          { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText:         { fontSize: 14, color: colors.textMuted, fontStyle: 'italic' },
  cats:              { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  catChip:           { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  catChipActive:     { backgroundColor: colors.accent, borderColor: colors.accent },
  catChipText:       { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  catChipTextActive: { color: '#FFF' },
  list:              { padding: 16, paddingBottom: 90 },
  card:              { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardHeader:        { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  meta:              { flex: 1, marginLeft: 10 },
  author:            { fontSize: 14, fontWeight: '600', color: colors.text },
  ts:                { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  catBadge:          { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  catText:           { fontSize: 11, fontWeight: '700', color: '#FFF' },
  content:           { fontSize: 15, color: colors.text, lineHeight: 22 },
  fab:               { position: 'absolute', bottom: 24, right: 20, width: 54, height: 54, borderRadius: 27, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  fabIcon:           { color: '#FFF', fontSize: 28, fontWeight: '300', lineHeight: 32 },
  modalWrap:         { flex: 1, justifyContent: 'flex-end' },
  sheet:             { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingBottom: 40 },
  handle:            { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  sheetTitle:        { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  label:             { fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6, marginTop: 14 },
  input:             { backgroundColor: colors.background, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: colors.text },
  inputMulti:        { minHeight: 110, textAlignVertical: 'top', paddingTop: 12 },
  charCount:         { fontSize: 11, color: colors.textMuted, textAlign: 'right', marginTop: 3 },
  submitBtn:         { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 16 },
  submitDisabled:    { opacity: 0.6 },
  submitText:        { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
