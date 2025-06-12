import React from 'react';
import {
  Animated,
  RefreshControl,
  ScrollViewProps,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { HEADER_TOTAL_HEIGHT } from '@/components/AnimatedHeader';

type ContentScrollViewProps = ScrollViewProps & {
  scrollY?: Animated.Value;
  onRefresh?: () => void;
  refreshing?: boolean;
  contentPadding?: {
    horizontal?: number;
    bottom?: number;
  };
  style?: ViewStyle;
};

export default function ContentScrollView({
  children,
  scrollY,
  onRefresh,
  refreshing = false,
  contentPadding,
  style,
  ...scrollViewProps
}: ContentScrollViewProps) {
  const { colors, spacing } = useThemeStyles();

  const defaultPadding = {
    horizontal: spacing.lg, // Using spacing.lg (16px) as our standard content padding
    bottom: 100, // Default bottom padding for tab bar
  };

  const finalPadding = {
    horizontal: contentPadding?.horizontal ?? defaultPadding.horizontal,
    bottom: contentPadding?.bottom ?? defaultPadding.bottom,
  };

  return (
    <Animated.ScrollView
      style={[
        styles.scrollView,
        { backgroundColor: colors.background },
        style,
      ]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: HEADER_TOTAL_HEIGHT,
          paddingHorizontal: finalPadding.horizontal,
          paddingBottom: finalPadding.bottom,
        },
        scrollViewProps.contentContainerStyle,
      ]}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={true}
      overScrollMode="never"
      onScroll={
        scrollY
          ? Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )
          : undefined
      }
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.text}
            progressViewOffset={HEADER_TOTAL_HEIGHT}
          />
        ) : undefined
      }
      {...scrollViewProps}
    >
      {children}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    flexGrow: 1,
  },
}); 