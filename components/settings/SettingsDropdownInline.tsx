import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';
import * as rowPresets from '@/presets/rows';
import * as typographyPresets from '@/presets/typography';
import SettingsCaption from './SettingsCaption';
import InlineDropdownMenu from '@/components/ui/InlineDropdownMenu';
import DropdownMenuItems from '@/components/ui/DropdownMenuItems';

interface SettingsDropdownInlineProps {
  label: string;
  options: string[];
  value: string;
  onChange: (newValue: string) => void;
  caption?: string;
}

export default function SettingsDropdownInline({ label, options, value, onChange, caption }: SettingsDropdownInlineProps) {
  const { colors, spacing } = useThemeStyles();

  const dropdownOptions = options.map(opt => ({ label: opt, value: opt }));
  const selectedOption = dropdownOptions.find(opt => opt.value === value);

  return (
    <View>
        <InlineDropdownMenu
            trigger={
                <Pressable
                    style={({ pressed }) => [
                        rowPresets.headerActionRow,
                        {
                            padding: spacing.md,
                            backgroundColor: pressed ? colors.border : 'transparent',
                        },
                    ]}
                >
                    <Text style={[typographyPresets.pageHeaderTitle, { color: colors.text, flex: 1 }]}>{label}</Text>
                    <View style={rowPresets.iconTextRow}>
                        <Text style={[typographyPresets.pageHeaderTitle, { color: colors.tabInactive, marginRight: spacing.xs }]}>
                            {selectedOption?.label}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={colors.text} style={{ opacity: 0.5 }} />
                    </View>
                </Pressable>
            }
        >
            <DropdownMenuItems
                options={dropdownOptions}
                selectedValue={value}
                onValueChange={onChange}
            />
        </InlineDropdownMenu>

        {caption && <SettingsCaption text={caption} />}
    </View>
  );
} 