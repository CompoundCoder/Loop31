import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStyles } from '../../hooks/useThemeStyles';

type Props = {
  scrollY: import('react-native-reanimated').SharedValue<number>;
  height: number;
  style?: ViewStyle;
};

export default function iOS26HeaderBackground({ scrollY, height, style }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStyles();

  return (
    <View
      style={[
        styles.container,
        {
          height: height + insets.top,
          backgroundColor: colors.background,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
  },
}); 