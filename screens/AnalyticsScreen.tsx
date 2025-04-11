import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Mock data for analytics
const MOCK_ANALYTICS = {
  overview: {
    posts: 147,
    engagement: 2834,
    followers: 12453,
    reach: 45231
  },
  platforms: ['instagram', 'twitter', 'linkedin'] as const,
  recentPerformance: {
    improvement: '+12.5%',
    period: 'vs last 30 days'
  }
};

type IconName = keyof typeof Ionicons.glyphMap;

function MetricCard({ title, value, icon, trend = null }: { 
  title: string;
  value: number | string;
  icon: IconName;
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
  const getPlatformIcon = (platform: typeof MOCK_ANALYTICS.platforms[number]): IconName => {
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
      {MOCK_ANALYTICS.platforms.map((platform) => (
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
        <Text style={styles.performanceMetric}>{MOCK_ANALYTICS.recentPerformance.improvement}</Text>
        <Text style={styles.performancePeriod}>{MOCK_ANALYTICS.recentPerformance.period}</Text>
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  return (
    <ScrollView style={styles.container}>
      <PlatformSelector />
      <PerformanceCard />
      <View style={styles.metricsGrid}>
        <MetricCard
          title="Total Posts"
          value={MOCK_ANALYTICS.overview.posts}
          icon="document-text"
          trend={{ value: '+12%', positive: true }}
        />
        <MetricCard
          title="Engagement"
          value={MOCK_ANALYTICS.overview.engagement}
          icon="heart"
          trend={{ value: '+8.5%', positive: true }}
        />
        <MetricCard
          title="Followers"
          value={MOCK_ANALYTICS.overview.followers}
          icon="people"
          trend={{ value: '+3.2%', positive: true }}
        />
        <MetricCard
          title="Reach"
          value={MOCK_ANALYTICS.overview.reach}
          icon="eye"
          trend={{ value: '-2.1%', positive: false }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  metricCard: {
    width: '50%',
    padding: 8,
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
  metricValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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