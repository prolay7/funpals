/**
 * EditProfileScreen.tsx — Edit own profile.
 *
 * Sections:
 *  • Display name (TextInput)
 *  • Bio (multiline TextInput)
 *  • Age range (segmented selector: 18-25 / 26-35 / 36-45 / 46+)
 *  • Zip code (TextInput, numeric keyboard)
 *  • Interests (predefined chips, toggle to add/remove)
 *  • Available for (predefined chips, toggle)
 *  • Expertise level (tap a dot 1–5)
 *
 * Data flow:
 *  • Loads fresh profile from GET /users/me via useQuery
 *  • Populates local state with useEffect once data arrives
 *  • Save → PATCH /users/me → success toast + goBack
 *
 * Navigation: ProfileStackParamList › EditProfile
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ProfileStackParamList } from '../../navigation/types';
import { apiClient } from '../../utils/api';
import { useAppDispatch } from '../../store';
import { showToast } from '../../store/uiSlice';
import { AppHeader, SkillBadge } from '../../components/common';
import { colors } from '../../theme/colors';

type Props = StackScreenProps<ProfileStackParamList, 'EditProfile'>;

interface MyProfile {
  display_name:    string;
  bio:             string | null;
  age_range:       string | null;
  zip_code:        string | null;
  interests:       string[] | null;
  available_for:   string[] | null;
  expertise_level: number | null;
}

const AGE_OPTIONS  = ['18-25', '26-35', '36-45', '46+'];

const INTEREST_OPTIONS = [
  'Photography', 'Hiking', 'Yoga', 'Cooking', 'Reading',
  'Music', 'Travel', 'Tech', 'Art', 'Gaming',
  'Fitness', 'Writing', 'Movies', 'Cycling', 'Dancing',
];

const AVAILABLE_OPTIONS = [
  'Coffee', 'Calls', 'Mentoring', 'Learning', 'Workout',
  'Brainstorm', 'Networking', 'Collaboration', 'Gaming',
];

const EXPERTISE_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Novice',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

export default function EditProfileScreen({ navigation }: Props) {
  const dispatch     = useAppDispatch();
  const queryClient  = useQueryClient();

  // ── Fetch current profile ─────────────────────────────────────────────────
  const { data, isLoading } = useQuery<MyProfile>({
    queryKey: ['profile', 'me'],
    queryFn:  () => apiClient.get('/users/me').then(r => r.data.data),
  });

  // ── Form state ────────────────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState('');
  const [bio,         setBio]         = useState('');
  const [ageRange,    setAgeRange]    = useState('');
  const [zipCode,     setZipCode]     = useState('');
  const [interests,   setInterests]   = useState<string[]>([]);
  const [available,   setAvailable]   = useState<string[]>([]);
  const [expertise,   setExpertise]   = useState(0);
  const [saving,      setSaving]      = useState(false);

  // ── Populate from fetched data ────────────────────────────────────────────
  useEffect(() => {
    if (!data) return;
    setDisplayName(data.display_name ?? '');
    setBio(data.bio ?? '');
    setAgeRange(data.age_range ?? '');
    setZipCode(data.zip_code ?? '');
    setInterests(data.interests ?? []);
    setAvailable(data.available_for ?? []);
    setExpertise(data.expertise_level ?? 0);
  }, [data]);

  // ── Toggle helpers ────────────────────────────────────────────────────────
  const toggleInterest = useCallback((tag: string) => {
    setInterests(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, []);

  const toggleAvailable = useCallback((tag: string) => {
    setAvailable(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!displayName.trim()) {
      dispatch(showToast({ message: 'Display name cannot be empty.', type: 'error' }));
      return;
    }
    setSaving(true);
    try {
      await apiClient.patch('/users/me', {
        display_name:    displayName.trim(),
        bio:             bio.trim() || null,
        age_range:       ageRange || null,
        zip_code:        zipCode.trim() || null,
        interests,
        available_for:   available,
        expertise_level: expertise || null,
      });
      await queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      dispatch(showToast({ message: 'Profile updated!', type: 'success' }));
      navigation.goBack();
    } catch {
      dispatch(showToast({ message: 'Failed to save. Please try again.', type: 'error' }));
    } finally {
      setSaving(false);
    }
  }, [displayName, bio, ageRange, zipCode, interests, available, expertise, dispatch, navigation, queryClient]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.flex}>
        <AppHeader title="Edit Profile" onBack={() => navigation.goBack()} />
        <View style={styles.centered}><ActivityIndicator color={colors.accent} size="large" /></View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <AppHeader
        title="Edit Profile"
        onBack={() => navigation.goBack()}
        rightLabel={saving ? undefined : 'Save'}
        onRightPress={saving ? undefined : handleSave}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Display name ── */}
        <View style={styles.field}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
            maxLength={60}
          />
        </View>

        {/* ── Bio ── */}
        <View style={styles.field}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell people a bit about yourself…"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={300}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{bio.length}/300</Text>
        </View>

        {/* ── Age Range ── */}
        <View style={styles.field}>
          <Text style={styles.label}>Age Range</Text>
          <View style={styles.segmentRow}>
            {AGE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.segment, ageRange === opt && styles.segmentActive]}
                onPress={() => setAgeRange(ageRange === opt ? '' : opt)}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentText, ageRange === opt && styles.segmentTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Zip Code ── */}
        <View style={styles.field}>
          <Text style={styles.label}>Zip Code</Text>
          <TextInput
            style={styles.input}
            value={zipCode}
            onChangeText={setZipCode}
            placeholder="e.g. 90210"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        {/* ── Expertise Level ── */}
        <View style={styles.field}>
          <Text style={styles.label}>Expertise Level</Text>
          <View style={styles.expertiseRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.expertiseDot, n <= expertise && styles.expertiseDotFilled]}
                onPress={() => setExpertise(expertise === n ? 0 : n)}
                activeOpacity={0.7}
              />
            ))}
            {expertise > 0 && (
              <Text style={styles.expertiseLabel}>{EXPERTISE_LABELS[expertise]}</Text>
            )}
          </View>
        </View>

        {/* ── Interests ── */}
        <View style={styles.field}>
          <Text style={styles.label}>Interests</Text>
          <View style={styles.chips}>
            {INTEREST_OPTIONS.map(tag => (
              <SkillBadge
                key={tag}
                label={tag}
                selected={interests.includes(tag)}
                onPress={() => toggleInterest(tag)}
              />
            ))}
          </View>
        </View>

        {/* ── Available for ── */}
        <View style={styles.field}>
          <Text style={styles.label}>Available for</Text>
          <View style={styles.chips}>
            {AVAILABLE_OPTIONS.map(tag => (
              <SkillBadge
                key={tag}
                label={tag}
                selected={available.includes(tag)}
                onPress={() => toggleAvailable(tag)}
              />
            ))}
          </View>
        </View>

        {/* ── Save button (bottom) ── */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving
            ? <ActivityIndicator color="#FFF" size="small" />
            : <Text style={styles.saveBtnText}>Save Changes</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:    { flex: 1, backgroundColor: colors.background },
  centered:{ flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:  { padding: 20, paddingBottom: 48 },

  field:   { marginBottom: 24 },
  label:   { fontSize: 13, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },

  input: {
    backgroundColor:  colors.surface,
    borderRadius:     10,
    borderWidth:      1,
    borderColor:      colors.border,
    paddingHorizontal: 14,
    paddingVertical:   12,
    fontSize:         15,
    color:            colors.text,
  },
  inputMulti:  { minHeight: 90, paddingTop: 12 },
  charCount:   { fontSize: 11, color: colors.textMuted, textAlign: 'right', marginTop: 4 },

  // Segmented control
  segmentRow: { flexDirection: 'row', gap: 8 },
  segment: {
    flex:            1,
    paddingVertical: 10,
    borderRadius:    8,
    borderWidth:     1.5,
    borderColor:     colors.border,
    alignItems:      'center',
  },
  segmentActive:    { borderColor: colors.accent, backgroundColor: colors.accent },
  segmentText:      { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  segmentTextActive:{ color: '#FFF' },

  // Expertise
  expertiseRow:       { flexDirection: 'row', alignItems: 'center' },
  expertiseDot:       { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: colors.accent, marginRight: 8 },
  expertiseDotFilled: { backgroundColor: colors.accent },
  expertiseLabel:     { fontSize: 13, color: colors.textMuted, fontWeight: '600', marginLeft: 4 },

  // Chips
  chips: { flexDirection: 'row', flexWrap: 'wrap' },

  // Save button
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius:    12,
    paddingVertical:  16,
    alignItems:      'center',
    marginTop:       8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText:     { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
