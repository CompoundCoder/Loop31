import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { LAYOUT } from '@/constants/layout';
import Reanimated, {
  useSharedValue,
  useAnimatedScrollHandler,
  Layout,
  Easing,
} from 'react-native-reanimated';

import ScreenContainer from '@/components/ScreenContainer';
import AnimatedHeader, { MINI_HEADER_HEIGHT } from '@/components/AnimatedHeader';
import IdentityCard from '@/components/you/IdentityCard';
import LoopScoreCard from '@/components/you/LoopScoreCard';
import YourJourneyCard from '@/components/you/YourJourneyCard';
import PersonalSettingsGrid from '@/components/you/PersonalSettingsGrid';
import RecentPostsSection from '@/components/you/RecentPostsSection';

const allScreenSections = [
  { id: 'identity' },
  { id: 'journey' },
  { id: 'score' },
  { id: 'posts' },
  { id: 'settings' },
];

export default function YouScreen() {
  const { spacing } = useThemeStyles();
  const scrollY = useSharedValue(0);
  const [screenSections, setScreenSections] = React.useState(allScreenSections);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const handleDismiss = (id: string) => {
      setScreenSections((currentSections) => 
          currentSections.filter((section) => section.id !== id)
      );
  };

  const renderItem = React.useCallback(({ item }: { item: typeof screenSections[0] }) => {
    switch (item.id) {
      case 'identity':
        return <IdentityCard onDismiss={() => handleDismiss('identity')} />;
      case 'score':
        return <LoopScoreCard />;
      case 'journey':
        return <YourJourneyCard />;
      case 'settings':
        return <PersonalSettingsGrid />;
      case 'posts':
        return <RecentPostsSection />;
      default:
        return null;
    }
  }, []);

  return (
    <ScreenContainer>
        <AnimatedHeader title="You" scrollY={scrollY} />
        <Reanimated.FlatList 
            data={screenSections}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            itemLayoutAnimation={Layout.duration(400).easing(Easing.inOut(Easing.cubic))}
            contentContainerStyle={{
                paddingTop: MINI_HEADER_HEIGHT + 16,
                paddingHorizontal: LAYOUT.screen.horizontalPadding,
                paddingBottom: spacing.lg,
            }}
            ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
        />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#000', // To match home screen bg
    },
}); 