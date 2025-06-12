import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, Easing } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import type { ExtendedTheme } from '@/app/_layout';
import { ANIMATION } from '@/constants/animation';

type TimeOfDay = 'early-morning' | 'morning' | 'afternoon' | 'evening' | 'night';
type DayType = 'weekday' | 'weekend';

// Types for special messages framework
type SpecialMessageType = 'milestone' | 'achievement' | 'celebration' | 'birthday';

interface SpecialMessage {
  type: SpecialMessageType;
  message: string;
  emoji: string;
  priority: number; // Higher number = higher priority
}

interface WelcomeMessageProps {
  /**
   * Optional override for the current time (useful for testing)
   */
  currentDate?: Date;
  /**
   * Optional special message to display instead of time-based greeting
   */
  specialMessage?: SpecialMessage;
}

// Mock special messages (will be replaced with real data later)
const MOCK_SPECIAL_MESSAGES: SpecialMessage[] = [
  {
    type: 'milestone',
    message: 'Congrats on your first 10 posts!',
    emoji: '🎉',
    priority: 2,
  },
  {
    type: 'achievement',
    message: 'You\'re on a 7-day streak!',
    emoji: '🔥',
    priority: 1,
  },
];

const getTimeOfDay = (date: Date): TimeOfDay => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 8) return 'early-morning';
  if (hour >= 8 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
};

const getDayType = (date: Date): DayType => {
  const day = date.getDay();
  return day === 0 || day === 6 ? 'weekend' : 'weekday';
};

const getGreeting = (date: Date): string => {
  const timeOfDay = getTimeOfDay(date);
  const dayType = getDayType(date);
  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);

  // Time-specific greetings
  if (timeOfDay === 'early-morning') {
    return 'Rise and shine! ☀️';
  }

  // Day-specific greetings
  switch (dayName.toLowerCase()) {
    case 'monday':
      return 'New week, new goals! 🚀';
    case 'friday':
      return timeOfDay === 'afternoon' 
        ? 'You made it! Time to wrap up strong! 🎯'
        : 'Happy Friday! Let\'s make it count! 💪';
    default:
      if (dayType === 'weekend') {
        return 'Relax and create something awesome today. ✨';
      }
      // Default weekday greetings by time
      switch (timeOfDay) {
        case 'morning':
          return 'Good morning! Ready to create? 🎨';
        case 'afternoon':
          return 'Afternoon inspiration coming your way! 💫';
        case 'evening':
          return 'Evening creativity flows! 🌙';
        case 'night':
          return 'Night owl mode activated! 🦉';
        default:
          return 'Welcome back! 👋';
      }
  }
};

/**
 * Gets the highest priority special message from a list of messages
 * Returns undefined if no special messages are active
 */
const getActiveSpecialMessage = (messages: SpecialMessage[] = []): SpecialMessage | undefined => {
  if (!messages.length) return undefined;
  
  // Sort by priority (highest first) and return the first message
  return [...messages].sort((a, b) => b.priority - a.priority)[0];
};

/**
 * Gets the message to display, prioritizing special messages over regular greetings
 */
const getMessage = (date: Date, specialMessage?: SpecialMessage): string => {
  // If a special message is provided directly via props, use it
  if (specialMessage) {
    return `${specialMessage.emoji} ${specialMessage.message}`;
  }

  // Check for active special messages (mock for now)
  const activeSpecialMessage = getActiveSpecialMessage(MOCK_SPECIAL_MESSAGES);
  if (activeSpecialMessage) {
    return `${activeSpecialMessage.emoji} ${activeSpecialMessage.message}`;
  }

  // Fall back to time-based greeting
  return getGreeting(date);
};

/**
 * Creates a combined fade-in and pulse animation sequence
 */
const useWelcomeAnimation = () => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start all animations immediately in parallel
    Animated.parallel([
      // Fade in
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION.WELCOME_DURATION,
        easing: ANIMATION.WELCOME_EASING,
        useNativeDriver: true,
      }),
      // Pulse sequence
      Animated.sequence([
        // Scale up and fade slightly
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.05,
            duration: ANIMATION.WELCOME_DURATION * 0.75,
            easing: ANIMATION.WELCOME_EASING,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.9,
            duration: ANIMATION.WELCOME_DURATION * 0.75,
            easing: ANIMATION.WELCOME_EASING,
            useNativeDriver: true,
          }),
        ]),
        // Scale down and restore opacity
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: ANIMATION.WELCOME_DURATION * 0.75,
            easing: ANIMATION.WELCOME_EASING,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 1,
            duration: ANIMATION.WELCOME_DURATION * 0.75,
            easing: ANIMATION.WELCOME_EASING,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    return () => {
      // Reset values on unmount
      opacity.setValue(0);
      scale.setValue(1);
      pulseOpacity.setValue(1);
    };
  }, [opacity, scale, pulseOpacity]);

  return {
    opacity,
    scale,
    pulseOpacity,
  };
};

export default function WelcomeMessage({ 
  currentDate = new Date(),
  specialMessage,
}: WelcomeMessageProps) {
  const theme = useTheme() as unknown as ExtendedTheme;
  const { spacing } = useThemeStyles();
  
  // --- Add visibility state --- 
  const [isVisible, setIsVisible] = useState(true);
  
  // Use the combined animation hook
  const { opacity, scale, pulseOpacity } = useWelcomeAnimation();
  
  // --- Add timed fade-out logic --- 
  useEffect(() => {
    const fadeOutTimer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0, // Fade out
        duration: 500, // Fade out duration
        easing: Easing.in(Easing.ease), // Ease in for fade out
        useNativeDriver: true,
      }).start(({ finished }) => {
        // Set invisible only after fade-out completes
        if (finished) {
          setIsVisible(false);
        }
      });
    }, 6000); // 6 seconds delay

    // Cleanup timer on unmount
    return () => clearTimeout(fadeOutTimer);
    
  }, [opacity]); // Dependency on opacity Animated.Value

  const styles = StyleSheet.create({
    container: {
      paddingVertical: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontSize: 22,
      color: theme.colors.text,
      textAlign: 'center',
      fontWeight: '600',
    },
  });

  // --- Conditional Rendering --- 
  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          // Opacity is now controlled by both fade-in and timed fade-out
          opacity: opacity, // Use opacity directly 
          transform: [{ scale }],
        },
      ]}
    >
      {/* Text opacity is implicitly handled by parent opacity */}
      <Text style={styles.text}>
        {getMessage(currentDate, specialMessage)}
      </Text>
    </Animated.View>
  );
} 