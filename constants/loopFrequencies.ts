// constants/loopFrequencies.ts

export type FrequencyValue = 
  | 'daily_1x' 
  | 'weekly_1x' 
  | 'weekly_3x' 
  | 'weekly_5x';

export interface FrequencyOption {
  value: FrequencyValue;
  label: string;
}

export const POST_FREQUENCIES: FrequencyOption[] = [
  { value: 'daily_1x', label: 'Daily' },
  { value: 'weekly_1x', label: 'Weekly' },
  { value: 'weekly_3x', label: '3 per week' },
  { value: 'weekly_5x', label: '5 per week' },
];

/**
 * Returns the label for a given frequency value.
 * @param value The frequency value (e.g., 'daily_1x')
 * @returns The display label (e.g., 'Daily') or the value if not found.
 */
export const getFrequencyLabel = (value: string | undefined): string => {
  if (!value) return '';
  // Handle 'Auto' as a special case, as it's not a standard frequency but might be used in mock data
  if (value.toLowerCase() === 'auto') return 'Auto';
  const option = POST_FREQUENCIES.find(f => f.value === value);
  return option ? option.label : value;
}; 