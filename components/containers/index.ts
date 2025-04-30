import { Animated, ScrollView, SectionList, FlatList } from 'react-native';
import { withScreenContent } from './ScreenContentContainer';

// Create animated versions of the components
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export const ScrollContainer = withScreenContent(AnimatedScrollView);
export const ListContainer = withScreenContent(AnimatedSectionList);
export const FlatContainer: typeof FlatList = withScreenContent(AnimatedFlatList); 