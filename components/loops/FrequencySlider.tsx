import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { type ThemeStyles } from '@/hooks/useThemeStyles';
import { type ScheduleOption } from '@/hooks/useLoopSchedule';
import * as typography from '@/presets/typography';

interface FrequencySliderProps {
  stops: ScheduleOption[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  theme: ThemeStyles;
}

const THUMB_SIZE = 28;
const TRACK_HEIGHT = 4;

export const FrequencySlider: React.FC<FrequencySliderProps> = ({
  stops,
  selectedIndex,
  onIndexChange,
  theme,
}) => {
  const { colors, spacing } = theme;
  const translateX = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const trackWidth = stops.length - 1;
  const stopWidth = 100 / trackWidth;

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
      isDragging.value = true;
    },
    onActive: (event, ctx) => {
      const newX = ctx.startX + event.translationX;
      const maxX = trackWidth * stopWidth;
      translateX.value = Math.max(0, Math.min(newX, maxX));
    },
    onEnd: () => {
      isDragging.value = false;
      const index = Math.round(translateX.value / stopWidth);
      runOnJS(onIndexChange)(index);
      translateX.value = withSpring(index * stopWidth);
    },
  });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const trackStyle = useAnimatedStyle(() => ({
    width: `${translateX.value}%`,
  }));

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={styles.sliderContainer}>
          <View style={[styles.track, { backgroundColor: colors.border }]}>
            <Animated.View
              style={[
                styles.trackFill,
                trackStyle,
                { backgroundColor: colors.accent },
              ]}
            />
          </View>
          <Animated.View
            style={[
              styles.thumb,
              thumbStyle,
              { backgroundColor: colors.accent },
            ]}
          />
        </Animated.View>
      </PanGestureHandler>
      <View style={styles.labelsContainer}>
        {stops.map((stop, index) => (
          <Text
            key={stop.value}
            style={[
              typography.captionSmall,
              {
                color: index === selectedIndex ? colors.accent : colors.text,
                opacity: index === selectedIndex ? 1 : 0.5,
                fontWeight: '500',
              },
            ]}
          >
            {stop.shortLabel || stop.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
  },
  sliderContainer: {
    height: THUMB_SIZE,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_HEIGHT,
    width: '100%',
    borderRadius: TRACK_HEIGHT / 2,
  },
  trackFill: {
    height: '100%',
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    left: -THUMB_SIZE / 2,
    top: (THUMB_SIZE - TRACK_HEIGHT) / 2,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
}); 