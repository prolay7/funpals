export interface User {
  id: string;
  username: string;
  email: string;
  display_name?: string;
  role: 'admin' | 'user';
  photo_url?: string;
  is_banned: boolean;
  expertise_level?: number;
  daily_goal?: string;
  created_at: string;
}

export interface Activity {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  category_name?: string;
  address?: string;
  created_at: string;
}

export interface Material {
  id: string;
  title: string;
  url: string;
  category?: string;
  description?: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  is_private: boolean;
  member_count?: number;
  created_at: string;
}

export interface Meeting {
  id: string;
  call_id: string;
  meeting_type: 'audio' | 'video' | 'google_meet';
  created_by: string;
  is_live: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reporter_username?: string;
  reported_id: string;
  reported_username?: string;
  reason: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  content?: string;
  author_id?: string;
  author_username?: string;
  created_at: string;
}

export interface AppStats {
  total_users?: number;
  totalUsers?: number;
  total_channels?: number;
  totalChannels?: number;
  messages_today?: number;
  messagesToday?: number;
  active_activities?: number;
  activeActivities?: number;
  live_meetings?: number;
  pending_reports?: number;
}
