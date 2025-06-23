import { ImageSourcePropType } from "react-native";

type TimeOfDay = 'morning' | 'noon' | 'evening';
type PostStatus = 'draft' | 'scheduled' | 'published' | 'deleted';

export class Post {
  id: string;
  caption: string;
  imageSource: ImageSourcePropType;
  media: string[];
  scheduledDate: string | null;
  scheduledTimeOfDay: TimeOfDay | null;
  accountTargets: string[];
  loopFolders?: string[];
  createdAt: string;
  updatedAt: string;
  status: PostStatus;

  constructor({
    id,
    caption = '',
    media = [],
    accountTargets = [],
    loopFolders,
    imageSource,
  }: {
    id: string;
    caption?: string;
    media?: string[];
    accountTargets?: string[];
    loopFolders?: string[];
    imageSource: ImageSourcePropType;
  }) {
    this.id = id;
    this.caption = caption;
    this.media = [...media];
    this.imageSource = imageSource;
    this.scheduledDate = null;
    this.scheduledTimeOfDay = null;
    this.accountTargets = [...accountTargets];
    this.loopFolders = loopFolders ? [...loopFolders] : undefined;
    this.createdAt = new Date().toISOString();
    this.updatedAt = this.createdAt;
    this.status = 'draft';
  }

  private updateTimestamp(): void {
    this.updatedAt = new Date().toISOString();
  }

  updateCaption(newCaption: string): void {
    this.caption = newCaption;
    this.updateTimestamp();
  }

  addMedia(uri: string): void {
    if (!this.media.includes(uri)) {
      this.media.push(uri);
      this.updateTimestamp();
    }
  }

  removeMedia(uri: string): void {
    const index = this.media.indexOf(uri);
    if (index !== -1) {
      this.media.splice(index, 1);
      this.updateTimestamp();
    }
  }

  schedule(date: string, timeOfDay: TimeOfDay): void {
    // Validate ISO date string
    if (!Date.parse(date)) {
      throw new Error('Invalid date format. Please provide an ISO date string.');
    }

    this.scheduledDate = date;
    this.scheduledTimeOfDay = timeOfDay;
    this.status = 'scheduled';
    this.updateTimestamp();
  }

  markAsPublished(): void {
    this.status = 'published';
    this.updateTimestamp();
  }

  toJSON(): object {
    return {
      id: this.id,
      caption: this.caption,
      media: this.media,
      imageSource: this.imageSource,
      scheduledDate: this.scheduledDate,
      scheduledTimeOfDay: this.scheduledTimeOfDay,
      accountTargets: this.accountTargets,
      loopFolders: this.loopFolders,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      status: this.status,
    };
  }
} 