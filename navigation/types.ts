import { NavigatorScreenParams } from '@react-navigation/native';
import { SettingsStackParamList } from './SettingsNavigator';
import { AnalyticsStackParamList } from './AnalyticsNavigator';

export type TabParamList = {
  Schedule: undefined;
  ScheduledPosts: undefined;
  Create: undefined;
  Sent: undefined;
  Analytics: NavigatorScreenParams<AnalyticsStackParamList>;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends TabParamList {}
  }
} 