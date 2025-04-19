export interface Post {
  id: string;
  mediaUri: string;
  caption: string;
  createdAt: string;
  timesUsed?: number;
  lastUsedDate?: string;
  isMuted?: boolean;
  mutedUntil?: string;
  queueStatus?: 'normal' | 'pinned' | 'skipped';
  history?: {
    date: string;
    event: 'posted' | 'remixed' | 'muted';
    loopName: string;
  }[];
  linkedLoopIds?: string[];
  isMarkedForDeletion?: boolean;
}

export interface Loop {
  id: string;
  name: string;
  isActive: boolean;
  color: string;
  isPinned?: boolean;
  schedule: {
    type: 'weekly' | 'interval';
    daysOfWeek?: string[];
    intervalDays?: number;
    postTime?: string;
  };
  posts: Post[];
  tags?: string[];
  nextPostIndex: number;
  mediaSettings?: {
    shuffle?: boolean;
    avoidRecent?: boolean;
    preferImages?: boolean;
  };
} 