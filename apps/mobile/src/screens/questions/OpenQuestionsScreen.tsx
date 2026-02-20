/**
 * OpenQuestionsScreen.tsx - Community Q&A feed.
 * Features: infinite scroll, pull-to-refresh, FAB compose modal.
 * Data: GET /questions  |  POST /questions
 */
import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
  Modal, TextInput, KeyboardAvoidingView, Platform, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../utils/api';
import { useAppDispatch } from '../../store';
import { showToast } from '../../store/uiSlice';
import { AppHeader, Avatar, SkillBadge } from '../../components/common';
import { colors } from '../../theme/colors';

interface Question {
  id:           string;
  question:     string;
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

function QuestionCard({ item }: { item: Question }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Avatar uri={item.photo_url ?? undefined} size={36} />
        <View style={styles.meta}>
          <Text style={styles.author}>{item.display_name}</Text>
          <Text style={styles.ts}>{timeAgo(item.created_at)}</Text>
        </View>
        <View style={styles.qMark}><Text style={styles.qMarkText}>?</Text></View>
      </View>
      <Text style={styles.questionText}>{item.question}</Text>
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tags}>
          {item.tags.slice(0, 4).map(t => <SkillBadge key={t} label={t} style={styles.tag} />)}
        </View>
      )}
    </View>
  );
}

export default function OpenQuestionsScreen() {
  const navigation  = useNavigation();
  const dispatch    = useAppDispatch();
  const queryClient = useQueryClient();
  const [compose,    setCompose]    = useState(false);
  const [question,   setQuestion]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<Question[]>({
      queryKey: ['questions'],
      queryFn: ({ pageParam }) => {
        const url = pageParam ? '/questions?cursor=' + pageParam : '/questions';
        return apiClient.get(url).then(r => r.data.data ?? []);
      },
      initialPageParam: undefined,
      getNextPageParam: (lastPage) =>
        lastPage.length < PAGE ? undefined : lastPage[lastPage.length - 1].id,
    });

  const allQ: Question[] = data?.pages.flat() ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['questions'] });
    setRefreshing(false);
  }, [queryClient]);

  const handleSubmit = useCallback(async () => {
    if (!question.trim()) {
      dispatch(showToast({ message: 'Please enter your question.', type: 'error' })); return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/questions', { question: question.trim() });
      await queryClient.invalidateQueries({ queryKey: ['questions'] });
      dispatch(showToast({ message: 'Question posted!', type: 'success' }));
      setCompose(false); setQuestion('');
    } catch { dispatch(showToast({ message: 'Failed to post question.', type: 'error' })); }
    finally { setSubmitting(false); }
  }, [question, dispatch, queryClient]);

  return (
    <View style={styles.flex}>
      <AppHeader title="Open Questions" onBack={() => navigation.goBack()} />
      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator color={colors.accent} size="large" /></View>
      ) : (
        <FlatList
          data={allQ} keyExtractor={i => i.id}
          renderItem={({ item }) => <QuestionCard item={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
          onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} /> : null}
          ListEmptyComponent={<View style={styles.centered}><Text style={styles.emptyText}>No questions yet. Ask one!</Text></View>}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => setCompose(true)} activeOpacity={0.85}>
        <Text style={styles.fabIcon}>?</Text>
      </TouchableOpacity>
      <Modal visible={compose} transparent animationType="slide" onRequestClose={() => setCompose(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalWrap}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={() => setCompose(false)} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Ask a Question</Text>
            <Text style={styles.label}>Your Question</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={question} onChangeText={setQuestion}
              placeholder="What would you like to know?"
              placeholderTextColor={colors.textMuted}
              multiline maxLength={500} textAlignVertical="top" autoFocus
            />
            <Text style={styles.charCount}>{question.length}/500</Text>
            <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitDisabled]}
              onPress={handleSubmit} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.submitText}>Post Question</Text>}
            </TouchableOpacity>
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
  qMark:          { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  qMarkText:      { color: '#FFF', fontWeight: '800', fontSize: 16, lineHeight: 20 },
  questionText:   { fontSize: 15, fontWeight: '600', color: colors.text, lineHeight: 22 },
  tags:           { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  tag:            { marginRight: 6, marginBottom: 0 },
  fab:            { position: 'absolute', bottom: 24, right: 20, width: 54, height: 54, borderRadius: 27, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  fabIcon:        { color: '#FFF', fontSize: 24, fontWeight: '800', lineHeight: 28 },
  modalWrap:      { flex: 1, justifyContent: 'flex-end' },
  sheet:          { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingBottom: 40 },
  handle:         { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  sheetTitle:     { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  label:          { fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 },
  input:          { backgroundColor: colors.background, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: colors.text },
  inputMulti:     { minHeight: 120, textAlignVertical: 'top', paddingTop: 12 },
  charCount:      { fontSize: 11, color: colors.textMuted, textAlign: 'right', marginTop: 3 },
  submitBtn:      { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 16 },
  submitDisabled: { opacity: 0.6 },
  submitText:     { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
