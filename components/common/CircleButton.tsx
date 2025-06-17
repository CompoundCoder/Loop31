import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { type ButtonPreset } from '@/presets/buttons';

type Props = {
  preset: ButtonPreset;
  onPress: () => void;
  accessibilityLabel: string;
};

const IconComponent = ({ library, name, size, color }: { library: string, name: string, size: number, color: string }) => {
  if (library === 'Ionicons') {
    return <Ionicons name={name as any} size={size} color={color} />;
  }
  if (library === 'MaterialCommunityIcons') {
    return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
  }
  return null;
};

export const CircleButton: React.FC<Props> = ({ preset, onPress, accessibilityLabel }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={preset.style}
      accessibilityLabel={accessibilityLabel}
    >
      <IconComponent 
        library={preset.iconLibrary}
        name={preset.iconName}
        size={preset.iconSize}
        color={preset.iconColor}
      />
    </TouchableOpacity>
  );
}; 