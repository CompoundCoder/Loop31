export interface Loop {
  id: string;
  title: string;
  color: string;
  postCount: number;
  schedule: string;
  frequency: string;
  isActive: boolean;
  previewImageUrl?: string;
  status?: 'active' | 'paused' | 'draft' | 'error';
} 