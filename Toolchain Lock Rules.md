## Toolchain Lock Rules

- 🚫 Do NOT upgrade or change the following versions unless explicitly asked:
  - Expo SDK: `52.0.46`
  - React Native: `0.76.9`
  - React: `18.3.1`
  - Node.js: `20.19.1` (set via `.nvmrc`)
  - Yarn: `1.22.22`

- ✅ All dependencies must remain compatible with the versions above.
  - Use `expo install` when possible to ensure Expo-safe versions.
  - Avoid packages that require newer versions of React Native or Expo.

- ⚠️ Do NOT suggest:
  - `npx expo upgrade`
  - Upgrading React Native
  - Switching Node versions
  - Modifying `.nvmrc` or `yarn.lock`
  - Installing React 19 or RN 0.7x+ libraries

- ✅ Assume `yarn.lock` is frozen unless explicitly told to update it.

- 🔒 Stability > bleeding edge. Avoid latest package suggestions unless explicitly asked.

## Protected Files

Do NOT refactor, delete, or alter logic in the following files unless explicitly instructed:

- `captionGenerator.ts`
- `LoopCard.tsx`
- `Post.ts`