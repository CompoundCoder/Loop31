export interface ScheduledPost {
  id: string;
  caption: string;
  mediaUri: string;
  createdAt: string;
  scheduledDate?: string;  // Optional for drafts
  loopId?: string;        // ID of the loop this post is scheduled for
}

export interface ScheduleSettings {
  defaultTime?: string;  // HH:mm format
  timezone?: string;     // For future use
} 