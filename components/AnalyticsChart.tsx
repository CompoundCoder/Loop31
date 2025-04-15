import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';

interface AnalyticsChartProps {
  data: {
    labels: string[];
    datasets: { data: number[] }[];
  };
  color: string;
  yAxisLabel?: string;
  height?: number;
  width?: number;
  type?: 'line' | 'bar';
}

export default function AnalyticsChart({
  data,
  color,
  yAxisLabel = '',
  height = 180,
  width = Dimensions.get('window').width - 48,
  type = 'line',
}: AnalyticsChartProps) {
  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(${color}, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 12,
    },
    propsForVerticalLabels: {
      fontSize: 12,
    },
    propsForHorizontalLabels: {
      fontSize: 12,
    },
  };

  const ChartComponent = type === 'line' ? LineChart : BarChart;

  return (
    <View style={styles.container}>
      <ChartComponent
        data={data}
        width={width}
        height={height}
        chartConfig={chartConfig}
        bezier={type === 'line'}
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
        withDots={type === 'line'}
        withShadow={false}
        yAxisLabel={yAxisLabel}
        yAxisInterval={5}
        fromZero
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  chart: {
    marginLeft: -8,
  },
}); 