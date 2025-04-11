import { Platform } from '../types';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type TimeSlot = {
  hour: number; // 0-23
  engagement: number; // 0-1
  confidence: number; // 0-1
};

export type DailySchedule = {
  day: DayOfWeek;
  timeSlots: TimeSlot[];
};

export type OptimalTiming = {
  platform: Platform;
  schedule: DailySchedule[];
  bestTimes: Date[];
  timezone: string;
};

export class TimingService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string = process.env.API_BASE_URL || '') {
    this.apiBaseUrl = apiBaseUrl;
  }

  async getOptimalTiming(
    platform: Platform,
    timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
  ): Promise<OptimalTiming> {
    try {
      // In a real implementation, this would fetch data from the platform's API
      // and analyze historical engagement patterns
      return this.getMockOptimalTiming(platform, timezone);
    } catch (error) {
      console.error('Error getting optimal timing:', error);
      return {
        platform,
        schedule: [],
        bestTimes: [],
        timezone,
      };
    }
  }

  async getBestTimeToPost(
    platform: Platform,
    content: string,
    timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
  ): Promise<Date[]> {
    try {
      const timing = await this.getOptimalTiming(platform, timezone);
      return this.analyzeBestTimes(timing, content);
    } catch (error) {
      console.error('Error getting best time to post:', error);
      return [];
    }
  }

  private getMockOptimalTiming(platform: Platform, timezone: string): OptimalTiming {
    // Mock data - in a real implementation, this would be based on actual audience data
    const schedule: DailySchedule[] = [
      {
        day: 'monday',
        timeSlots: [
          { hour: 9, engagement: 0.8, confidence: 0.9 },
          { hour: 12, engagement: 0.75, confidence: 0.85 },
          { hour: 15, engagement: 0.85, confidence: 0.9 },
          { hour: 18, engagement: 0.9, confidence: 0.95 },
        ],
      },
      {
        day: 'tuesday',
        timeSlots: [
          { hour: 9, engagement: 0.82, confidence: 0.88 },
          { hour: 12, engagement: 0.78, confidence: 0.86 },
          { hour: 15, engagement: 0.88, confidence: 0.92 },
          { hour: 18, engagement: 0.92, confidence: 0.94 },
        ],
      },
      // Add similar data for other days...
    ];

    const now = new Date();
    const bestTimes = schedule.flatMap(day => {
      const date = this.getNextDayOfWeek(now, day.day);
      return day.timeSlots
        .filter(slot => slot.engagement > 0.8)
        .map(slot => {
          const time = new Date(date);
          time.setHours(slot.hour, 0, 0, 0);
          return time;
        });
    });

    return {
      platform,
      schedule,
      bestTimes: bestTimes.sort((a, b) => a.getTime() - b.getTime()),
      timezone,
    };
  }

  private analyzeBestTimes(timing: OptimalTiming, content: string): Date[] {
    // In a real implementation, this would analyze the content type, length,
    // media attachments, and target audience to determine the best posting times
    return timing.bestTimes.slice(0, 3);
  }

  private getNextDayOfWeek(date: Date, dayOfWeek: DayOfWeek): Date {
    const days = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const result = new Date(date);
    result.setDate(
      result.getDate() +
        ((7 + days[dayOfWeek] - result.getDay()) % 7)
    );
    return result;
  }

  // Helper function to format time in user's timezone
  static formatTime(date: Date, timezone: string): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
    });
  }

  // Helper function to get engagement score for a specific time
  static getEngagementScore(
    timing: OptimalTiming,
    date: Date
  ): number {
    const day = date
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase() as DayOfWeek;
    const hour = date.getHours();

    const daySchedule = timing.schedule.find(s => s.day === day);
    if (!daySchedule) return 0;

    const timeSlot = daySchedule.timeSlots.find(s => s.hour === hour);
    return timeSlot ? timeSlot.engagement : 0;
  }
} 