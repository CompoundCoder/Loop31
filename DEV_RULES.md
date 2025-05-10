I'm working on a mobile app called Loop31, designed to automate social media content for realtors and solopreneurs using reusable post loops, scheduling, and AI caption remixing.

### Design & Development Philosophy
- "Apple-level polish, Facebook-level abstraction"
- UI should be mom-friendly, minimal, and elegant
- Modular structure with reusable components (LoopCard, PostEditor, etc.)
- Theming is handled through `useThemeStyles()` and `theme.ts`
- State is managed via React Context (e.g. `LoopsContext.tsx`)
- All data is stored locally via AsyncStorage
- Use `expo-router` for navigation

### Stack Lock
- Node.js: `20.19.1` (nvm locked via `.nvmrc`)
- Yarn: `1.22.22`
- React Native: `0.76.9`
- React: `18.3.1`
- Expo SDK: `~52.0.46`
- Reanimated: `~3.6.2`
- Gesture Handler: `~2.20.2`
- Babel plugin for Reanimated is enabled

> 🔒 Do not change package versions unless explicitly told.

### Reanimated & Animation Rules
- Reanimated works, but avoid animating full modals with it
- Use `animationType="slide"` on native `Modal` components
- Reanimated is encouraged **only inside visible modals or rows**
- Encapsulate animation logic in hooks (e.g. `useAnimatedDismiss.ts`)

### Navigation
- We use `expo-router`
- Navigation is file-based (`/app/(loops)/`, `/app/(settings)/`, etc.)

### Post + Loop Logic
- `Loop.tsx` defines loop structure (id, title, previewImageUrl, etc.)
- Posts are defined in `Post.ts` or `mockPosts.ts`
- Loops support color picking, scheduling, and drag-and-drop reordering
- Custom schedule logic supports Auto, Daily, MWF, Weekly, and Custom (via day picker)

### AI + Prompts
- We use AI for caption remixing and planning content loops
- Claude and Gemini are both used
- AI receives clear rules via `Chat Logic Rules.md` and `Toolchain Lock Rules.md`
- Avoid suggesting Expo/RN upgrades, React 19, or incompatible libraries

### File Structure
- `components/`, `screens/`, `hooks/`, `context/`, `app/`, `theme/`, `data/`, `constants/`, `utils/`
- Context holds global loop/post state
- Mock data is in `data/mockPosts.ts`
- Cards, buttons, and modals are theme-aware

Let me know if you need help navigating or modifying anything. Ask before suggesting structural or stack changes.