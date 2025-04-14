import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CreateScreen from '../screens/create/CreateScreen';
import PlatformSelectScreen from '../screens/create/PlatformSelectScreen';
import MediaPickerScreen from '../screens/create/MediaPickerScreen';
import ScheduleScreen from '../screens/create/ScheduleScreen';

export type CreateStackParamList = {
  CreateMain: {
    draft?: {
      caption: string;
      mediaUri: string;
      accountIds: string[];
      scheduledDate: string;
    };
  } | undefined;
  PlatformSelect: undefined;
  MediaPicker: { platforms: string[] };
  Schedule: {
    platforms: string[];
    media: string[];
    content: string;
  };
  Posts: undefined;
};

const Stack = createNativeStackNavigator<CreateStackParamList>();

export default function CreateNavigator() {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#2f95dc" />
          </TouchableOpacity>
        ),
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '600',
        },
      })}
    >
      <Stack.Screen 
        name="CreateMain" 
        component={CreateScreen}
        options={{ 
          title: 'Create Post',
          headerLeft: undefined,
        }}
      />
      <Stack.Screen 
        name="PlatformSelect" 
        component={PlatformSelectScreen}
        options={{ title: 'Select Platforms' }}
      />
      <Stack.Screen 
        name="MediaPicker" 
        component={MediaPickerScreen}
        options={{ title: 'Add Media' }}
      />
      <Stack.Screen 
        name="Schedule" 
        component={ScheduleScreen}
        options={{ title: 'Schedule Post' }}
      />
    </Stack.Navigator>
  );
} 