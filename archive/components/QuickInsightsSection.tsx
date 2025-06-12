import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';
import lightTheme from '@/theme/theme';

export interface QuickInsightsSectionProps {
  growthPercent?: number;
  newLikes?: number;
  newFollowers?: number;
  newComments?: number;
  newDMs?: number;
  bestDay?: string;
}

const ANIMATION_DURATION = 700;
const STAGGER_DELAY = 100;
const SLIDE_DISTANCE = 24;

function formatNumber(n: number) {
  return n.toLocaleString();
}

const QuickInsightsSection: React.FC<QuickInsightsSectionProps> = ({
  growthPercent = 0,
  newLikes = 0,
  newFollowers = 0,
  newComments = 0,
  newDMs = 0,
  bestDay = 'Wednesday',
}) => {
  const { colors, spacing, borderRadius } = useThemeStyles();
  const themeColors = lightTheme.colors;

  // Animation refs
  const growthAnim = useRef(new Animated.Value(0)).current;
  const statAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  // For responsive font size of growth number
  const [growthFontSize, setGrowthFontSize] = useState(32);
  const growthTextRef = useRef(null);

  // Helper to shrink font size if text overflows
  const handleGrowthTextLayout = (e: any) => {
    const { width } = e.nativeEvent.layout;
    if (width > 120 && growthFontSize > 18) {
      setGrowthFontSize(f => Math.max(18, f - 2));
    }
  };

  useEffect(() => {
    Animated.timing(growthAnim, {
      toValue: 1,
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    statAnims.forEach((anim, idx) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        delay: (idx + 1) * STAGGER_DELAY,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  }, []);

  // Growth formatting
  const isGrowthPositive = growthPercent >= 0;
  const growthColor = isGrowthPositive ? (themeColors.success || '#34C759') : (themeColors.error || '#FF3B30');
  const growthPrefix = isGrowthPositive ? '+' : '';
  const growthDisplay = `${growthPrefix}${growthPercent.toFixed(1)}%`;

  // Stat cards data
  const statCards = [
    {
      value: formatNumber(newLikes),
      label: 'New Likes',
      iconName: 'heart-outline' as keyof typeof Ionicons.glyphMap,
      color: '#008AFF',
    },
    {
      value: formatNumber(newComments),
      label: 'Comments',
      iconName: 'chatbubble-ellipses-outline' as keyof typeof Ionicons.glyphMap,
      color: '#000000',
    },
    {
      value: formatNumber(newFollowers),
      label: 'New Followers',
      iconName: 'person-add-outline' as keyof typeof Ionicons.glyphMap,
      color: themeColors.success,
    },
    {
      value: formatNumber(newDMs),
      label: 'DMs',
      iconName: 'mail-unread-outline' as keyof typeof Ionicons.glyphMap,
      color: themeColors.warning,
    },
  ];

  // Social stats mock data
  const socialStats = [
    { platform: 'instagram', icon: 'logo-instagram', percent: 5.3 },
    { platform: 'facebook', icon: 'logo-facebook', percent: 1.2 },
    { platform: 'twitter', icon: 'logo-twitter', percent: -0.8 },
    { platform: 'tiktok', icon: 'logo-tiktok', percent: -2.1 },
  ];

  return (
    <View style={{ marginBottom: spacing.lg }}>
      {/* Centered vertical stack: big number, label, insight */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: borderRadius.lg,
          padding: spacing.xl,
          marginBottom: spacing.lg,
          alignItems: 'center',
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
          width: '100%',
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: '700',
            color: growthColor,
            marginBottom: spacing.xs,
            textAlign: 'center',
            minWidth: 80,
            maxWidth: 120,
          }}
        >
          {growthDisplay}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: colors.text,
            opacity: 0.7,
            fontWeight: '500',
            textAlign: 'center',
            marginBottom: spacing.sm,
          }}
        >
          Growth
        </Text>
        {/* Insight: two lines, centered */}
        <View style={{ alignItems: 'center', marginTop: spacing.xs }}>
          <Text
            style={{
              fontSize: 13,
              color: colors.text,
              opacity: 0.5,
              fontStyle: 'italic',
              fontWeight: '500',
              textAlign: 'center',
            }}
          >
            Your best day this week was
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: colors.text,
              opacity: 0.5,
              fontWeight: '700',
              textAlign: 'center',
              marginTop: 2,
            }}
          >
            {bestDay}
          </Text>
        </View>
      </View>

      {/* Detail Cards Grid */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
        {/* First row: first 2 stats */}
        {statCards.slice(0, 2).map((stat, idx) => (
          <Animated.View
            key={stat.label}
            style={{
              opacity: statAnims[idx],
              transform: [
                {
                  translateY: statAnims[idx].interpolate({
                    inputRange: [0, 1],
                    outputRange: [SLIDE_DISTANCE, 0],
                  }),
                },
              ],
              flex: 1,
              marginRight: idx === 0 ? spacing.md / 2 : 0,
              marginLeft: idx === 1 ? spacing.md / 2 : 0,
            }}
          >
            <View
              style={{
                backgroundColor: (stat.color || colors.accent) + '0D',
                borderRadius: borderRadius.md,
                paddingVertical: spacing.lg,
                alignItems: 'center',
                shadowColor: colors.text,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Ionicons name={stat.iconName} size={22} color={stat.color || colors.accent} style={{ marginBottom: spacing.xs }} />
              <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.xs }}>{stat.value}</Text>
              <Text style={{ fontSize: 13, color: colors.text, opacity: 0.7, fontWeight: '500' }}>{stat.label}</Text>
            </View>
          </Animated.View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {/* Second row: next 2 stats */}
        {statCards.slice(2, 4).map((stat, idx) => (
          <Animated.View
            key={stat.label}
            style={{
              opacity: statAnims[idx + 2],
              transform: [
                {
                  translateY: statAnims[idx + 2].interpolate({
                    inputRange: [0, 1],
                    outputRange: [SLIDE_DISTANCE, 0],
                  }),
                },
              ],
              flex: 1,
              marginRight: idx === 0 ? spacing.md / 2 : 0,
              marginLeft: idx === 1 ? spacing.md / 2 : 0,
            }}
          >
            <View
              style={{
                backgroundColor: (stat.color || colors.accent) + '0D',
                borderRadius: borderRadius.md,
                paddingVertical: spacing.lg,
                alignItems: 'center',
                shadowColor: colors.text,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Ionicons name={stat.iconName} size={22} color={stat.color || colors.accent} style={{ marginBottom: spacing.xs }} />
              <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: spacing.xs }}>{stat.value}</Text>
              <Text style={{ fontSize: 13, color: colors.text, opacity: 0.7, fontWeight: '500' }}>{stat.label}</Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

export default QuickInsightsSection; 