import { NavigatorScreenParams } from '@react-navigation/native';
import { SettingsStackParamList } from './SettingsNavigator';
import { AnalyticsStackParamList } from './AnalyticsNavigator';
import { RootStackParamList } from './AppNavigator';

export type TabParamList = {
  Schedule: undefined;
  Posts: undefined;
  Loops: undefined;
  Analytics: NavigatorScreenParams<AnalyticsStackParamList>;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 