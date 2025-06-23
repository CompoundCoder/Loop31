import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface MenuItem {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface BottomSheetMenuProps {
  menuTitle?: string;
  sections: MenuItem[][]; // Array of sections, each section is an array of items
  modalRef: React.RefObject<Modalize>;
}

export const BottomSheetMenu: React.FC<BottomSheetMenuProps> = ({ menuTitle, sections, modalRef }) => {
  const { colors, spacing, typography, borderRadius } = useThemeStyles();
  const insets = useSafeAreaInsets();

  const renderItem = (item: MenuItem, isLast: boolean) => (
    <Pressable
      key={item.label}
      onPress={item.onPress}
      disabled={item.disabled}
      style={({ pressed }) => [
        styles.option,
        { 
          backgroundColor: pressed ? colors.border : 'transparent',
          paddingHorizontal: spacing.lg,
        },
        item.disabled && styles.disabled,
      ]}
    >
      {item.icon}
      <Text
        style={[
          styles.optionText,
          { 
            color: item.destructive ? colors.error : colors.text,
            marginLeft: spacing.lg,
            fontSize: typography.fontSize.body,
            fontWeight: '500',
          },
        ]}
      >
        {item.label}
      </Text>
    </Pressable>
  );

  return (
    <Modalize
      ref={modalRef}
      adjustToContentHeight
      handleStyle={{ backgroundColor: colors.border }}
      modalStyle={{
        backgroundColor: colors.card,
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
        paddingBottom: insets.bottom,
      }}
      HeaderComponent={
        menuTitle ? (
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text, opacity: 0.6 }]}>{menuTitle}</Text>
          </View>
        ) : null
      }
    >
      <View style={{ paddingVertical: spacing.sm }}>
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex}>
            {section.map((item, itemIndex) => renderItem(item, itemIndex === section.length - 1))}
            {sectionIndex < sections.length - 1 && (
              <View style={[styles.separator, { backgroundColor: colors.border, marginVertical: spacing.sm }]} />
            )}
          </View>
        ))}
      </View>
    </Modalize>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    minHeight: 48,
  },
  optionText: {},
  disabled: {
    opacity: 0.5,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
}); 