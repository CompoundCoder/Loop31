module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Remove deprecated expo-router plugin
      // 'expo-router/babel',
      // IMPORTANT: react-native-reanimated/plugin must be the LAST plugin listed!
      'react-native-reanimated/plugin',
    ],
  };
}; 