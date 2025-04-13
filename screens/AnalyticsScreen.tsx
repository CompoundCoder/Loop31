import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type ViewMode = 'all' | 'account' | 'group';
type TimeRange = '7d' | '30d' | '90d' | '1y';

interface AnalyticsData {
  impressions: number;
  engagement: number;
  followers: number;
  posts: number;
  growth: number;
}

const MOCK_DATA: AnalyticsData = {
  impressions: 28900,
  engagement: 8.5,
  followers: 12500,
  posts: 45,
  growth: 12.3,
};

function MetricCard({ title, value, icon, trend = null }: { 
  title: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  trend?: { value: string; positive: boolean } | null;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Ionicons name={icon} size={20} color="#666" />
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <View style={styles.metricContent}>
        <Text style={styles.metricValue}>{value.toLocaleString()}</Text>
        {trend && (
          <View style={[
            styles.trendBadge,
            { backgroundColor: trend.positive ? '#e6f7ed' : '#ffebee' }
          ]}>
            <Text style={[
              styles.trendText,
              { color: trend.positive ? '#1b873f' : '#cb2431' }
            ]}>
              {trend.value}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function PlatformSelector() {
  const getPlatformIcon = (platform: typeof MOCK_DATA.platforms[number]): keyof typeof Ionicons.glyphMap => {
    switch (platform) {
      case 'twitter':
        return 'logo-twitter';
      case 'linkedin':
        return 'logo-linkedin';
      case 'instagram':
        return 'logo-instagram';
      default:
        return 'share-social';
    }
  };

  return (
    <View style={styles.platformSelector}>
      <TouchableOpacity style={[styles.platformButton, styles.platformButtonActive]}>
        <Ionicons name="stats-chart" size={18} color="#2f95dc" />
        <Text style={styles.platformButtonTextActive}>Overview</Text>
      </TouchableOpacity>
      {MOCK_DATA.platforms.map((platform) => (
        <TouchableOpacity key={platform} style={styles.platformButton}>
          <Ionicons name={getPlatformIcon(platform)} size={18} color="#666" />
          <Text style={styles.platformButtonText}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function PerformanceCard() {
  return (
    <View style={styles.performanceCard}>
      <View style={styles.performanceHeader}>
        <Text style={styles.performanceTitle}>Recent Performance</Text>
        <TouchableOpacity style={styles.periodSelector}>
          <Text style={styles.periodText}>Last 30 days</Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
      </View>
      <View style={styles.performanceContent}>
        <Text style={styles.performanceMetric}>{MOCK_DATA.recentPerformance.improvement}</Text>
        <Text style={styles.performancePeriod}>{MOCK_DATA.recentPerformance.period}</Text>
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const renderMetricCard = (label: string, value: string | number, change?: number) => (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{typeof value === 'number' ? value.toLocaleString() : value}</Text>
      {change !== undefined && (
        <View style={styles.changeIndicator}>
          <Ionicons 
            name={change >= 0 ? 'arrow-up' : 'arrow-down'} 
            size={12} 
            color={change >= 0 ? '#34C759' : '#FF3B30'} 
          />
          <Text style={[styles.changeText, { color: change >= 0 ? '#34C759' : '#FF3B30' }]}>
            {Math.abs(change)}%
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>

      {/* View Mode Selector */}
      <View style={styles.viewSelector}>
        <TouchableOpacity 
          style={[styles.viewOption, viewMode === 'all' && styles.activeViewOption]}
          onPress={() => setViewMode('all')}
        >
          <Text style={[styles.viewOptionText, viewMode === 'all' && styles.activeViewOptionText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.viewOption, viewMode === 'group' && styles.activeViewOption]}
          onPress={() => setViewMode('group')}
        >
          <Text style={[styles.viewOptionText, viewMode === 'group' && styles.activeViewOptionText]}>Groups</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.viewOption, viewMode === 'account' && styles.activeViewOption]}
          onPress={() => setViewMode('account')}
        >
          <Text style={[styles.viewOptionText, viewMode === 'account' && styles.activeViewOptionText]}>Accounts</Text>
        </TouchableOpacity>
      </View>

      {/* Time Range Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeSelector}>
        {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            style={[styles.timeOption, timeRange === range && styles.activeTimeOption]}
            onPress={() => setTimeRange(range)}
          >
            <Text style={[styles.timeOptionText, timeRange === range && styles.activeTimeOptionText]}>
              {range === '1y' ? 'Year' : `${range.replace('d', ' Days')}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Metrics Grid */}
      <ScrollView style={styles.content}>
        <View style={styles.metricsGrid}>
          {renderMetricCard('Impressions', MOCK_DATA.impressions, 8.2)}
          {renderMetricCard('Engagement', `${MOCK_DATA.engagement}%`, -2.1)}
          {renderMetricCard('Followers', MOCK_DATA.followers, 5.4)}
          {renderMetricCard('Posts', MOCK_DATA.posts, 12.3)}
          {renderMetricCard('Growth', `${MOCK_DATA.growth}%`, MOCK_DATA.growth)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  viewOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeViewOption: {
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
  },
  viewOptionText: {
    fontSize: 15,
    color: '#666',
  },
  activeViewOptionText: {
    color: '#333',
    fontWeight: '600',
  },
  timeSelector: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: '#f2f2f7',
  },
  activeTimeOption: {
    backgroundColor: '#007AFF',
  },
  timeOptionText: {
    fontSize: 14,
    color: '#666',
  },
  activeTimeOptionText: {
    color: '#fff',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  metricsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    marginLeft: 2,
  },
  platformSelector: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  platformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  platformButtonActive: {
    backgroundColor: '#e8f3ff',
  },
  platformButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  platformButtonTextActive: {
    marginLeft: 6,
    fontSize: 14,
    color: '#2f95dc',
  },
  performanceCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  performanceContent: {
    alignItems: 'center',
  },
  performanceMetric: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1b873f',
    marginBottom: 4,
  },
  performancePeriod: {
    fontSize: 14,
    color: '#666',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  metricContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 