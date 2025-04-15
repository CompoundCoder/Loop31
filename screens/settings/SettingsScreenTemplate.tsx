import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

interface SettingItemProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onPress?: () => void;
  rightElement?: keyof typeof Ionicons.glyphMap | React.ReactElement;
  value?: string;
  platformIcons?: string;
  numberOfLines?: number;
  detail?: string;
  labelStyle?: any;
  detailStyle?: any;
  style?: any;
  toggle?: boolean;
  onToggle?: (value: boolean) => void;
  disabled?: boolean;
}

export function SettingItem({ 
  label, 
  icon, 
  iconColor = '#007AFF', 
  onPress, 
  rightElement, 
  value,
  platformIcons,
  numberOfLines,
  detail,
  labelStyle,
  detailStyle,
  style,
  toggle,
  onToggle,
  disabled
}: SettingItemProps) {
  const handlePress = () => {
    if (disabled) return;
    if (onPress) onPress();
  };

  const handleToggle = (value: boolean) => {
    if (disabled) return;
    if (onToggle) onToggle(value);
  };

  return (
    <TouchableOpacity 
      style={[
        styles.settingItem, 
        style,
        disabled && styles.settingItemDisabled
      ]} 
      onPress={handlePress}
      disabled={disabled}
    >
      <View style={styles.settingItemContent}>
        <View style={styles.settingItemLeft}>
          <Ionicons 
            name={icon} 
            size={24} 
            color={disabled ? '#999' : iconColor} 
            style={styles.settingItemIcon} 
          />
          <Text style={[
            styles.settingItemLabel, 
            labelStyle,
            disabled && styles.settingItemLabelDisabled
          ]}>
            {label}
          </Text>
          {value && (
            <View style={styles.valueContainer}>
              <Text 
                style={[
                  styles.settingItemValue,
                  disabled && styles.settingItemValueDisabled
                ]}
                numberOfLines={1}
              >
                {value}
              </Text>
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.textFade}
              />
            </View>
          )}
        </View>
        <View style={styles.settingItemRight}>
          {detail && (
            <Text style={[
              styles.settingItemDetail, 
              detailStyle,
              disabled && styles.settingItemDetailDisabled
            ]}>
              {detail}
            </Text>
          )}
          {toggle !== undefined ? (
            <Switch
              value={toggle}
              onValueChange={handleToggle}
              disabled={disabled}
            />
          ) : rightElement && (
            typeof rightElement === 'string' ? (
              <Ionicons 
                name={rightElement} 
                size={20} 
                color={disabled ? '#999' : '#007AFF'} 
              />
            ) : (
              rightElement
            )
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const SettingsSection = ({ 
  title, 
  children,
  titleStyle,
  style
}: { 
  title: string;
  children: React.ReactNode;
  titleStyle?: any;
  style?: any;
}) => {
  return (
    <View style={[styles.section, style]}>
      <Text style={[styles.sectionTitle, titleStyle]}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
};

export const SettingsContainer = ({ 
  children,
  style
}: { 
  children: React.ReactNode;
  style?: any;
}) => {
  return (
    <ScrollView style={[styles.container, style]} bounces={true}>
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e5ea',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5ea',
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  settingItemLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemDetail: {
    fontSize: 15,
    color: '#666',
    marginRight: 8,
  },
  valueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    marginRight: 16,
    position: 'relative',
  },
  settingItemValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  textFade: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
  settingItemDisabled: {
    opacity: 0.8,
  },
  settingItemLabelDisabled: {
    color: '#999',
  },
  settingItemValueDisabled: {
    color: '#999',
  },
  settingItemDetailDisabled: {
    color: '#999',
  },
}); 