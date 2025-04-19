import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Loop } from '../types/Loop';
import BottomTabNavigator from './BottomTabNavigator';
import CreatePostScreen from '../screens/CreatePostScreen';
import LoopDetailScreen from '../screens/LoopDetailScreen';
import CreateLoopScreen from '../screens/CreateLoopScreen';

export type RootStackParamList = {
  Main: undefined;
  CreatePostScreen: {
    mode: 'loop';
    loopId: string;
    existingPost?: {
      id: string;
      mediaUri: string;
      caption: string;
      createdAt: string;
    };
  };
  LoopDetailScreen: {
    loop: {
      id: string;
      name: string;
      isActive: boolean;
      color: string;
      schedule: {
        type: 'weekly' | 'interval';
        daysOfWeek?: string[];
        intervalDays?: number;
      };
      posts: any[];
    };
  };
  CreateLoopScreen: { loop?: Loop };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreatePostScreen"
        component={CreatePostScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="LoopDetailScreen"
        component={LoopDetailScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="CreateLoopScreen"
        component={CreateLoopScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
    </Stack.Navigator>
  );
} 