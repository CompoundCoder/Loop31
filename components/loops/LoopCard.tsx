import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, StyleProp, ViewStyle, Switch, Image, Platform } from 'react-native';
import { useThemeStyles, type ThemeStyles } from '@/hooks/useThemeStyles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@react-navigation/native';
import type { Loop as ContextLoop } from '@/context/LoopsContext';
import { SwipeableRow, type SwipeableRowRef } from '@/components/common/SwipeableRow';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { getFrequencyLabel } from '@/constants/loopFrequencies';
import { getLoopPostCount } from '@/utils/loopHelpers';
import { MOCK_POSTS } from '@/data/mockPosts';

interface LoopCardProps {
  loop: ContextLoop;
  isPinned?: boolean;
  onPress?: () => void;
  onLongPress?: (loopId: string, loopTitle: string) => void;
  onToggleActive?: (loopId: string, isActive: boolean) => void;
  onSwipePin?: (loopId: string) => void;
  onSwipeUnpin?: (loopId: string) => void;
  style?: StyleProp<ViewStyle>;
}

const ACTION_BUTTON_WIDTH = 80;

export const LoopCard = forwardRef<SwipeableRowRef, LoopCardProps>((
  {
    loop,
    isPinned,
    onPress,
    onLongPress,
    onToggleActive,
    onSwipePin,
    onSwipeUnpin,
    style
  },
  ref
) => {
  const { colors, spacing, borderRadius, elevation } = useThemeStyles();
  const postCount = getLoopPostCount(loop.id, MOCK_POSTS);
  
  const handleToggle = (newValue: boolean) => {
    onToggleActive?.(loop.id, newValue);
  };

  let statusIcon: keyof typeof MaterialCommunityIcons.glyphMap | null = null;
  let statusColor = colors.text + '99';

  switch (loop.status) {
    case 'paused':
      statusIcon = 'pause-circle-outline';
      break;
    case 'error':
      statusIcon = 'alert-circle-outline';
      statusColor = colors.notification;
      break;
  }

  const cardBackgroundColor = colors.card;

  const renderActions = React.useCallback(() => {
    const actionConfig = isPinned ? 
      {
        handler: onSwipeUnpin ? () => onSwipeUnpin(loop.id) : undefined,
        icon: "pin-off" as keyof typeof MaterialCommunityIcons.glyphMap,
        text: "Unpin",
        bgColor: colors.border,
        textColor: colors.text,
      } : 
      {
        handler: onSwipePin ? () => onSwipePin(loop.id) : undefined,
        icon: "pin" as keyof typeof MaterialCommunityIcons.glyphMap,
        text: "Pin",
        bgColor: colors.accent,
        textColor: colors.background,
      };
      
    if (!actionConfig.handler) return null;

    return (
      <TouchableOpacity 
        style={[actionStyles.actionView, { backgroundColor: actionConfig.bgColor }]}
        onPress={() => {
           actionConfig.handler?.();
           Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
      >
        <MaterialCommunityIcons name={actionConfig.icon} size={24} color={actionConfig.textColor} />
        <Text style={[actionStyles.actionText, { color: actionConfig.textColor }]}>
          {actionConfig.text}
        </Text>
      </TouchableOpacity>
    );
  }, [isPinned, onSwipePin, onSwipeUnpin, loop.id, colors]);

  const actionBackgroundColor = isPinned ? colors.border : colors.accent;

  const cardContent = (
    <Pressable 
      onPress={onPress} 
      onLongPress={() => onLongPress?.(loop.id, loop.title)} 
      delayLongPress={300}
      style={({ pressed }) => [pressed && { opacity: 0.8 }]}
    >
      <View style={[
        styles.container, 
        {
          backgroundColor: cardBackgroundColor,
          borderColor: colors.border,
          ...elevation,
          padding: spacing.md,
          opacity: loop.isActive ? 1 : 0.6,
        },
      ]}>
        {isPinned && (
          <LinearGradient
            colors={[loop.color + '66', loop.color + '14']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        )}
        
        {isPinned && (
          <View style={styles.pinIconContainer}>
            <MaterialCommunityIcons 
              name="pin" 
              size={16} 
              color={colors.text + '99'}
            />
          </View>
        )}

        <View style={[
          styles.previewContainer,
          { 
            backgroundColor: colors.border, 
            borderRadius: borderRadius.md,
            marginRight: spacing.md, 
            overflow: 'hidden',
          }
        ]}>
          {loop.previewImageUrl ? (
            <Image 
              source={{ uri: loop.previewImageUrl }} 
              style={[styles.previewImage, { borderRadius: borderRadius.md }]}
              resizeMode="cover"
            />
          ) : (
            null 
          )}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.infoStackContainer}>
            <View style={styles.titleRow}>
              <View style={[
                styles.colorIndicator,
                { 
                  backgroundColor: loop.color || colors.primary, 
                  marginRight: spacing.sm,
                  borderRadius: borderRadius.full,
                }
              ]}/>
              <Text 
                style={[
                  styles.title,
                  { color: colors.text }
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {loop.title}
              </Text>
            </View>
            
            <View style={styles.statsRow}>
              <MaterialCommunityIcons name="file-multiple-outline" size={14} color={colors.text + '99'} />
              <Text style={[styles.statsText, { marginLeft: 4 }]}>{postCount} posts</Text>
              <Text style={styles.statsSeparator}>•</Text>
              <Text style={styles.statsText}>{getFrequencyLabel(loop.frequency)}</Text>
              {statusIcon && (
                <>
                  <Text style={styles.statsSeparator}>•</Text>
                  <MaterialCommunityIcons 
                    name={statusIcon} 
                    size={14} 
                    color={statusColor} 
                    style={{ marginLeft: spacing.xs }}
                  />
                </>
              )}
            </View>
          </View>

          <View style={[styles.toggleContainer, { paddingLeft: spacing.sm }]}> 
             <Switch 
               value={loop.isActive} 
               onValueChange={handleToggle}
               trackColor={{ false: colors.border, true: loop.color || colors.primary }}
             />
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SwipeableRow
      ref={ref}
      renderActions={ (isPinned && onSwipeUnpin) || (!isPinned && onSwipePin) ? renderActions : undefined }
      actionsWidth={ACTION_BUTTON_WIDTH}
      actionBackgroundColor={actionBackgroundColor}
      borderRadius={borderRadius.lg}
      containerStyle={style}
    >
      {cardContent}
    </SwipeableRow>
  );
});

const actionStyles = StyleSheet.create({
  actionView: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%', 
  },
  leftAction: {
  },
  rightAction: {
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  }
});

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth, 
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
  },
  infoStackContainer: {
    flexShrink: 1, 
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4, 
  },
  colorIndicator: {
    width: 8,
    height: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2, 
  },
  statsText: {
    fontSize: 13, 
    fontWeight: '400',
  },
  statsSeparator: {
    fontSize: 13,
    fontWeight: '400',
    marginHorizontal: 4,
  },
  toggleContainer: { 
  },
  pinIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
}); 

export default LoopCard; 