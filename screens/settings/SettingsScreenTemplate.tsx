import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SettingItemProps = {
  label: string;
  value?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onPress?: () => void;
  toggle?: boolean;
  onToggle?: (value: boolean) => void;
  showChevron?: boolean;
};

export const SettingItem = ({ 
  label, 
  value, 
  icon, 
  iconColor = '#666',
  onPress, 
  toggle, 
  onToggle,
  showChevron = true 
}: SettingItemProps) => {
  const content = (
    <View style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
        )}
        <Text style={[styles.settingItemLabel, !icon && { marginLeft: 0 }]}>
          {label}
        </Text>
      </View>
      <View style={styles.settingItemRight}>
        {value && <Text style={styles.settingItemValue}>{value}</Text>}
        {toggle !== undefined && (
          <Switch
            value={toggle}
            onValueChange={onToggle}
            trackColor={{ false: '#e9e9ea', true: '#34C759' }}
          />
        )}
        {showChevron && !toggle && (
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

export const SettingsSection = ({ 
  title, 
  children 
}: { 
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
};

export const SettingsContainer = ({ 
  children 
}: { 
  children: React.ReactNode;
}) => {
  return (
    <ScrollView style={styles.container} bounces={true}>
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
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingItemLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingItemValue: {
    fontSize: 15,
    color: '#666',
  },
}); 