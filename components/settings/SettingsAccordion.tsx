import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, LayoutChangeEvent } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import * as typographyPresets from '@/presets/typography';

interface SettingsAccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function SettingsAccordion({ title, children, defaultOpen = false }: SettingsAccordionProps) {
  const { colors, spacing, borderRadius } = useThemeStyles();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [contentHeight, setContentHeight] = useState(0);

  const rotation = useSharedValue(defaultOpen ? 90 : 0);
  const animatedHeight = useSharedValue(defaultOpen ? 1 : 0);

  const toggleAccordion = () => {
    'worklet';
    if (animatedHeight.value === 1) {
      animatedHeight.value = withTiming(0);
      rotation.value = withTiming(0);
      runOnJS(setIsOpen)(false);
    } else {
      runOnJS(setIsOpen)(true);
      animatedHeight.value = withTiming(1);
      rotation.value = withTiming(90);
    }
  };
  
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const contentContainerAnimatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value * contentHeight,
    opacity: animatedHeight.value,
  }));

  const handleContentLayout = (event: LayoutChangeEvent) => {
    setContentHeight(event.nativeEvent.layout.height);
  };
  
  return (
    <Pressable 
        onPress={toggleAccordion}
        style={[
            styles.container,
            {
                backgroundColor: colors.card,
                borderRadius: borderRadius.lg,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                marginBottom: spacing.md,
            }
    ]}>
      <View style={styles.header}>
        <Text style={[typographyPresets.pageHeaderTitle, { color: colors.text, flex: 1, fontSize: 16 }]}>{title}</Text>
        <Animated.View style={iconAnimatedStyle}>
            <Ionicons name="chevron-forward" size={20} color={colors.text} style={{ opacity: 0.6 }} />
        </Animated.View>
      </View>
      
      <Animated.View style={[styles.contentWrapper, contentContainerAnimatedStyle]}>
        <View style={styles.content} onLayout={handleContentLayout}>
          {children}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentWrapper: {
    overflow: 'hidden',
  },
  content: {
    position: 'absolute',
    width: '100%',
    paddingTop: 12,
    paddingBottom: 4,
  },
}); 