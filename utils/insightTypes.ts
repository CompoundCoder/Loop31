import { MaterialCommunityIcons } from '@expo/vector-icons';

export type TrendDirection = 'up' | 'down' | 'neutral';

export type InsightMetric = {
  /**
   * Display title for the metric
   */
  title: string;
  /**
   * Current value of the metric
   */
  value: string;
  /**
   * MaterialCommunityIcons icon name
   */
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  /**
   * Color for the icon
   */
  iconColor: string;
  /**
   * Direction of the trend
   */
  trend: TrendDirection;
  /**
   * Percentage or value change (e.g., "+18%", "-5%")
   */
  trendValue: string;
  /**
   * Raw numerical value for sorting/calculations
   */
  rawValue: number;
  /**
   * Previous period value for comparison
   */
  previousValue: number;
  /**
   * Timestamp of the last update
   */
  lastUpdated: string;
};

export type InsightPeriod = 'day' | 'week' | 'month' | 'year';

/**
 * Format a number into a human-readable string with K/M/B suffixes
 */
export const formatMetricValue = (value: number): string => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + 'B';
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toString();
};

/**
 * Calculate trend direction and percentage based on current and previous values
 */
export const calculateTrend = (current: number, previous: number): { direction: TrendDirection; value: string } => {
  if (previous === 0) return { direction: 'neutral', value: 'N/A' };
  
  const percentageChange = ((current - previous) / previous) * 100;
  
  return {
    direction: percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'neutral',
    value: `${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(1)}%`
  };
};

/**
 * Get the appropriate icon color based on trend direction
 */
export const getTrendColor = (trend: TrendDirection): string => {
  switch (trend) {
    case 'up':
      return '#4ECDC4'; // success green
    case 'down':
      return '#FF6B6B'; // warning red
    default:
      return '#FFD93D'; // neutral yellow
  }
};

/**
 * Get the comparison period based on the current period
 */
export const getComparisonPeriod = (period: InsightPeriod): InsightPeriod => {
  switch (period) {
    case 'day':
      return 'week';
    case 'week':
      return 'month';
    case 'month':
      return 'year';
    default:
      return 'year';
  }
};

/**
 * Calculate the average value for a period
 */
export const calculatePeriodAverage = (values: number[]): number => {
  if (!values.length) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

/**
 * Compare current period with previous period
 */
export const comparePeriods = (
  currentPeriod: number[],
  previousPeriod: number[]
): { 
  trend: TrendDirection; 
  percentage: string;
  average: number;
  previousAverage: number;
} => {
  const currentAvg = calculatePeriodAverage(currentPeriod);
  const previousAvg = calculatePeriodAverage(previousPeriod);
  
  const { direction, value } = calculateTrend(currentAvg, previousAvg);
  
  return {
    trend: direction,
    percentage: value,
    average: currentAvg,
    previousAverage: previousAvg
  };
};

/**
 * Format a date range for display
 */
export const formatDateRange = (period: InsightPeriod, date: Date = new Date()): string => {
  const formatter = new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: period === 'year' ? 'numeric' : undefined
  });

  const start = new Date(date);
  const end = new Date(date);

  switch (period) {
    case 'day':
      return formatter.format(date);
    case 'week':
      start.setDate(date.getDate() - 7);
      break;
    case 'month':
      start.setMonth(date.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(date.getFullYear() - 1);
      break;
  }

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}; 