// Platform types
export type Platform = 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'pinterest' | 'tiktok' | 'youtube';

// Media types
export type MediaType = 'image' | 'video';

export type MediaItem = {
  uri: string;
  type: MediaType;
  width?: number;
  height?: number;
  duration?: number; // for videos
};

// Post types
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export type Post = {
  id: string;
  content: string;
  platforms: Platform[];
  media?: MediaItem[];
  scheduledTime?: Date;
  status: PostStatus;
  hashtags: string[];
  mentions: string[];
  links: string[];
  analytics?: PostAnalytics;
  metadata: {
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
  };
};

// Analytics types
export type PostAnalytics = {
  reach: number;
  impressions: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  clicks?: number;
  saves?: number;
};

export type TimeRange = '7d' | '30d' | '90d' | 'custom';

export type AnalyticsMetric = 
  | 'reach'
  | 'impressions'
  | 'engagement'
  | 'likes'
  | 'comments'
  | 'shares'
  | 'clicks'
  | 'saves';

// User types
export type UserRole = 'owner' | 'admin' | 'editor' | 'analyst';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
};

// Team types
export type Team = {
  id: string;
  name: string;
  members: User[];
  owner: string;
};

// Workspace types
export type Workspace = {
  id: string;
  name: string;
  teams: Team[];
  connectedPlatforms: Platform[];
};

// API Response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}; 