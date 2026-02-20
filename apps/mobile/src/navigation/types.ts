/**
 * types.ts — TypeScript param list definitions for every stack navigator.
 * Import the relevant param list in each screen for typed navigation props.
 */

// ── Auth ─────────────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  SplashSequence: undefined;
  Landing:        undefined;
  Login:          undefined;
  Register:       undefined;
};

// ── Home tab stack ────────────────────────────────────────────────────────────
export type HomeStackParamList = {
  Home:           undefined;
  Calendar:       undefined;
  EventDetail:    { eventId: string; title: string };
  OpenPosts:      undefined;
  OpenQuestions:  undefined;
  GlobalShare:    undefined;
  Search:         { query?: string };
};

// ── Nearby tab stack ──────────────────────────────────────────────────────────
export type NearbyStackParamList = {
  Nearby:     undefined;
  UserDetail: { userId: string; displayName: string };
};

// ── Chat tab stack ────────────────────────────────────────────────────────────
export type ChatStackParamList = {
  ChannelList: undefined;
  ChatRoom:    { channelId: string; channelName: string };
};

// ── Activities tab stack ──────────────────────────────────────────────────────
export type ActivitiesStackParamList = {
  BrowseActivities: undefined;
  ActivityDetail:   { activityId: string; title: string };
};

// ── Profile tab stack ─────────────────────────────────────────────────────────
export type ProfileStackParamList = {
  Profile:     undefined;
  EditProfile: undefined;
};
