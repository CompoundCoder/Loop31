import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import type { ExtendedTheme } from '@/app/_layout';

type Metric = {
  title: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue?: string;
};

type MetricCardProps = {
  metrics: Metric[];
};

export default function MetricCard({ metrics }: MetricCardProps) {
  const theme = useTheme() as unknown as ExtendedTheme;

  const getTrendColor = (trend: Metric['trend']) => {
    switch (trend) {
      case 'up':
        return '#34C759'; // iOS Success green
      case 'down':
        return '#FF3B30'; // iOS Error red
      default:
        return theme.colors.text;
    }
  };

  const getTrendIcon = (trend: Metric['trend']) => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'trending-neutral';
    }
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: theme.dark ? '#1C1C1E' : '#FFFFFF',
        borderColor: theme.dark ? '#2C2C2E' : '#E0E0E0',
        borderRadius: theme.borderRadius.md || 12,
        ...Platform.select({
          ios: {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
          },
          android: {
            elevation: 2,
          },
        }),
      }
    ]}>
      {metrics.map((metric, index) => (
        <View key={metric.title} style={[
          styles.metricRow,
          index < metrics.length - 1 && {
            borderBottomWidth: 1,
            borderBottomColor: theme.dark ? '#2C2C2E' : '#E0E0E0',
            paddingBottom: 20,
            marginBottom: 20,
          }
        ]}>
          <View style={styles.metricIcon}>
            <MaterialCommunityIcons
              name={metric.icon}
              size={24}
              color={metric.iconColor}
              style={{ opacity: 0.8 }}
            />
          </View>
          <View style={styles.metricContent}>
            <Text style={[
              styles.metricTitle,
              {
                color: theme.colors.text,
                opacity: 0.6,
              }
            ]}>
              {metric.title}
            </Text>
            <Text style={[
              styles.metricValue,
              { color: theme.colors.text }
            ]}>
              {metric.value}
            </Text>
          </View>
          <View style={styles.trendContainer}>
            <MaterialCommunityIcons
              name={getTrendIcon(metric.trend)}
              size={20}
              color={getTrendColor(metric.trend)}
              style={{ opacity: 0.9 }}
            />
            {metric.trendValue && (
              <Text style={[
                styles.trendValue,
                { color: getTrendColor(metric.trend) }
              ]}>
                {metric.trendValue}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    padding: 20,
    width: '100%',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    marginRight: 16,
  },
  metricContent: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
}); 