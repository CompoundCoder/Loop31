# Toolchain Lock Rules for Loop31

## Purpose:
Ensure Gemini (and any AI) respects the locked toolchain and avoids introducing breaking versions or incompatible libraries when editing files.

---

## ✅ Node & Package Managers

- Use **Node.js v20.19.1** only
  - Defined in `.nvmrc`
  - Do NOT update Node or switch to v22+
- Use **Yarn 1.22.22**
  - Do NOT convert to npm or pnpm

---

## ✅ React Native Stack

| Package                     | Locked Version   |
|-----------------------------|------------------|
| react-native                | 0.76.9           |
| react                       | 18.3.1           |
| react-native-reanimated     | ~3.6.2           |
| react-native-gesture-handler | ~2.20.2         |
| expo                        | ~52.0.46         |
| expo-router                 | ~4.0.20          |

- **DO NOT change these versions**
- Avoid updates that break Expo SDK 52 compatibility

---

## ✅ Config Enforcement

- Ensure `babel.config.js` includes:
  ```js
  plugins: ['react-native-reanimated/plugin']

	•	tsconfig.json must include:
"baseUrl": ".",
"paths": {
  "@/*": ["./*"]
}


✅ Animation & Modal Rules
	•	Do NOT use Reanimated for animating entrance/exit of full modals
	•	Use native Modal animationType instead (e.g., slide)
	•	Reanimated is allowed inside visible modals only (buttons, views)
	•	Avoid react-native-modal or third-party modal libraries unless scoped

✅ Layout Rules
	•	Use SafeAreaView and KeyboardAvoidingView for all main screens
	•	Prefer FlatList over ScrollView for dynamic lists
	•	Reanimated + Gesture Handler must wrap scrollable views properly

✅ When Adding New Packages
	•	Must be compatible with:
	•	React Native 0.76.9
	•	Expo SDK 52
	•	Node v20
	•	Always verify no peer dependency mismatches
	•	No large dependencies unless approved (e.g., Lottie, Skia)

❌ Forbidden
	•	Do NOT install incompatible packages like:
	•	react-native-modal (breaks animations)
	•	react-native-navigation (conflicts with expo-router)
	•	styled-components (unless specifically scoped for one screen)

Summary

Keep the stack lightweight, Expo-compatible, and focused on:
	•	Fast local dev
	•	Clean animations
	•	Future AI-powered content automation

