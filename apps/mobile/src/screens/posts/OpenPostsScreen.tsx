/**
 * OpenPostsScreen.tsx - Community open posts feed.
 * Features: infinite scroll, pull-to-refresh, FAB compose modal.
 * Data: GET /posts  |  POST /posts
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
import { AppHeader, Avatar, SkillBadge } from '../../components/common';
import { colors } from '../../theme/colors';

interface Post {
  id:           string;
  title:        string;
  content:      string;
  tags:         string[];
  display_name: string;
  photo_url:    string | null;
  created_at:   string;
}

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60)    return 'just now';
  if (secs < 3600)  return Math.floor(secs / 60) + 'm ago';
  if (secs < 86400) return Math.floor(secs / 3600) + 'h ago';
  return Math.floor(secs / 86400) + 'd ago';
}

const PAGE = 20;

function PostCard({ item }: { item: Post }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Avatar uri={item.photo_url ?? undefined} size={36} />
        <View style={styles.meta}>
          <Text style={styles.author}>{item.display_name}</Text>
          <Text style={styles.ts}>{timeAgo(item.created_at)}</Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardContent} numberOfLines={3}>{item.content}</Text>
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tags}>
          {item.tags.slice(0, 4).map(t => <SkillBadge key={t} label={t} style={styles.tag} />)}
        </View>
      )}
    </View>
  );
}

export default function OpenPostsScreen() {
  const navigation  = useNavigation();
  const dispatch    = useAppDispatch();
  const queryClient = useQueryClient();
  const [compose,    setCompose]    = useState(false);
  const [pTitle,     setPTitle]     = useState('');
  const [pContent,   setPContent]   = useState('');
  const [tagInput,   setTagInput]   = useState('');
  const [tags,       setTags]       = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<Post[]>({
      queryKey: ['posts'],
      queryFn: ({ pageParam }) => {
        const url = pageParam ? '/posts?cursor=' + pageParam : '/posts';
        return apiClient.get(url).then(r => r.data.data ?? []);
      },
      initialPageParam: undefined,
      getNextPageParam: (lastPage) =>
        lastPage.length < PAGE ? undefined : lastPage[lastPage.length - 1].id,
    });

  const allPosts: Post[] = data?.pages.flat() ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['posts'] });
    setRefreshing(false);
  }, [queryClient]);

  const addTag = useCallback(() => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 5) { setTags(prev => [...prev, t]); setTagInput(''); }
  }, [tagInput, tags]);

  const resetCompose = () => { setPTitle(''); setPContent(''); setTagInput(''); setTags([]); };

  const handleSubmit = useCallback(async () => {
    if (!pTitle.trim() || !pContent.trim()) {
      dispatch(showToast({ message: 'Title and content are required.', type: 'error' })); return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/posts', { title: pTitle.trim(), content: pContent.trim(), tags });
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      dispatch(showToast({ message: 'Post published!', type: 'success' }));
      setCompose(false); resetCompose();
    } catch { dispatch(showToast({ message: 'Failed to publish post.', type: 'error' })); }
    finally { setSubmitting(false); }
  }, [pTitle, pContent, tags, dispatch, queryClient]);

  return (
    <View style={styles.flex}>
      <AppHeader title="Open Posts" onBack={() => navigation.goBack()} />
      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator color={colors.accent} size="large" /></View>
      ) : (
        <FlatList
          data={allPosts} keyExtractor={i => i.id}
          renderItem={({ item }) => <PostCard item={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
          onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} /> : null}
          ListEmptyComponent={<View style={styles.centered}><Text style={styles.emptyText}>No posts yet. Be the first!</Text></View>}
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
            <Text style={styles.sheetTitle}>New Post</Text>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.label}>Title</Text>
              <TextInput style={styles.input} value={pTitle} onChangeText={setPTitle}
                placeholder="Post title..." placeholderTextColor={colors.textMuted} maxLength={120} />
              <Text style={styles.label}>Content</Text>
              <TextInput style={[styles.input, styles.inputMulti]} value={pContent} onChangeText={setPContent}
                placeholder="Share your thoughts..." placeholderTextColor={colors.textMuted}
                multiline maxLength={2000} textAlignVertical="top" />
              <Text style={styles.charCount}>{pContent.length}/2000</Text>
              <Text style={styles.label}>Tags (optional, up to 5)</Text>
              <View style={styles.tagRow}>
                <TextInput style={[styles.input, { flex: 1 }]} value={tagInput} onChangeText={setTagInput}
                  placeholder="Add a tag..." placeholderTextColor={colors.textMuted}
                  maxLength={30} onSubmitEditing={addTag} returnKeyType="done" />
                <TouchableOpacity style={styles.tagAddBtn} onPress={addTag}>
                  <Text style={styles.tagAddText}>Add</Text>
                </TouchableOpacity>
              </View>
              {tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {tags.map(t => <SkillBadge key={t} label={t} onRemove={() => setTags(p => p.filter(x => x !== t))} />)}
                </View>
              )}
              <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitDisabled]}
                onPress={handleSubmit} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.submitText}>Publish Post</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex:           { flex: 1, backgroundColor: colors.background },
  centered:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText:      { fontSize: 14, color: colors.textMuted, fontStyle: 'italic' },
  list:           { padding: 16, paddingBottom: 90 },
  card:           { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardHeader:     { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  meta:           { flex: 1, marginLeft: 10 },
  author:         { fontSize: 14, fontWeight: '600', color: colors.text },
  ts:             { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  cardTitle:      { fontSize: 16, fontWeight: '700', color: colors.primary, marginBottom: 6 },
  cardContent:    { fontSize: 14, color: colors.text, lineHeight: 20 },
  tags:           { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  tag:            { marginRight: 6, marginBottom: 0 },
  fab:            { position: 'absolute', bottom: 24, right: 20, width: 54, height: 54, borderRadius: 27, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  fabIcon:        { color: '#FFF', fontSize: 28, fontWeight: '300', lineHeight: 32 },
  modalWrap:      { flex: 1, justifyContent: 'flex-end' },
  sheet:          { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingBottom: 40, maxHeight: '90%' },
  handle:         { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  sheetTitle:     { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  label:          { fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 14, marginBottom: 6 },
  input:          { backgroundColor: colors.background, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: colors.text },
  inputMulti:     { minHeight: 100, textAlignVertical: 'top', paddingTop: 12 },
  charCount:      { fontSize: 11, color: colors.textMuted, textAlign: 'right', marginTop: 3 },
  tagRow:         { flexDirection: 'row', gap: 8, alignItems: 'center' },
  tagAddBtn:      { backgroundColor: colors.accent, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 11 },
  tagAddText:     { color: '#FFF', fontWeight: '700', fontSize: 14 },
  tagsRow:        { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  submitBtn:      { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 20, marginBottom: 8 },
  submitDisabled: { opacity: 0.6 },
  submitText:     { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
