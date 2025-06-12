import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export interface LoadingIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ size = 'large', color }) => {
  const { colors } = useThemeStyles();
  const indicatorColor = color || colors.primary;

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={indicatorColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingIndicator; 