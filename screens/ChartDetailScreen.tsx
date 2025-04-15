import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AnalyticsChart from '../components/AnalyticsChart';

export type ChartDetailScreenParams = {
  title: string;
  data: {
    labels: string[];
    datasets: { data: number[] }[];
  };
  color: string;
  yAxisLabel?: string;
  summary?: {
    average: number;
    peak: number;
    total: number;
  };
};

export default function ChartDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { title, data, color, yAxisLabel, summary } = route.params as ChartDetailScreenParams;
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const toggleChartType = () => {
    setChartType(chartType === 'line' ? 'bar' : 'line');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={toggleChartType} style={styles.chartTypeButton}>
          <Icon 
            name={chartType === 'line' ? 'stats-chart' : 'bar-chart'} 
            size={24} 
            color="#000" 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.chartContainer}>
        <AnalyticsChart
          data={data}
          color={color}
          yAxisLabel={yAxisLabel}
          type={chartType}
          height={Dimensions.get('window').height * 0.5}
          width={Dimensions.get('window').width - 32}
        />
      </View>

      {summary && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Average</Text>
            <Text style={styles.summaryValue}>{summary.average.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Peak</Text>
            <Text style={styles.summaryValue}>{summary.peak.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>{summary.total.toLocaleString()}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  chartTypeButton: {
    padding: 8,
  },
  chartContainer: {
    height: '70%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
  },
}); 