import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  TouchableWithoutFeedback,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AnalyticsStackParamList } from '../navigation/AnalyticsNavigator';

type TimeRange = '7d' | '30d' | '90d' | '1y';
type MetricType = 'reach' | 'impressions' | 'engagement' | 'followers' | 'posts' | 'growth';
type AccountType = 'all' | 'group' | 'individual';
type FilterType = 'groups' | 'accounts' | null;

interface Group {
  id: string;
  name: string;
}

interface Account {
  id: string;
  name: string;
  platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook';
}

interface Metric {
  id: MetricType;
  label: string;
  value: number;
  previousValue: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface SelectableItem {
  id: string;
  name: string;
  type: 'group' | 'account';
  platform?: 'instagram' | 'twitter' | 'linkedin' | 'facebook';
}

// Types for analytics data
interface AnalyticsMetrics {
  impressions: number;
  engagementRate: number;
  reach: number;
  shares: number;
  followers: number;
  growthRate: number;
  posts: number;
}

interface LocationData {
  city: string;
  country: string;
  percentage: number;
}

interface TimeSeriesData {
  date: string;
  value: number;
}

interface AnalyticsDataset {
  metrics: AnalyticsMetrics;
  engagement: TimeSeriesData[];
  followerGrowth: TimeSeriesData[];
  topLocations: LocationData[];
}

const MOCK_GROUPS: Group[] = [
  { id: 'g1', name: 'Nike' },
  { id: 'g2', name: 'Adidas' },
  { id: 'g3', name: 'Puma' },
];

const MOCK_ACCOUNTS: Account[] = [
  { id: 'a1', name: 'Nike Instagram', platform: 'instagram' },
  { id: 'a2', name: 'Nike Twitter', platform: 'twitter' },
  { id: 'a3', name: 'Adidas Instagram', platform: 'instagram' },
  { id: 'a4', name: 'Adidas Twitter', platform: 'twitter' },
];

const METRICS: Metric[] = [
  { id: 'impressions', label: 'Impressions', value: 289000, previousValue: 265000, icon: 'eye-outline', color: '#007AFF' },
  { id: 'engagement', label: 'Engagement', value: 4.8, previousValue: 4.2, icon: 'heart-outline', color: '#FF2D55' },
  { id: 'followers', label: 'Followers', value: 12500, previousValue: 11800, icon: 'people-outline', color: '#34C759' },
  { id: 'posts', label: 'Posts', value: 45, previousValue: 42, icon: 'document-text-outline', color: '#FF9500' },
  { id: 'growth', label: 'Growth', value: 8.5, previousValue: 7.2, icon: 'trending-up', color: '#5856D6' },
];

// Mock data structure that mirrors expected API response
const MOCK_ANALYTICS_DATA: Record<TimeRange, AnalyticsDataset> = {
  '7d': {
    metrics: {
      impressions: 289000,
      engagementRate: 4.8,
      reach: 145200,
      shares: 1200,
      followers: 12500,
      growthRate: 8.5,
      posts: 45,
    },
    engagement: [
      { date: '2024-03-01', value: 3.2 },
      { date: '2024-03-02', value: 4.1 },
      { date: '2024-03-03', value: 3.8 },
      { date: '2024-03-04', value: 4.5 },
      { date: '2024-03-05', value: 4.9 },
      { date: '2024-03-06', value: 4.2 },
      { date: '2024-03-07', value: 4.8 },
    ],
    followerGrowth: [
      { date: '2024-03-01', value: 11800 },
      { date: '2024-03-02', value: 11900 },
      { date: '2024-03-03', value: 12100 },
      { date: '2024-03-04', value: 12200 },
      { date: '2024-03-05', value: 12300 },
      { date: '2024-03-06', value: 12400 },
      { date: '2024-03-07', value: 12500 },
    ],
    topLocations: [
      { city: 'New York', country: 'USA', percentage: 25 },
      { city: 'Los Angeles', country: 'USA', percentage: 18 },
      { city: 'London', country: 'UK', percentage: 15 },
    ],
  },
  '30d': {
    metrics: {
      impressions: 1250000,
      engagementRate: 5.2,
      reach: 620000,
      shares: 4800,
      followers: 15000,
      growthRate: 12.8,
      posts: 180,
    },
    engagement: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2024, 2, i + 1).toISOString().split('T')[0],
      value: 3 + Math.random() * 3,
    })),
    followerGrowth: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2024, 2, i + 1).toISOString().split('T')[0],
      value: 11000 + (i * 150) + Math.random() * 100,
    })),
    topLocations: [
      { city: 'New York', country: 'USA', percentage: 22 },
      { city: 'Los Angeles', country: 'USA', percentage: 16 },
      { city: 'London', country: 'UK', percentage: 14 },
      { city: 'Toronto', country: 'Canada', percentage: 12 },
      { city: 'Sydney', country: 'Australia', percentage: 10 },
    ],
  },
  '90d': {
    metrics: {
      impressions: 3800000,
      engagementRate: 4.9,
      reach: 1850000,
      shares: 14500,
      followers: 18500,
      growthRate: 25.3,
      posts: 520,
    },
    engagement: Array.from({ length: 13 }, (_, i) => ({
      date: new Date(2024, 0, (i * 7) + 1).toISOString().split('T')[0],
      value: 4 + Math.random() * 2,
    })),
    followerGrowth: Array.from({ length: 13 }, (_, i) => ({
      date: new Date(2024, 0, (i * 7) + 1).toISOString().split('T')[0],
      value: 10000 + (i * 750) + Math.random() * 200,
    })),
    topLocations: [
      { city: 'New York', country: 'USA', percentage: 20 },
      { city: 'Los Angeles', country: 'USA', percentage: 15 },
      { city: 'London', country: 'UK', percentage: 13 },
      { city: 'Toronto', country: 'Canada', percentage: 11 },
      { city: 'Sydney', country: 'Australia', percentage: 9 },
      { city: 'Paris', country: 'France', percentage: 8 },
    ],
  },
  '1y': {
    metrics: {
      impressions: 15200000,
      engagementRate: 4.5,
      reach: 7500000,
      shares: 58000,
      followers: 25000,
      growthRate: 85.2,
      posts: 2100,
    },
    engagement: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2024, i, 1).toISOString().split('T')[0],
      value: 3.5 + Math.random() * 2.5,
    })),
    followerGrowth: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2024, i, 1).toISOString().split('T')[0],
      value: 8000 + (i * 1500) + Math.random() * 300,
    })),
    topLocations: [
      { city: 'New York', country: 'USA', percentage: 18 },
      { city: 'Los Angeles', country: 'USA', percentage: 14 },
      { city: 'London', country: 'UK', percentage: 12 },
      { city: 'Toronto', country: 'Canada', percentage: 10 },
      { city: 'Sydney', country: 'Australia', percentage: 8 },
      { city: 'Paris', country: 'France', percentage: 7 },
      { city: 'Tokyo', country: 'Japan', percentage: 6 },
    ],
  },
};

export default function AnalyticsScreen() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [tempSelectedItems, setTempSelectedItems] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const scrollY = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 48;
  const [currentData, setCurrentData] = useState<AnalyticsDataset>(MOCK_ANALYTICS_DATA['7d']);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation<NativeStackNavigationProp<AnalyticsStackParamList>>();

  // Combine groups and accounts into a single list
  const allItems: SelectableItem[] = [
    { id: 'all', name: 'All Accounts', type: 'group' },
    ...MOCK_GROUPS.map(group => ({ ...group, type: 'group' as const })),
    ...MOCK_ACCOUNTS.map(account => ({ ...account, type: 'account' as const })),
  ];

  useEffect(() => {
    if (isDropdownOpen) {
      const handleBackPress = () => {
        setIsDropdownOpen(false);
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackPress
      );

      return () => subscription.remove();
    }
  }, [isDropdownOpen]);

  const handleApplySelections = () => {
    setSelectedItems(tempSelectedItems);
    setIsDropdownOpen(false);
  };

  const handleCancelSelections = () => {
    setIsDropdownOpen(false);
    setTempSelectedItems(selectedItems);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Analytics</Text>
    </View>
  );

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
        <TouchableOpacity
          key={range}
          style={[
            styles.timeRangeButton,
            timeRange === range && styles.timeRangeButtonActive,
          ]}
          onPress={() => setTimeRange(range)}
        >
          <Text
            style={[
              styles.timeRangeText,
              timeRange === range && styles.timeRangeTextActive,
            ]}
          >
            {range}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          isDropdownOpen && styles.filterButtonActive,
        ]}
        onPress={() => {
          setIsDropdownOpen(!isDropdownOpen);
          setTempSelectedItems(selectedItems);
        }}
      >
        <Text style={styles.filterButtonText}>
          {selectedItems.length === 0 || selectedItems.includes('all') ? 'All Accounts' :
           `${selectedItems.length} Selected`}
        </Text>
        <Ionicons 
          name="chevron-down" 
          size={20} 
          color={isDropdownOpen ? '#007AFF' : '#8E8E93'} 
        />
      </TouchableOpacity>

      {isDropdownOpen && (
        <>
          <TouchableWithoutFeedback onPress={handleCancelSelections}>
            <View style={styles.dropdownOverlay} />
          </TouchableWithoutFeedback>

          <View style={styles.selectorPopup}>
            <View style={styles.selectorHeader}>
              <Text style={styles.selectorTitle}>Select Accounts</Text>
              <TouchableOpacity 
                style={styles.selectAllButton}
                onPress={() => {
                  setTempSelectedItems(
                    tempSelectedItems.includes('all') ? [] : ['all']
                  );
                }}
              >
                <Text style={styles.selectAllText}>
                  {tempSelectedItems.includes('all') ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.selectorList}>
              {allItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.selectorItem,
                    tempSelectedItems.includes(item.id) && styles.selectorItemActive,
                  ]}
                  onPress={() => {
                    if (item.id === 'all') {
                      setTempSelectedItems(
                        tempSelectedItems.includes('all') ? [] : ['all']
                      );
                    } else {
                      setTempSelectedItems(prev => {
                        const newSelection = prev.filter(id => id !== 'all');
                        return newSelection.includes(item.id)
                          ? newSelection.filter(id => id !== item.id)
                          : [...newSelection, item.id];
                      });
                    }
                  }}
                >
                  <View style={styles.accountItem}>
                    {item.type === 'account' && item.platform && (
                      <Ionicons 
                        name={`logo-${item.platform}`} 
                        size={20} 
                        color="#8E8E93" 
                      />
                    )}
                    {item.type === 'group' && item.id !== 'all' && (
                      <Ionicons 
                        name="folder-outline" 
                        size={20} 
                        color="#8E8E93" 
                      />
                    )}
                    <Text style={[
                      styles.selectorItemText,
                      item.id === 'all' && styles.selectorItemTextBold,
                    ]}>
                      {item.name}
                    </Text>
                  </View>
                  {tempSelectedItems.includes(item.id) && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.selectorActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancelSelections}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton} 
                onPress={handleApplySelections}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );

  const renderMetricCard = (
    label: string,
    value: string | number,
    trend: number | null,
    icon: keyof typeof Ionicons.glyphMap,
    color: string
  ) => (
    <View style={styles.metricCardContainer}>
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
          <Text style={styles.metricLabel}>{label}</Text>
      </View>
      <View style={styles.metricContent}>
          <Text style={styles.metricValue}>{value}</Text>
          {trend !== null && (
          <View style={[
            styles.trendBadge,
              { backgroundColor: trend > 0 ? '#E8FAF0' : '#FFF1F0' }
            ]}>
              <Ionicons
                name={trend > 0 ? 'trending-up' : 'trending-down'}
                size={12}
                color={trend > 0 ? '#2DA160' : '#E11D48'}
                style={styles.trendIcon}
              />
            <Text style={[
              styles.trendText,
                { color: trend > 0 ? '#2DA160' : '#E11D48' }
            ]}>
                {trend > 0 ? '+' : ''}{trend}%
            </Text>
          </View>
        )}
        </View>
      </View>
    </View>
  );

  // Mock API fetch function - can be replaced with real API call later
  const fetchAnalyticsData = async (timeRange: TimeRange) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_ANALYTICS_DATA[timeRange];
  };

  const handleTimeRangeChange = async (newRange: TimeRange) => {
    // Fade out current data
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(async () => {
      // Fetch new data
      const newData = await fetchAnalyticsData(newRange);
      setCurrentData(newData);
      setTimeRange(newRange);

      // Fade in new data
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getChartLabels = (timeRange: TimeRange): string[] => {
    switch (timeRange) {
      case '7d':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case '30d':
        return currentData.engagement.map((_, i) => 
          i % 3 === 0 ? new Date(2024, 2, i + 1).getDate().toString() : ''
        );
      case '90d':
        return currentData.engagement.map(item => 
          new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        );
      case '1y':
        return currentData.engagement.map(item => 
          new Date(item.date).toLocaleDateString('en-US', { month: 'short' })
        );
      default:
        return [];
    }
  };

  const renderCharts = () => (
    <Animated.View style={[styles.chartContainer, { opacity: fadeAnim }]}>
      <TouchableOpacity 
        style={styles.chartCard}
        onPress={() => navigation.navigate('ChartDetail', {
          title: 'Engagement Over Time',
          data: {
            labels: getChartLabels(timeRange),
            datasets: [{
              data: currentData.engagement.map(item => item.value),
            }]
          },
          color: '0, 122, 255',
          yAxisLabel: '',
          summary: {
            average: currentData.engagement.reduce((a, b) => a + b.value, 0) / currentData.engagement.length,
            peak: Math.max(...currentData.engagement.map(item => item.value)),
            total: currentData.engagement.reduce((a, b) => a + b.value, 0)
          }
        })}
      >
        <Text style={styles.chartTitle}>Engagement Over Time</Text>
        <LineChart
          data={{
            labels: getChartLabels(timeRange),
            datasets: [{
              data: currentData.engagement.map(item => item.value),
            }]
          }}
          width={chartWidth}
          height={180}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            style: { borderRadius: 16 },
            propsForLabels: { fontSize: 12 },
          }}
          bezier
          style={styles.chart}
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.chartCard}
        onPress={() => navigation.navigate('ChartDetail', {
          title: 'Follower Growth',
          data: {
            labels: getChartLabels(timeRange),
            datasets: [{
              data: currentData.followerGrowth.map(item => item.value),
            }]
          },
          color: '52, 199, 89',
          yAxisLabel: '',
          summary: {
            average: currentData.followerGrowth.reduce((a, b) => a + b.value, 0) / currentData.followerGrowth.length,
            peak: Math.max(...currentData.followerGrowth.map(item => item.value)),
            total: currentData.followerGrowth.reduce((a, b) => a + b.value, 0)
          }
        })}
      >
        <Text style={styles.chartTitle}>Follower Growth</Text>
        <LineChart
          data={{
            labels: getChartLabels(timeRange),
            datasets: [{
              data: currentData.followerGrowth.map(item => item.value),
            }]
          }}
          width={chartWidth}
          height={180}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
            style: { borderRadius: 16 },
            propsForLabels: { fontSize: 12 },
          }}
          bezier
          style={styles.chart}
        />
        </TouchableOpacity>
    </Animated.View>
  );

  const renderMetrics = () => (
    <Animated.View style={[styles.metricsGrid, { opacity: fadeAnim }]}>
      {renderMetricCard(
        'Impressions',
        formatNumber(currentData.metrics.impressions),
        currentData.metrics.impressions > 0 ? 8.2 : null,
        'eye-outline',
        '#007AFF'
      )}
      {renderMetricCard(
        'Engagement Rate',
        `${currentData.metrics.engagementRate}%`,
        currentData.metrics.engagementRate > 0 ? 12.5 : null,
        'heart-outline',
        '#FF2D55'
      )}
      {renderMetricCard(
        'Reach',
        formatNumber(currentData.metrics.reach),
        currentData.metrics.reach > 0 ? 5.8 : null,
        'people-outline',
        '#34C759'
      )}
      {renderMetricCard(
        'Shares',
        formatNumber(currentData.metrics.shares),
        currentData.metrics.shares > 0 ? 15.3 : null,
        'share-outline',
        '#5856D6'
      )}
    </Animated.View>
  );

  const renderAudienceMetrics = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={styles.metricsGrid}>
        {renderMetricCard(
          'Followers',
          formatNumber(currentData.metrics.followers),
          currentData.metrics.followers > 0 ? 6.2 : null,
          'people-outline',
          '#007AFF'
        )}
        {renderMetricCard(
          'Growth Rate',
          `${currentData.metrics.growthRate}%`,
          currentData.metrics.growthRate > 0 ? 15.8 : null,
          'trending-up',
          '#34C759'
        )}
      </View>
      
      <View style={styles.locationCard}>
        <View style={styles.locationHeader}>
          <Text style={styles.locationTitle}>Top Locations</Text>
        </View>
        {currentData.topLocations.map((location, index) => (
          <View key={index} style={[
            styles.locationItem,
            index === currentData.topLocations.length - 1 && styles.locationItemLast,
          ]}>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{location.city}</Text>
              <Text style={styles.locationCountry}>{location.country}</Text>
            </View>
            <Text style={styles.locationPercentage}>{location.percentage}%</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {renderTimeRangeSelector()}
          {renderFilters()}
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            {renderCharts()}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Post Performance</Text>
            {renderMetrics()}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Audience</Text>
            {renderAudienceMetrics()}
          </View>

          <Text style={styles.dataSource}>Powered by Analytics API</Text>
      </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
  },
  timeRangeButtonActive: {
    backgroundColor: '#007AFF',
  },
  timeRangeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  },
  timeRangeTextActive: {
    color: '#fff',
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    zIndex: 2,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    borderColor: '#007AFF',
    borderWidth: 1,
    backgroundColor: '#F5F9FF',
  },
  filterButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 2,
  },
  selectorPopup: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 3,
    maxHeight: 400,
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  selectorTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  selectAllButton: {
    padding: 8,
  },
  selectAllText: {
    fontSize: 15,
    color: '#007AFF',
  },
  selectorList: {
    maxHeight: 300,
  },
  selectorActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#8E8E93',
  },
  applyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  chartContainer: {
    gap: 16,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
    marginLeft: -16,
    marginRight: -16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -8,
  },
  metricCardContainer: {
    width: '50%',
    padding: 8,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    flex: 1,
  },
  metricContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  trendIcon: {
    marginRight: 2,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  locationTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  locationItemLast: {
    borderBottomWidth: 0,
  },
  locationName: {
    fontSize: 15,
    color: '#000',
  },
  locationPercentage: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  dataSource: {
    textAlign: 'center',
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 24,
    marginBottom: 8,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  selectorItemActive: {
    backgroundColor: '#F2F2F7',
  },
  selectorItemText: {
    fontSize: 15,
    color: '#000',
    marginLeft: 8,
  },
  selectorItemTextBold: {
    fontWeight: '600',
  },
  locationInfo: {
    flex: 1,
  },
  locationCountry: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
}); 