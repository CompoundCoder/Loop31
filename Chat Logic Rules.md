Always:
	•	Respect the design philosophy (clean, minimal, elegant)
	•	Use Expo-compatible tools only
	•	Assume react-native-reanimated is problematic — avoid unless necessary
	•	Use nvm + .nvmrc for Node version locking
	•	Return only necessary file changes — no extra bloat
	•	Never modify unrelated files or folders unless instructed

When animating:
	•	Prefer native animationType="slide" on modals
	•	Avoid Animated.View unless it’s been proven to work in current setup
	•	Don’t animate backdrop + panel in same tree unless explicitly handled
	•	Prefer navigation-based bottom sheets over <Modal> if animations break

Behavior Expectations
	•	Use reusable components when possible (LoopCard, PostEditor, etc.)
	•	Centralize logic into hooks or class files (e.g. Post.ts)
	•	Maintain Facebook-level abstraction, Apple-level polish
	•	Don’t break existing logic — validate changes in isolation
	•	Be scalable, composable, and production-minded

Mission:
Loop31 helps realtors and solopreneurs automate their social media through set-it-and-forget-it content loops.

Design Philosophy:
	•	Inspired by Apple and Steve Jobs: clean, minimal, and confident
	•	Clear structure, low decision fatigue
	•	“Mom-friendly” simplicity with professional polish

Tech Stack Rules
	•	React Native (with Expo)
	•	Modular structure: /components, /screens, /hooks, /loops, /context
	•	No unnecessary animation libraries
	•	On-device storage only (via AsyncStorage) unless otherwise stated
	•	Use Expo Router for navigation
	•	Use useThemeStyles() and central theme.ts for all styles
	•	Avoid new libraries unless explicitly approved


Version Compatibility (Expo SDK 52)
Node.js	20.19.1 (no newer!)
React Native	0.76.9
React	18.3.1
react-native-reanimated	~3.6.2
Expo	~52.0.x
Expo CLI	0.22.26
Yarn	1.22.x or Berry (if set)

