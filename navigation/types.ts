import { NavigatorScreenParams } from '@react-navigation/native';
import { SettingsStackParamList } from './SettingsNavigator';

export type TabParamList = {
  Posts: undefined;
  Create: undefined;
  Sent: undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends TabParamList {}
  }
} 