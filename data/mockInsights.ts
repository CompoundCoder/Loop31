import { 
  InsightMetric, 
  formatMetricValue, 
  calculateTrend, 
  getTrendColor 
} from '@/utils/insightTypes';

// Historical mock data for different time periods
export const HISTORICAL_DATA = {
  reach: {
    daily: [10200, 11500, 12400, 11800, 12100, 12400, 12800],
    weekly: [45000, 48000, 52000, 49000],
    monthly: [150000, 180000, 210000, 195000],
    yearly: [1800000, 2200000]
  },
  engagement: {
    daily: [2800, 3100, 2900, 3000, 3100, 3200, 3400],
    weekly: [12000, 13500, 14000, 15000],
    monthly: [45000, 52000, 58000, 55000],
    yearly: [520000, 650000]
  },
  followers: {
    daily: [420, 435, 442, 448, 455, 452, 460],
    weekly: [1800, 1900, 2000, 2100],
    monthly: [6000, 7200, 8500, 9000],
    yearly: [72000, 95000]
  }
};

// Helper to get last 7 days of data
const getLast7DaysData = (dailyData: number[]): {
  current: number;
  previous: number;
} => {
  // Get the most recent value
  const currentValue = dailyData[dailyData.length - 1];
  
  // Calculate the average of the previous 6 days
  const previousDays = dailyData.slice(-7, -1);
  const previousAverage = previousDays.reduce((sum, val) => sum + val, 0) / previousDays.length;

  return {
    current: currentValue,
    previous: previousAverage
  };
};

// Get data for each metric
const reachData = getLast7DaysData(HISTORICAL_DATA.reach.daily);
const engagementData = getLast7DaysData(HISTORICAL_DATA.engagement.daily);
const followersData = getLast7DaysData(HISTORICAL_DATA.followers.daily);

// Mock data for quick insights section
export const QUICK_INSIGHTS: InsightMetric[] = [
  {
    title: 'Total Reach',
    rawValue: reachData.current,
    previousValue: reachData.previous,
    icon: 'eye-outline',
    iconColor: '#FF6B6B', // Static red color
    lastUpdated: new Date().toISOString(),
    get value() { return formatMetricValue(this.rawValue) },
    get trend() { return calculateTrend(this.rawValue, this.previousValue).direction },
    get trendValue() { return calculateTrend(this.rawValue, this.previousValue).value }
  },
  {
    title: 'Engagement',
    rawValue: engagementData.current,
    previousValue: engagementData.previous,
    icon: 'heart-outline',
    iconColor: '#4ECDC4', // Static teal color
    lastUpdated: new Date().toISOString(),
    get value() { return formatMetricValue(this.rawValue) },
    get trend() { return calculateTrend(this.rawValue, this.previousValue).direction },
    get trendValue() { return calculateTrend(this.rawValue, this.previousValue).value }
  },
  {
    title: 'New Followers',
    rawValue: followersData.current,
    previousValue: followersData.previous,
    icon: 'account-plus-outline',
    iconColor: '#FFD93D', // Static yellow color
    lastUpdated: new Date().toISOString(),
    get value() { return formatMetricValue(this.rawValue) },
    get trend() { return calculateTrend(this.rawValue, this.previousValue).direction },
    get trendValue() { return calculateTrend(this.rawValue, this.previousValue).value }
  }
]; 