import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, TextInput } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';
import SettingsHeader from '@/components/headers/SettingsHeader';

// ========================================================================
// 1. TYPE DEFINITIONS
// ========================================================================

interface BaseSettingsItem {
  id: string;
  accessibilityLabel?: string;
}

export interface SettingsRowItem extends BaseSettingsItem {
  type: 'row';
  label: string;
  value?: string;
  onPress?: () => void;
}

export interface SettingsToggleItem extends BaseSettingsItem {
  type: 'toggle';
  label: string;
  value: boolean;
  onToggle: (newValue: boolean) => void;
}

export interface SettingsInputItem extends BaseSettingsItem {
  type: 'input';
  label?: string;
  value: string;
  placeholder?: string;
  onChange: (newValue: string) => void;
}

export interface SettingsDropdownItem extends BaseSettingsItem {
  type: 'dropdown';
  label: string;
  value: any;
  options: { label: string; value: any }[];
  onChange: (newValue: any) => void;
}

export interface SettingsButtonItem extends BaseSettingsItem {
  type: 'button';
  label: string;
  onPress: () => void;
  style?: 'default' | 'destructive';
}

export interface SettingsInfoItem extends BaseSettingsItem {
  type: 'info';
  text: string;
}

export interface SettingsSpacerItem extends BaseSettingsItem {
  type: 'spacer';
  height?: number;
}

export type SettingsItem =
  | SettingsRowItem
  | SettingsToggleItem
  | SettingsInputItem
  | SettingsDropdownItem
  | SettingsButtonItem
  | SettingsInfoItem
  | SettingsSpacerItem;

export interface SettingsSection {
  id: string;
  header?: string;
  items: SettingsItem[];
}

// ========================================================================
// 2. INLINE ITEM COMPONENTS
// ========================================================================

const SettingsRow: React.FC<SettingsRowItem> = ({ label, value, onPress, accessibilityLabel }) => {
  const { colors, typography, spacing } = useThemeStyles();
  return (
    <Pressable
      style={({ pressed }) => [styles.itemContainer, { backgroundColor: pressed ? colors.border : 'transparent' }]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={styles.valueContainer}>
        {value && <Text style={[styles.value, { color: colors.tabInactive }]}>{value}</Text>}
        {onPress && <Ionicons name="chevron-forward" size={20} color={colors.text} style={{ opacity: 0.5, marginLeft: spacing.xs }} />}
      </View>
    </Pressable>
  );
};

const SettingsToggle: React.FC<SettingsToggleItem> = ({ label, value, onToggle, accessibilityLabel }) => {
  const { colors } = useThemeStyles();
  return (
    <View style={styles.itemContainer}>
      <Text style={[styles.label, { color: colors.text }]} accessibilityLabel={accessibilityLabel}>{label}</Text>
      <Switch onValueChange={onToggle} value={value} trackColor={{ false: colors.border, true: colors.accent }} />
    </View>
  );
};

const SettingsInput: React.FC<SettingsInputItem> = ({ label, value, placeholder, onChange, accessibilityLabel }) => {
  const { colors, typography, spacing, borderRadius } = useThemeStyles();
  return (
    <View style={styles.itemContainer}>
      {label && <Text style={[styles.label, { color: colors.text, flex: 0, marginRight: spacing.md }]}>{label}</Text>}
      <TextInput
        style={[styles.input, { flex: 1, backgroundColor: colors.backgroundDefault, color: colors.text, borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs }]}
        value={value}
        placeholder={placeholder}
        onChangeText={onChange}
        placeholderTextColor={colors.tabInactive}
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
};

// Placeholder for dropdown
const SettingsDropdown: React.FC<SettingsDropdownItem> = ({ label, value, accessibilityLabel }) => {
    const { colors, spacing } = useThemeStyles();
    // Find the label for the current value
    const selectedOption = value // .options.find(opt => opt.value === value);
    return (
        <Pressable 
            style={({ pressed }) => [styles.itemContainer, { backgroundColor: pressed ? colors.border : 'transparent' }]}
            accessibilityLabel={accessibilityLabel}
        >
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            <View style={styles.valueContainer}>
                {<Text style={[styles.value, { color: colors.tabInactive }]}>{selectedOption?.label || 'Select...'}</Text>}
                <Ionicons name="chevron-down" size={20} color={colors.text} style={{ opacity: 0.5, marginLeft: spacing.xs }} />
            </View>
        </Pressable>
    )
};


const SettingsButton: React.FC<SettingsButtonItem> = ({ label, onPress, style = 'default', accessibilityLabel }) => {
  const { colors } = useThemeStyles();
  const textColor = style === 'destructive' ? colors.error : colors.accent;
  return (
    <Pressable
      style={({ pressed }) => [styles.itemContainer, { justifyContent: 'center', backgroundColor: pressed ? colors.border : 'transparent' }]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={[styles.label, { color: textColor, flex: 0 }]}>{label}</Text>
    </Pressable>
  );
};

const SettingsInfo: React.FC<SettingsInfoItem> = ({ text }) => {
    const { colors, typography } = useThemeStyles();
    return(
        <View style={[styles.itemContainer, {paddingVertical: 12}]}>
            <Text style={{color: colors.tabInactive, fontSize: typography.fontSize.caption}}>{text}</Text>
        </View>
    )
}

const SettingsSpacer: React.FC<SettingsSpacerItem> = ({ height = 16 }) => {
    return <View style={{height}}/>
};


// ========================================================================
// 3. MAIN SCREEN COMPONENT
// ========================================================================

interface ModularSettingsScreenProps {
  title: string;
  sections: SettingsSection[];
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export default function ModularSettingsScreen({ title, sections, onBack, rightAction }: ModularSettingsScreenProps) {
  const { colors, spacing, borderRadius, elevation, typography } = useThemeStyles();

  const renderItem = (item: SettingsItem) => {
    switch (item.type) {
      case 'row': return <SettingsRow {...item} />;
      case 'toggle': return <SettingsToggle {...item} />;
      case 'input': return <SettingsInput {...item} />;
      case 'dropdown': return <SettingsDropdown {...item} />;
      case 'button': return <SettingsButton {...item} />;
      case 'info': return <SettingsInfo {...item} />;
      case 'spacer': return <SettingsSpacer {...item}/>;
      default: return null;
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SettingsHeader title={title} onBack={onBack} rightAction={rightAction} />
      <ScrollView>
        <View style={{paddingVertical: spacing.lg}}>
          {sections.map(section => (
            <View key={section.id} style={{ paddingHorizontal: spacing.md, marginBottom: spacing.lg }}>
              {section.header && <Text style={[styles.sectionHeader, { color: colors.text, marginLeft: spacing.md, marginBottom: spacing.sm }]}>{section.header}</Text>}
              <View style={[styles.sectionContainer, { backgroundColor: colors.card, borderRadius: borderRadius.lg, ...elevation.sm }]}>
                {section.items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    {renderItem(item)}
                    {index < section.items.length - 1 && item.type !== 'spacer' && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                  </React.Fragment>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ========================================================================
// 4. STYLES
// ========================================================================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  sectionContainer: {
    overflow: 'hidden',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.5,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 54,
  },
  label: {
    fontSize: 17,
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 17,
  },
  input: {
    fontSize: 17,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 20,
  },
}); 