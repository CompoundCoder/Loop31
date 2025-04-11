import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { AnalyticsService } from '../../lib/services/analytics';

const analyticsService = new AnalyticsService();

type TimeRange = '7d' | '30d' | '90d';

export default function AnalyticsDashboardScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const platformMetrics = {
    followers: 12453,
    engagement: 3.2,
    reach: 45678,
    impressions: 89012,
  };

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [20, 45, 28, 80, 99, 43, 50],
    }],
  };

  return (
    <ScrollView style={styles.container}>
      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        <TouchableOpacity
          style={[styles.timeRangeButton, timeRange === '7d' && styles.timeRangeActive]}
          onPress={() => setTimeRange('7d')}
        >
          <Text style={[styles.timeRangeText, timeRange === '7d' && styles.timeRangeTextActive]}>
            7 Days
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeRangeButton, timeRange === '30d' && styles.timeRangeActive]}
          onPress={() => setTimeRange('30d')}
        >
          <Text style={[styles.timeRangeText, timeRange === '30d' && styles.timeRangeTextActive]}>
            30 Days
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeRangeButton, timeRange === '90d' && styles.timeRangeActive]}
          onPress={() => setTimeRange('90d')}
        >
          <Text style={[styles.timeRangeText, timeRange === '90d' && styles.timeRangeTextActive]}>
            90 Days
          </Text>
        </TouchableOpacity>
      </View>

      {/* Platform Selector */}
      <ScrollView horizontal style={styles.platformSelector} showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.platformButton, selectedPlatform === 'all' && styles.platformActive]}
          onPress={() => setSelectedPlatform('all')}
        >
          <Text style={[styles.platformText, selectedPlatform === 'all' && styles.platformTextActive]}>
            All Platforms
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.platformButton, selectedPlatform === 'twitter' && styles.platformActive]}
          onPress={() => setSelectedPlatform('twitter')}
        >
          <Ionicons name="logo-twitter" size={18} color={selectedPlatform === 'twitter' ? '#fff' : '#666'} />
          <Text style={[styles.platformText, selectedPlatform === 'twitter' && styles.platformTextActive]}>
            Twitter
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.platformButton, selectedPlatform === 'instagram' && styles.platformActive]}
          onPress={() => setSelectedPlatform('instagram')}
        >
          <Ionicons name="logo-instagram" size={18} color={selectedPlatform === 'instagram' ? '#fff' : '#666'} />
          <Text style={[styles.platformText, selectedPlatform === 'instagram' && styles.platformTextActive]}>
            Instagram
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Metrics Overview */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Followers</Text>
          <Text style={styles.metricValue}>{platformMetrics.followers.toLocaleString()}</Text>
          <Text style={styles.metricChange}>+2.4%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Engagement Rate</Text>
          <Text style={styles.metricValue}>{platformMetrics.engagement}%</Text>
          <Text style={styles.metricChange}>+0.8%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Reach</Text>
          <Text style={styles.metricValue}>{platformMetrics.reach.toLocaleString()}</Text>
          <Text style={styles.metricChange}>+12.5%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Impressions</Text>
          <Text style={styles.metricValue}>{platformMetrics.impressions.toLocaleString()}</Text>
          <Text style={styles.metricChange}>+15.3%</Text>
        </View>
      </View>

      {/* Engagement Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Engagement Over Time</Text>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(47, 149, 220, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Best Performing Posts */}
      <View style={styles.postsContainer}>
        <Text style={styles.sectionTitle}>Best Performing Posts</Text>
        {/* Add post list items here */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  timeRangeActive: {
    backgroundColor: '#2f95dc',
  },
  timeRangeText: {
    fontSize: 14,
    color: '#666',
  },
  timeRangeTextActive: {
    color: '#fff',
  },
  platformSelector: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  platformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f8f9fa',
  },
  platformActive: {
    backgroundColor: '#2f95dc',
  },
  platformText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  platformTextActive: {
    color: '#fff',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  metricCard: {
    width: '50%',
    padding: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  metricChange: {
    fontSize: 14,
    color: '#4caf50',
  },
  chartContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  postsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
}); 