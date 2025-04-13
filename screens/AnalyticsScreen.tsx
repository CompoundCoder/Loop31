import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type TimeRange = '7d' | '30d' | '90d' | '1y';
type SelectionType = 'all' | 'group' | 'account';

// Temporary mock data until AccountProvider is set up
const MOCK_ACCOUNTS = [
  { id: '1', name: 'Nike Instagram', type: 'instagram' },
  { id: '2', name: 'Nike Twitter', type: 'twitter' },
  { id: '3', name: 'Adidas Instagram', type: 'instagram' },
  { id: '4', name: 'Adidas Twitter', type: 'twitter' },
];

const MOCK_GROUPS = [
  { id: 'g1', name: 'Nike', accounts: ['1', '2'] },
  { id: 'g2', name: 'Adidas', accounts: ['3', '4'] },
];

export default function AnalyticsScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectionType, setSelectionType] = useState<SelectionType>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const renderMetricCard = (label: string, value: string | number, previousValue: number, icon: keyof typeof Ionicons.glyphMap) => {
    const percentChange = previousValue ? ((Number(value) - previousValue) / previousValue) * 100 : 0;
    
    return (
      <View style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <Ionicons name={icon} size={20} color="#666" />
          <Text style={styles.metricTitle}>{label}</Text>
        </View>
        <View style={styles.metricContent}>
          <Text style={styles.metricValue}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Text>
          {percentChange !== 0 && (
            <View style={[
              styles.trendBadge,
              { backgroundColor: percentChange > 0 ? '#e6f7ed' : '#ffebee' }
            ]}>
              <Text style={[
                styles.trendText,
                { color: percentChange > 0 ? '#1b873f' : '#cb2431' }
              ]}>
                {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderSelectionItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.selectionOption,
        selectedId === item.id && styles.activeSelectionOption
      ]}
      onPress={() => setSelectedId(item.id)}
    >
      <Text style={[
        styles.selectionText,
        selectedId === item.id && styles.activeSelectionText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const getSelectionData = () => {
    switch (selectionType) {
      case 'group':
        return MOCK_GROUPS;
      case 'account':
        return MOCK_ACCOUNTS;
      default:
        return [];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>

      {/* Selection Type */}
      <View style={styles.viewSelector}>
        <TouchableOpacity 
          style={[styles.viewOption, selectionType === 'all' && styles.activeViewOption]}
          onPress={() => {
            setSelectionType('all');
            setSelectedId(null);
          }}
        >
          <Text style={[styles.viewOptionText, selectionType === 'all' && styles.activeViewOptionText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.viewOption, selectionType === 'group' && styles.activeViewOption]}
          onPress={() => setSelectionType('group')}
        >
          <Text style={[styles.viewOptionText, selectionType === 'group' && styles.activeViewOptionText]}>
            Groups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.viewOption, selectionType === 'account' && styles.activeViewOption]}
          onPress={() => setSelectionType('account')}
        >
          <Text style={[styles.viewOptionText, selectionType === 'account' && styles.activeViewOptionText]}>
            Accounts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selection List */}
      {selectionType !== 'all' && (
        <FlatList
          data={getSelectionData()}
          renderItem={renderSelectionItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.selectionList}
          contentContainerStyle={styles.selectionContent}
          keyExtractor={(item) => item.id}
        />
      )}

      {/* Time Range Selector */}
      <View style={styles.timeSelector}>
        {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
          <TouchableOpacity
            key={range}
            style={[styles.timeOption, timeRange === range && styles.activeTimeOption]}
            onPress={() => setTimeRange(range)}
          >
            <Text style={[styles.timeOptionText, timeRange === range && styles.activeTimeOptionText]}>
              {range === '7d' ? '7D' : 
               range === '30d' ? '30D' : 
               range === '90d' ? '90D' : 
               '1Y'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Metrics Grid */}
      <ScrollView style={styles.content}>
        <View style={styles.metricsGrid}>
          {renderMetricCard('Total Reach', 145200, 132000, 'eye-outline')}
          {renderMetricCard('Impressions', 289000, 265000, 'bar-chart-outline')}
          {renderMetricCard('Engagement Rate', '4.8%', 4.2, 'heart-outline')}
          {renderMetricCard('Followers', 12500, 11800, 'people-outline')}
          {renderMetricCard('Total Posts', 45, 42, 'document-text-outline')}
          {renderMetricCard('Avg. Interactions', 256, 234, 'chatbubble-outline')}
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
  selectionList: {
    backgroundColor: '#fff',
    maxHeight: 48,
  },
  selectionContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectionOption: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f2f2f7',
  },
  activeSelectionOption: {
    backgroundColor: '#007AFF',
  },
  selectionText: {
    fontSize: 13,
    color: '#666',
  },
  activeSelectionText: {
    color: '#fff',
    fontWeight: '500',
  },
  timeSelector: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeOption: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f2f2f7',
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTimeOption: {
    backgroundColor: '#007AFF',
  },
  timeOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  activeTimeOptionText: {
    color: '#fff',
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
    shadowRadius: 4,
    elevation: 3,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  trendBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 