import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import { enableLayoutAnimations } from 'react-native-reanimated';
import App from './App';
import { name as appName } from './app.json';

// Enable layout animations for Reanimated
enableLayoutAnimations(true);

AppRegistry.registerComponent(appName, () => App); 