import React from 'react';
import { StyleSheet, Text, Animated, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '@react-navigation/native';
import type { ExtendedTheme } from '../app/_layout';
import { useFadeIn } from '@/hooks/useFadeIn';

type SectionTitleProps = {
  /**
   * The title text to display
   */
  title: string;
  /**
   * Optional subtitle text
   */
  subtitle?: string;
  /**
   * Whether to add extra top margin (default: true)
   */
  withTopMargin?: boolean;
  /**
   * Optional container style overrides
   */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Optional title style overrides
   */
  titleStyle?: StyleProp<TextStyle>;
  /**
   * Optional subtitle style overrides
   */
  subtitleStyle?: StyleProp<TextStyle>;
  /**
   * Optional background color override
   */
  backgroundColor?: string;
  /**
   * Optional border radius override
   */
  borderRadius?: number;
  /**
   * Optional opacity for the entire section
   */
  opacity?: number;
};

export default function SectionTitle({ 
  title, 
  subtitle,
  withTopMargin = true,
  containerStyle,
  titleStyle,
  subtitleStyle,
  backgroundColor,
  borderRadius,
  opacity = 1,
}: SectionTitleProps) {
  const theme = useTheme() as unknown as ExtendedTheme;
  const { opacityStyle } = useFadeIn();

  return (
    <Animated.View style={[
      styles.container,
      { 
        marginBottom: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        marginTop: withTopMargin ? theme.spacing.lg : 0,
        backgroundColor: backgroundColor || 'transparent',
        borderRadius: borderRadius || 0,
        opacity,
      },
      containerStyle,
      opacityStyle,
    ]}>
      <Text style={[
        styles.title,
        { 
          color: theme.colors.text,
          fontSize: 20,
          fontWeight: 'bold',
        },
        titleStyle,
      ]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[
          styles.subtitle,
          { 
            color: theme.colors.text,
            fontSize: 14,
            opacity: theme.opacity.medium,
            marginTop: theme.spacing.xs,
          },
          subtitleStyle,
        ]}>
          {subtitle}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  title: {
    textAlign: 'left',
  },
  subtitle: {
    textAlign: 'left',
  },
}); 