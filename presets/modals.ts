import { ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { type Theme } from '@/theme/theme';

const THUMB_SIZE = 28;

// Define the shape of the object returned by the function
// This avoids the circular reference issue and provides strong types.
type ModalPresets = {
  modalBackdrop: ViewStyle;
  modalContainer: ViewStyle;
  modalContent: ViewStyle;
  header: ViewStyle;
  footer: ViewStyle;
  colorGrid: ViewStyle;
  title: TextStyle;
  sectionTitle: TextStyle;
  input: TextStyle;
  colorSwatch: ViewStyle;
  checkmarkOverlay: ViewStyle;
  sliderContainer: ViewStyle;
  sliderTrack: ViewStyle;
  sliderThumb: ViewStyle;
  sliderLabelsContainer: ViewStyle;
  customDayPicker: ViewStyle;
  dayButton: ViewStyle;
  footerButtonBase: ViewStyle;
  slideUpHandle: ViewStyle;
};

export const getModalsPresets = (theme?: Theme): Partial<ModalPresets> => {
  if (!theme) {
    console.warn('❗️getModalsPresets called without a theme');
    return {}; // prevent crash
  }
  const { colors, spacing, borderRadius } = theme;

  return {
    // ---- Containers & Layout ----
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.6)',
      zIndex: 1,
    } as ViewStyle,
    modalContainer: {
      width: '90%',
      maxHeight: '85%',
      zIndex: 2,
    } as ViewStyle,
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
    } as ViewStyle,
    header: {
      padding: spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
    } as ViewStyle,
    footer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      padding: spacing.lg,
      flexDirection: 'row',
    } as ViewStyle,
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.sm,
    } as ViewStyle,

    // ---- Text Styles ----
    title: {
      fontWeight: 'bold',
      fontSize: 20,
    } as TextStyle,
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
    } as TextStyle,
    
    // ---- Form Elements ----
    input: {
      borderWidth: 1,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      fontSize: 16,
    } as TextStyle, // TextInput can take TextStyle
    
    // ---- Color Swatch ----
    colorSwatch: {
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,
    checkmarkOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'transparent',
      borderRadius: 19,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    // ---- Frequency Slider ----
    sliderContainer: { justifyContent: 'center', height: THUMB_SIZE },
    sliderTrack: { height: 4, borderRadius: 2 },
    sliderThumb: {
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      borderRadius: THUMB_SIZE / 2,
      position: 'absolute',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 4,
    },
    sliderLabelsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    
    // ---- Custom Day Picker ----
    customDayPicker: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    dayButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
    },
    
    // ---- Footer Buttons ----
    footerButtonBase: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    // ---- Slide-up Menu ----
    slideUpHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
    } as ViewStyle,
  };
}; 