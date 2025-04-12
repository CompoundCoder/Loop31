import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SettingItemProps = {
  label: string;
  value?: string;
  icon?: string;
  iconColor?: string;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  toggle?: boolean;
  showChevron?: boolean;
  numberOfLines?: number;
  platformIcons?: string;
};

export const SettingItem = ({ 
  label, 
  value, 
  icon, 
  iconColor = '#007AFF',
  onPress, 
  onToggle,
  toggle,
  showChevron = true,
  numberOfLines = 1,
  platformIcons,
}: SettingItemProps) => {
  const content = (
    <View style={styles.settingItem}>
      {icon && (
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={22} color={iconColor} />
        </View>
      )}
      <View style={styles.labelContainer}>
        <Text style={styles.label} numberOfLines={numberOfLines}>{label}</Text>
        {value && (
          <Text style={styles.value} numberOfLines={1}>{value}</Text>
        )}
      </View>
      {platformIcons && (
        <View style={styles.platformIcons}>
          {platformIcons.split(',').map((iconName, index) => (
            <View key={iconName} style={[styles.platformIcon, index > 0 && styles.platformIconOffset]}>
              <Ionicons name={iconName as any} size={18} color="#8E8E93" />
            </View>
          ))}
        </View>
      )}
      {showChevron && !toggle && (
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      )}
      {toggle !== undefined && (
        <View style={[styles.toggle, toggle ? styles.toggleOn : styles.toggleOff]}>
          <View style={[styles.toggleKnob, toggle ? styles.toggleKnobOn : styles.toggleKnobOff]} />
        </View>
      )}
    </View>
  );

  if (onPress || onToggle) {
    return (
      <TouchableOpacity 
        onPress={() => {
          if (onPress) onPress();
          if (onToggle) onToggle(!toggle);
        }}
        activeOpacity={0.7}
      >
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
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  value: {
    fontSize: 15,
    color: '#666',
  },
  platformIcons: {
    flexDirection: 'row',
    marginRight: 8,
  },
  platformIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformIconOffset: {
    marginLeft: -8,
  },
  toggle: {
    width: 44,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#e9e9ea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleOn: {
    backgroundColor: '#34C759',
  },
  toggleOff: {
    backgroundColor: '#e9e9ea',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginHorizontal: 2,
  },
  toggleKnobOn: {
    marginLeft: 22,
  },
  toggleKnobOff: {
    marginLeft: 2,
  },
}); 