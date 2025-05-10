import React, { forwardRef } from 'react';
import { StyleSheet, View, Text, Pressable, StyleProp, ViewStyle, Switch, Image, Platform } from 'react-native';
// import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useThemeStyles } from '../hooks/useThemeStyles'; // Relative path
import { MaterialCommunityIcons } from '@expo/vector-icons';
// --- Removed Gesture Handler & Reanimated Imports for direct use --- 
// import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
// import Reanimated, { ... } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// --- Import the new SwipeableRow component --- 
import { SwipeableRow, SwipeableRowRef } from '@/components/common/SwipeableRow'; // Use alias path and import ref type
import { TouchableOpacity } from 'react-native-gesture-handler'; // For action button
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient

// Define Loop type - Apple Inspired Design
interface Loop {
  id: string;
  title: string;
  color: string; 
  postCount: number;
  schedule: string; 
  isActive: boolean; // Required for the toggle
  previewImageUrl?: string; // Optional preview image
  status?: 'active' | 'paused' | 'draft' | 'error'; // Optional status
}

interface LoopCardProps {
  loop: Loop;
  isPinned?: boolean; // Add isPinned prop
  onPress?: () => void;
  onLongPress?: (loopId: string, loopTitle: string) => void; // Add onLongPress prop
  onToggleActive?: (loopId: string, isActive: boolean) => void; // Callback for toggle
  // Swipe Action Props (Keep these, they are passed to SwipeableRow)
  onSwipePin?: (loopId: string) => void;
  onSwipeUnpin?: (loopId: string) => void;
  style?: StyleProp<ViewStyle>;
}

// --- Removed Swipe Constants --- 
// const { width: SCREEN_WIDTH } = Dimensions.get('window');
// const SWIPE_THRESHOLD_PERCENTAGE = 0.2;
// const PIN_THRESHOLD = SCREEN_WIDTH * SWIPE_THRESHOLD_PERCENTAGE;
// const UNPIN_THRESHOLD = -SCREEN_WIDTH * SWIPE_THRESHOLD_PERCENTAGE;
// const ACTION_VIEW_WIDTH = 80;

// --- Removed Gesture Context Type --- 
// type AnimatedGHContext = { ... }

// --- Define Action Button Width --- 
const ACTION_BUTTON_WIDTH = 80;

// --- Define Accent Bar Width --- 
// const ACCENT_BAR_WIDTH = 5; // Removed

// --- Component using forwardRef --- 
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
  ref // Add ref argument
) => {
  const { colors, spacing, borderRadius, elevation } = useThemeStyles();
  
  // --- Removed Reanimated Setup --- 
  // const translateX = useSharedValue(0);
  // const gestureHandler = useAnimatedGestureHandler<...>(...);
  // const animatedStyle = useAnimatedStyle(() => { ... });

  // Placeholder handler for the toggle - will be implemented in Phase 2
  const handleToggle = (newValue: boolean) => {
    onToggleActive?.(loop.id, newValue);
  };

  // Determine status icon and color (Example)
  let statusIcon: keyof typeof MaterialCommunityIcons.glyphMap | null = null;
  let statusColor = colors.text + '99'; // Default secondary text color

  switch (loop.status) {
    case 'paused':
      statusIcon = 'pause-circle-outline';
      break;
    case 'error':
      statusIcon = 'alert-circle-outline';
      statusColor = colors.notification; // Use error color
      break;
    // Add cases for 'draft', etc. if needed
  }

  // Determine background color based on pinned status - REVERTED
  // Use colors.card for all, or the platform-specific subtle difference if preferred
  const cardBackgroundColor = colors.card;
  // const cardBackgroundColor = isPinned 
  //  ? Platform.OS === 'ios' ? colors.card + 'F5' : 'rgba(200, 200, 200, 0.1)'
  //  : colors.card; 

  // --- Define Combined Action Render Function --- 
  const renderActions = React.useCallback(() => {
    const actionConfig = isPinned ? 
      { // Unpin Action
        handler: onSwipeUnpin ? () => onSwipeUnpin(loop.id) : undefined,
        icon: "pin-off" as keyof typeof MaterialCommunityIcons.glyphMap,
        text: "Unpin",
        bgColor: colors.border,
        textColor: colors.text,
      } : 
      { // Pin Action
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
           // Optional: Add haptic feedback on tap
           Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
           // Note: SwipeableRow currently doesn't auto-close on button press
           // We might need to add a ref/method to SwipeableRow to close it, 
           // or handle closing implicitly via state updates in LoopsScreen.
        }}
      >
        <MaterialCommunityIcons name={actionConfig.icon} size={24} color={actionConfig.textColor} />
        <Text style={[actionStyles.actionText, { color: actionConfig.textColor }]}>
          {actionConfig.text}
        </Text>
      </TouchableOpacity>
    );
  }, [isPinned, onSwipePin, onSwipeUnpin, loop.id, colors]);

  // --- Determine Action Background Color (for SwipeableRow) --- 
  const actionBackgroundColor = isPinned ? colors.border : colors.accent;

  // --- Card Content --- 
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
        {/* --- Pinned Gradient Overlay (Conditional) --- */}
        {isPinned && (
          <LinearGradient
            // Fade from loop color (40%) to loop color (8%)
            colors={[loop.color + '66', loop.color + '14']}
            // Diagonal fade
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill} // Cover the whole card area
            pointerEvents="none" // Allow touches to pass through
          />
        )}
        
        {/* Pin Icon (Top Right Corner) - Conditional */}
        {isPinned && (
          <View style={styles.pinIconContainer}>
            <MaterialCommunityIcons 
              name="pin" 
              size={16} 
              color={colors.text + '99'} // Revert to subtle color
            />
          </View>
        )}

        {/* Left Side: Preview Image / Placeholder */}
        <View style={[
          styles.previewContainer,
          { 
            backgroundColor: colors.border, 
            borderRadius: borderRadius.md,
            marginRight: spacing.md, 
            overflow: 'hidden', // Add overflow hidden to clip image
          }
        ]}>
          {loop.previewImageUrl ? (
            <Image 
              source={{ uri: loop.previewImageUrl }} 
              style={[styles.previewImage, { borderRadius: borderRadius.md }]} // Apply border radius
              resizeMode="cover"
            />
          ) : (
            // Render nothing here to show the blank space with background color
            null 
          )}
        </View>

        {/* Right Side: Info Stack & Toggle Area */}
        <View style={styles.contentContainer}>
          {/* Info Stack */}
          <View style={styles.infoStackContainer}>
            {/* Top Row: Color Indicator + Title */}
            <View style={styles.titleRow}>
              <View style={[
                styles.colorIndicator,
                { 
                  backgroundColor: loop.color || colors.primary, 
                  marginRight: spacing.sm, // Use theme spacing
                  borderRadius: borderRadius.full, // Ensure it's a circle
                }
              ]}/>
              <Text 
                style={[
                  styles.title,
                  { color: colors.text } // Use theme text color
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {loop.title}
              </Text>
            </View>
            
            {/* Middle Row: Stats & Status */}
            <View style={styles.statsRow}>
              {/* Post Count */} 
              <MaterialCommunityIcons name="file-multiple-outline" size={14} color={colors.text + '99'} />
              <Text style={[
                styles.statsText, 
                { color: colors.text + '99', marginLeft: spacing.xs }
              ]}>
                {loop.postCount} posts
              </Text>
              {/* Separator */}
              <Text style={[styles.statsSeparator, { color: colors.text + '99' }]}>•</Text>
              {/* Schedule */} 
              <MaterialCommunityIcons name="calendar-sync-outline" size={14} color={colors.text + '99'} />
              <Text style={[
                styles.statsText, 
                { color: colors.text + '99', marginLeft: spacing.xs, flexShrink: 1 }
              ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {loop.schedule}
              </Text>
               {/* Status Icon (Conditional) */}
              {statusIcon && (
                <>
                  <Text style={[styles.statsSeparator, { color: statusColor }]}>•</Text>
                  <MaterialCommunityIcons 
                    name={statusIcon} 
                    size={14} 
                    color={statusColor} 
                    style={{ marginLeft: spacing.xs }} // Add spacing before status icon
                  />
                </>
              )}
            </View>
          </View>

          {/* Toggle Switch Area */}
          <View style={[styles.toggleContainer, { paddingLeft: spacing.sm }]}> 
             <Switch 
               value={loop.isActive} 
               onValueChange={handleToggle} 
               // Use loop color for the active track
               trackColor={{ false: colors.border, true: loop.color || colors.primary }} // Fallback to primary if loop.color is somehow undefined
               // thumbColor needs platform check usually, leave default for now
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

// --- Action Styles (Moved to separate object for clarity) --- 
const actionStyles = StyleSheet.create({
  actionView: {
    width: 80, // Keep consistent width
    justifyContent: 'center',
    alignItems: 'center',
    // Added height: '100%' to ensure they fill the row vertically
    height: '100%', 
  },
  leftAction: {
    // Styles specific to left action view if needed (besides bg color)
  },
  rightAction: {
     // Styles specific to right action view if needed (besides bg color)
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  }
});

// Updated Styles for Apple-Inspired Layout
const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth, 
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden', // Crucial for clipping the accent bar
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
    marginRight: 8, // Keep hardcoded or adjust based on toggle padding
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4, 
  },
  colorIndicator: {
    width: 8,
    height: 8,
    // marginRight & borderRadius applied inline
  },
  title: {
    fontSize: 16, // Standard text size
    fontWeight: '600', // Semi-bold for title
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2, 
  },
  statsText: {
    fontSize: 13, 
    fontWeight: '400',
    // marginLeft applied inline
  },
  statsSeparator: {
    fontSize: 13,
    fontWeight: '400',
    marginHorizontal: 4, // Use theme spacing.xs?
  },
  toggleContainer: { 
    // paddingLeft applied inline
  },
  pinIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  // --- Removed Styles for Swipe Actions --- 
  // swipeContainer: { ... },
  // actionView: { ... },
  // pinAction: { ... },
  // unpinAction: { ... },
  // actionText: { ... },
}); 

export default LoopCard; 