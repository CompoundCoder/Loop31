import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useThemeStyles } from '@/hooks/useThemeStyles';

type ScreenContainerProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export default function ScreenContainer({
  children,
  style,
}: ScreenContainerProps) {
  const { colors } = useThemeStyles();

  // Exclude bottom edge since we have a tab bar
  const edges: Edge[] = ['top', 'left', 'right'];

  return (
    <SafeAreaView 
      style={[
        styles.container,
        { backgroundColor: colors.background },
        style,
      ]}
      edges={edges}
    >
      {/* Persistent background layer */}
      <View style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: colors.background }
      ]} />
      
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
}); 