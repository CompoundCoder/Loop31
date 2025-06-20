import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AnimatedHeader from '../components/AnimatedHeader';
import { useThemeStyles } from '../hooks/useThemeStyles';
import Reanimated from 'react-native-reanimated';

export default function TestHeaderScreen() {
  const { colors, spacing } = useThemeStyles();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AnimatedHeader title="Test Header" scrollY={new Reanimated.Value(0)} />
      <View style={styles.headerPlaceholder} />
      <View style={styles.content}>
        <Text>Scrollable Content</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerPlaceholder: {
    height: 100,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
