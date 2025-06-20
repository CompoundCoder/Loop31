export const LOOP_FREQUENCY_MAP = {
  auto: {
    label: 'Automatically',
    longLabel: 'Automatically (recommended)',
    shortLabel: 'Auto',
    color: '#4A90E2', // Muted Blue
    icon: 'aperture-outline',
    details: 'Let us optimize the schedule for you.',
  },
  daily_1x: {
    label: 'Daily',
    longLabel: 'Once a Day',
    shortLabel: '1x',
    color: '#E53935', // Red
    icon: 'calendar-outline',
    details: 'One post every day.',
  },
  weekly_1x: {
    label: 'Weekly',
    longLabel: 'Once per Week',
    shortLabel: '1x',
    color: '#50E3C2', // Teal
    icon: 'calendar-outline',
    details: '(e.g., Every Tuesday)',
  },
  weekly_3x: {
    label: '3 per week',
    longLabel: 'A Few Times a Week',
    shortLabel: '3x',
    color: '#F5A623', // Orange
    icon: 'calendar-outline',
    details: '(Mon, Wed, Fri)',
  },
  weekly_5x: {
    label: '5 per week',
    longLabel: 'Every Day',
    shortLabel: '5x',
    color: '#BD10E0', // Purple
    icon: 'calendar',
    details: '(Mon-Fri)',
  },
  custom: {
    label: 'Custom',
    longLabel: 'Custom Schedule',
    shortLabel: 'Days',
    color: '#9B9B9B', // Grey
    icon: 'options-outline',
    details: 'Pick specific days of the week.',
  },
};

export type LoopFrequency = keyof typeof LOOP_FREQUENCY_MAP; 