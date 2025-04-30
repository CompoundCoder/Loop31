import React from 'react';
import { StyleProp, ViewStyle, ScrollView, SectionList, FlatList, Animated, RefreshControl } from 'react-native';
import { LAYOUT } from '@/constants/layout';
import { MINI_HEADER_HEIGHT } from '@/components/AnimatedHeader';

type ScrollableProps = {
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  scrollY?: Animated.Value;
  onRefresh?: () => void;
  refreshing?: boolean;
};

type BaseScrollViewProps = React.ComponentProps<typeof ScrollView>;
type BaseSectionListProps = React.ComponentProps<typeof SectionList>;
type BaseFlatListProps<T> = React.ComponentProps<FlatList<T>>;

type AnimatedScrollViewProps = Animated.AnimatedProps<BaseScrollViewProps>;
type AnimatedSectionListProps = Animated.AnimatedProps<BaseSectionListProps>;
type AnimatedFlatListProps<T> = Animated.AnimatedProps<BaseFlatListProps<T>>;

type ScrollableComponentProps<T = any> = ScrollableProps & (
  | AnimatedScrollViewProps
  | AnimatedSectionListProps
  | AnimatedFlatListProps<T>
);

export function withScreenContent<P extends ScrollableComponentProps>(
  WrappedComponent: React.ComponentType<P>
) {
  return function ScreenContentContainer(props: P) {
    const styles = {
      container: {
        flex: 1,
      } as const,
      contentContainer: {
        flexGrow: 1,
        paddingHorizontal: 0,
        paddingTop: MINI_HEADER_HEIGHT + 16,
        paddingBottom: 32,
      } as const,
    };

    const combinedProps = {
      ...props,
      style: [styles.container, props.style],
      contentContainerStyle: [styles.contentContainer, props.contentContainerStyle],
      scrollEventThrottle: 16,
      onScroll: props.scrollY
        ? Animated.event(
            [{ nativeEvent: { contentOffset: { y: props.scrollY } } }],
            { useNativeDriver: true }
          )
        : props.onScroll,
      refreshControl: props.onRefresh
        ? <RefreshControl
            refreshing={props.refreshing || false}
            onRefresh={props.onRefresh}
          />
        : undefined,
    } as P;

    return <WrappedComponent {...combinedProps} />;
  };
} 