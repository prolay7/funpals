/** Shared TypeScript types used across API and mobile app */

export interface User {
  id: string; email: string; username: string; display_name: string;
  photo_url: string | null; role: 'user' | 'admin'; created_at: string;
}

export interface UserProfile {
  user_id: string; age_range?: string; gender?: string; zip_code?: string;
  can_do: string[]; cannot_do: string[]; interests: string[];
  available_for: string[]; expertise_level?: number; bio?: string;
  daily_goal?: string; search_radius_miles: number;
}

export interface Channel {
  id: string; name: string; description?: string; type: string;
  is_default: boolean; is_favorite?: boolean; photo_url?: string;
}

export interface Message {
  id: string; channel_id: string; sender_id: string; content: string;
  type: 'text' | 'image' | 'system'; created_at: string;
  sender_name?: string; sender_photo?: string;
}

export interface Activity {
  id: string; category_id: string; title: string; description?: string;
  image_url?: string; address?: string; external_url?: string;
  is_active: boolean; sort_order: number; category_name: string;
}

export interface NearbyUser extends User {
  distance_miles: number; is_online: boolean; is_on_call: boolean;
  available_call: boolean; available_for: string[];
}

export interface Event {
  id: string; title: string; description?: string; location?: string;
  starts_at: string; ends_at: string; is_group: boolean; my_rsvp?: string;
}

export interface AuthTokens { accessToken: string; refreshToken: string }
export interface ApiResponse<T> { data: T; error?: string }
