import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ChartDetailScreen from '../screens/ChartDetailScreen';
import { ChartDetailScreenParams } from '../screens/ChartDetailScreen';

export type AnalyticsStackParamList = {
  AnalyticsMain: undefined;
  ChartDetail: ChartDetailScreenParams;
};

const Stack = createNativeStackNavigator<AnalyticsStackParamList>();

export default function AnalyticsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="AnalyticsMain" 
        component={AnalyticsScreen}
      />
      <Stack.Screen 
        name="ChartDetail" 
        component={ChartDetailScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
} 