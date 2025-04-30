import React from 'react';
import { 
  StyleSheet, 
  Text, 
  Pressable, 
  PressableProps,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ExtendedTheme } from '../app/_layout';

type SimpleButtonProps = Omit<PressableProps, 'style'> & {
  /**
   * The button label text
   */
  label: string;
  /**
   * Optional MaterialCommunityIcons icon name
   */
  iconName?: string;
  /**
   * Whether to show a loading spinner
   */
  loading?: boolean;
  /**
   * Button variant - affects styling
   */
  variant?: 'primary' | 'secondary' | 'outline';
  /**
   * Whether the button is in a disabled state
   */
  disabled?: boolean;
  /**
   * Optional size variant
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Optional container style overrides
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Optional label style overrides
   */
  labelStyle?: StyleProp<TextStyle>;
  /**
   * Optional icon style overrides
   */
  iconStyle?: StyleProp<ViewStyle>;
  /**
   * Optional background color override
   */
  backgroundColor?: string;
  /**
   * Optional text color override
   */
  textColor?: string;
  /**
   * Optional border radius override
   */
  borderRadius?: number;
  /**
   * Optional shadow intensity (0-1)
   */
  shadowIntensity?: number;
};

export default function SimpleButton({ 
  label,
  iconName,
  loading = false,
  variant = 'primary',
  disabled = false,
  size = 'medium',
  style,
  labelStyle,
  iconStyle,
  backgroundColor,
  textColor,
  borderRadius,
  shadowIntensity = 0.1,
  ...pressableProps 
}: SimpleButtonProps) {
  const theme = useTheme() as unknown as ExtendedTheme;

  // Determine background color based on variant and props
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.border;
    if (variant === 'outline') return 'transparent';
    return backgroundColor || theme.colors.primary;
  };

  // Determine text color based on variant and props
  const getTextColor = () => {
    if (disabled) return theme.colors.text;
    if (variant === 'outline') return textColor || theme.colors.primary;
    return theme.colors.card;
  };

  // Get padding based on size
  const getPadding = () => {
    switch (size) {
      case 'small':
        return { 
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.sm,
        };
      case 'large':
        return { 
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.xl,
        };
      default:
        return { 
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
        };
    }
  };

  // Get elevation/shadow based on platform and intensity
  const getElevation = () => {
    if (variant === 'outline') return {};
    return Platform.select({
      ios: {
        shadowColor: theme.colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: shadowIntensity,
        shadowRadius: shadowIntensity * 8,
      },
      android: {
        elevation: shadowIntensity * 4,
      },
    });
  };

  const getBorderColor = () => {
    if (disabled) return theme.colors.border;
    if (variant === 'outline') return textColor || theme.colors.primary;
    return 'transparent';
  };

  return (
    <Pressable
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderRadius: borderRadius || theme.borderRadius.md,
          opacity: disabled ? theme.opacity.disabled : theme.opacity.full,
          ...getPadding(),
          ...getElevation(),
        },
        style,
      ]}
      disabled={disabled || loading}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator 
          color={getTextColor()} 
          size="small"
        />
      ) : (
        <>
          {iconName && (
            <MaterialCommunityIcons
              name={iconName as any}
              size={size === 'small' ? 16 : 20}
              color={getTextColor()}
              style={[
                styles.icon, 
                { marginRight: theme.spacing.xs },
                iconStyle,
              ]}
            />
          )}
          <Text style={[
            styles.label,
            { 
              color: getTextColor(),
              fontSize: size === 'small' ? 14 : 16,
              fontWeight: '500',
            },
            labelStyle,
          ]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {},
  icon: {},
}); 