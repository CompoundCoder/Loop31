import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  ScrollView,
  Text,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ExtendedTheme } from '@/app/_layout';

import AnimatedHeader, { MINI_HEADER_HEIGHT } from '@/components/AnimatedHeader';
import SectionTitle from '../components/SectionTitle';
import EmptyState from '@/components/EmptyState';
import SimpleButton from '../components/SimpleButton';
import PostCard from '../components/PostCard';
import ScreenContainer from '@/components/ScreenContainer';
import { ScrollContainer } from '@/components/containers';
import FadeSlideInView from '@/components/FadeSlideInView';
import { LAYOUT, SCREEN_LAYOUT } from '@/constants/layout';
import { Post } from '@/data/Post';
import HeaderActionButton from '@/components/HeaderActionButton';

type LoopsScreenProps = {
  /**
   * Whether the screen is in a loading state
   */
  isLoading?: boolean;
};

function LoopPlaceholder({ color }: { color: string }) {
  const theme = useTheme() as unknown as ExtendedTheme;
  
  return (
    <View style={[
      styles.loopCard,
      {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.lg,
        borderColor: theme.colors.border,
        padding: theme.spacing.lg,
        marginBottom: LAYOUT.content.cardSpacing,
      }
    ]}>
      <View style={styles.loopHeader}>
        <View style={[
          styles.loopColorIndicator,
          {
            backgroundColor: color,
            borderRadius: theme.borderRadius.full,
          }
        ]} />
        <View style={[
          styles.loopTitlePlaceholder,
          {
            backgroundColor: theme.colors.border,
            borderRadius: theme.borderRadius.sm,
          }
        ]} />
      </View>
      <View style={[
        styles.loopStatsPlaceholder,
        {
          backgroundColor: theme.colors.border,
          borderRadius: theme.borderRadius.sm,
          marginTop: theme.spacing.md,
        }
      ]} />
    </View>
  );
}

export default function LoopsScreen({ isLoading = false }: LoopsScreenProps) {
  const theme = useTheme() as unknown as ExtendedTheme;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = React.useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleHeaderActionPress = () => {
    setMenuVisible(prev => !prev);
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <AnimatedHeader 
          title="Loops" 
          scrollY={scrollY}
          menuVisible={menuVisible}
          onMenuVisibleChange={setMenuVisible}
          actionButton={<HeaderActionButton iconName="add-outline" onPress={handleHeaderActionPress} />}
        />
        <EmptyState isLoading />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AnimatedHeader 
        title="Loops" 
        scrollY={scrollY}
        menuVisible={menuVisible}
        onMenuVisibleChange={setMenuVisible}
        actionButton={<HeaderActionButton iconName="add-outline" onPress={handleHeaderActionPress} />}
      />
      <ScrollContainer
        scrollY={scrollY}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={{
          paddingTop: MINI_HEADER_HEIGHT + 16,
          paddingHorizontal: SCREEN_LAYOUT.content.horizontalPadding,
        }}
      >
        <View style={[
          styles.header,
          {
            marginBottom: LAYOUT.content.cardSpacing,
          }
        ]}>
          <SimpleButton
            label="Create Loop"
            iconName="plus"
            size="small"
          />
        </View>

        {/* Featured Loop */}
        <SectionTitle
          title="Featured Loop"
          withTopMargin={false}
        />
        <FadeSlideInView index={0}>
          <LoopPlaceholder color={theme.colors.primary} />
        </FadeSlideInView>

        {/* Recent Posts */}
        <SectionTitle
          title="Recent Posts"
        />
        <FadeSlideInView index={1}>
          <PostCard
            post={new Post({
              id: 'placeholder-1',
              caption: 'Loading...',
              media: [],
              accountTargets: [],
            })}
            isLoading
            containerStyle={{ marginBottom: LAYOUT.content.cardSpacing }}
          />
        </FadeSlideInView>

        {/* All Loops */}
        <SectionTitle
          title="All Loops"
        />
        <View>
          <FadeSlideInView index={2}>
            <LoopPlaceholder color="#FF6B6B" />
          </FadeSlideInView>
          <FadeSlideInView index={3}>
            <LoopPlaceholder color="#4ECDC4" />
          </FadeSlideInView>
          <FadeSlideInView index={4}>
            <LoopPlaceholder color="#45B7D1" />
          </FadeSlideInView>
        </View>
      </ScrollContainer>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loopCard: {
    borderWidth: 1,
  },
  loopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loopColorIndicator: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  loopTitlePlaceholder: {
    height: 24,
    width: 160,
    opacity: 0.5,
  },
  loopStatsPlaceholder: {
    height: 16,
    width: 120,
    opacity: 0.5,
  },
}); 