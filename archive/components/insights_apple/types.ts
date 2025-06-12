import type { MaterialCommunityIcons } from '@expo/vector-icons';

export type TrendDirection = 'up' | 'down' | 'neutral';

export type InsightType = 'hero' | 'detail';

/**
 * Represents a single insight metric item for the Apple-style display.
 */
export interface AppleInsightItem {
  id: string;
  type: InsightType;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string; // Optional override for icon color
  label: string;
  value: string; // The main metric value (e.g., "1,234", "+12.6%")
  trendValue?: string; // The trend value string (e.g., "+5.4%", "-12")
  trendDirection?: TrendDirection; // Direction for coloring/icon
  summarySentence?: string; // <-- Add optional summary sentence field
} 