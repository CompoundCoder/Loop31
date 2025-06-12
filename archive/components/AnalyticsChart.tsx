import { View } from 'react-native';
import React from 'react';

type DataPoint = {
  week: string;
  posts: number;
};

type AnalyticsChartProps = {
  data: DataPoint[];
  height?: number;
  color?: string;
};

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ 
  data,
  height = 200,
  color = '#ddd'
}) => {
  return (
    <View
      style={{
        height,
        backgroundColor: color,
        borderRadius: 8,
        marginVertical: 16,
      }}
    />
  );
};

export default AnalyticsChart; 