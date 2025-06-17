import { ViewStyle, TextStyle } from 'react-native';
import { type Theme } from '@/theme/theme';
import { appIcons } from './icons';

export type ButtonPreset = {
  style: ViewStyle;
  iconName: string;
  iconLibrary: 'Ionicons' | 'MaterialCommunityIcons';
  iconSize: number;
  iconColor: string;
};

export const getButtonPresets = (theme: Theme) => {
  const { colors } = theme;

  const baseCircle: ViewStyle = {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundDefault,
  };

  return {
    back: {
      style: baseCircle,
      iconName: 'chevron-back',
      iconLibrary: 'Ionicons',
      iconSize: 24,
      iconColor: colors.text,
    } as ButtonPreset,
    add: {
      style: baseCircle,
      iconName: appIcons.navigation.add.name,
      iconLibrary: appIcons.navigation.add.library,
      iconSize: 24,
      iconColor: colors.text,
    } as ButtonPreset,
  };
}; 