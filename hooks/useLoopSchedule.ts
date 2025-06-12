import { useMemo } from 'react';

export interface ScheduleOption {
  label: string;
  value: string;
  details?: string;
  shortLabel?: string;
}

export interface WeekdayOption {
  label: string;
  value: string;
}

// Centralized schedule options
export const SCHEDULE_OPTIONS: ScheduleOption[] = [
  { label: 'Automatically (recommended)', value: 'auto', shortLabel: 'Auto' },
  { label: 'Once per Week', value: 'weekly_1x', shortLabel: '1x', details: '(e.g., Every Tuesday)' },
  { label: 'A Few Times a Week', value: 'weekly_3x', shortLabel: '3x', details: '(Mon, Wed, Fri)' },
  { label: 'Every Day', value: 'weekly_5x', shortLabel: '5x', details: '(7x per week)' },
  { label: 'Custom Schedule', value: 'custom', shortLabel: 'Days' },
];

// Weekday options for custom schedule
export const WEEKDAYS: WeekdayOption[] = [
  { label: 'S', value: 'sun' },
  { label: 'M', value: 'mon' },
  { label: 'T', value: 'tue' },
  { label: 'W', value: 'wed' },
  { label: 'T', value: 'thu' },
  { label: 'F', value: 'fri' },
  { label: 'S', value: 'sat' },
];

// Full day names for display
export const DAYS_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Short day names for display
export const DAYS_DISPLAY = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Mapping of short day values to full day names
export const SHORT_DAY_NAMES: { [key: string]: string } = {
  sun: 'Sun',
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
};

export const useLoopSchedule = () => {
  // Get the display title for a frequency
  const getFrequencyTitle = (frequency: string, customDays: string[] = []) => {
    const option = SCHEDULE_OPTIONS.find(opt => opt.value === frequency);
    if (!option) return 'Post Every';

    if (frequency === 'auto') return "Post Automatically";
    if (frequency === 'weekly_1x') return "Post Once per Week";
    if (frequency === 'weekly_3x') return "Post A Few Times a Week";
    if (frequency === 'weekly_5x') return "Post Every Day";
    if (frequency === 'custom') {
      if (customDays.length === 0) return 'Select Days to Post';
      const orderedSelectedDays = WEEKDAYS
        .filter(day => customDays.includes(day.value))
        .map(day => SHORT_DAY_NAMES[day.value]);
      if (orderedSelectedDays.length > 0) return `Post on ${orderedSelectedDays.join(', ')}`;
      return 'Select Days to Post';
    }
    return 'Post Every';
  };

  // Parse a schedule string into a frequency and custom days
  const parseSchedule = (schedule: string) => {
    const scheduleLower = schedule.toLowerCase();
    const matchedOption = SCHEDULE_OPTIONS.find(opt => opt.value.toLowerCase() === scheduleLower);
    
    if (matchedOption && matchedOption.value !== 'custom') {
      return {
        frequency: matchedOption.value,
        customDays: [],
      };
    }

    if (schedule) {
      const potentialDays = schedule.split(',').map(d => d.trim()).filter(Boolean);
      const validDays = potentialDays.filter(d => DAYS_FULL.some(kd => kd.toLowerCase() === d.toLowerCase()));
      
      if (validDays.length > 0 && validDays.length === potentialDays.length) {
        if (validDays.length === 7) {
          return {
            frequency: 'weekly_5x',
            customDays: [],
          };
        }
        if (validDays.length === 3 && validDays.map(d => d.toLowerCase()).sort().join(',') === 'fri,mon,wed') {
          return {
            frequency: 'weekly_3x',
            customDays: [],
          };
        }
        return {
          frequency: 'custom',
          customDays: validDays.map(d => DAYS_FULL.find(fd => fd.toLowerCase() === d.toLowerCase()) || '').filter(Boolean),
        };
      }
    }

    return {
      frequency: 'auto',
      customDays: [],
    };
  };

  // Format custom days into a schedule string
  const formatCustomDays = (customDays: string[]) => {
    if (!customDays.length) return '';
    const sortedDays = [...customDays].sort((a, b) => DAYS_FULL.indexOf(a) - DAYS_FULL.indexOf(b));
    return sortedDays.join(', ');
  };

  return {
    SCHEDULE_OPTIONS,
    WEEKDAYS,
    DAYS_FULL,
    DAYS_DISPLAY,
    SHORT_DAY_NAMES,
    getFrequencyTitle,
    parseSchedule,
    formatCustomDays,
  };
}; 