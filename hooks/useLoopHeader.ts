import { useState, useCallback } from 'react';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

interface UseLoopHeaderReturn {
  scrollY: SharedValue<number>;
  showHeaderShadow: boolean;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  handleLayout: (event: LayoutChangeEvent) => void;
  headerHeight: number;
}

export const useLoopHeader = (): UseLoopHeaderReturn => {
  const scrollY = useSharedValue(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [showHeaderShadow, setShowHeaderShadow] = useState(false);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      scrollY.value = offsetY;
      setShowHeaderShadow(offsetY >= 8);
    },
    [scrollY]
  );

  return {
    scrollY,
    showHeaderShadow,
    handleScroll,
    handleLayout,
    headerHeight,
  };
}; 