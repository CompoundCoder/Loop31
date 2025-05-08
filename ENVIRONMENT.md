# ✅ Loop31 Environment Snapshot (Working Build)

_Last updated: 2025-05-07_

## 🧠 Core Environment

- **Node.js**: `v20.19.1` (required for Metro to work properly)
- **Yarn**: `1.22.22`
- **npm**: `10.9.2`
- **NVM**: Not currently loaded (but .nvmrc exists for Node 20.19.1)
- **macOS Version**: [add if you want]

## 📦 Project Setup

- **Expo SDK**: `52.0.46`
- **React Native**: `0.72.4` (inferred from SDK version)
- **React**: (use `cat package.json | grep react`)
- **Expo Router**: `~4.0.20`

## 📂 Key Files

- `.nvmrc`: `20.19.1` ✅
- `.zshrc`: Missing NVM config (should include nvm load lines)
- `yarn.lock`: Matches current working install
- `package.json`: Uses specific Expo + React Native versions (no caret or tilde preferred)

## 🧪 Working Status

- `npx expo start --clear`: ✅ Working
- iOS Simulator: ✅ Loads Expo Go and connects
- Expo Go App: ✅ Updated via `https://expo.dev/client`
- Metro Bundler: ✅ Starts and listens on port 8081
- App UI: ✅ Loads and runs on device

## 🔐 Optional Safety Measures

- `"preinstall"` script in `package.json`:
  ```json
  "preinstall": "node -v | grep -q 'v20.19.1' || (echo '❌ Please run nvm use' && exit 1)"
