# 📚 Narria – Audiobook Player

A beautiful, feature-rich audiobook player built with React Native and Expo. Enjoy your favorite audiobooks with an intuitive iOS-inspired interface, dark mode, bookmarks, sleep timer, and multi-language support.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020.svg?logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB.svg?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?logo=typescript)

## ✨ Features

### 🎵 Core Playback
- **Full playback controls** – Play, pause, skip forward/backward
- **Adjustable playback speed** – 0.75× to 2.0×
- **Progress tracking** – Auto-save so you can resume where you left off
- **Multi-part support** – Audiobooks with multiple files/chapters
- **Background playback** – Keep listening while using other apps
- **Chapters** – Jump between parts from the player

### 📖 Library
- **Import audiobooks** – From device storage; single or multiple files
- **Auto metadata** – Title detection from filenames; optional cover from image in selection
- **Custom covers & metadata** – Edit title, author, and artwork
- **Library view** – List with cover thumbnails and quick actions
- **Edit or delete** – Long-press or menu for each book

### 📑 Bookmarks & Sleep
- **Bookmarks** – Add a bookmark at the current position (with optional label); view and jump from bookmarks list
- **Sleep timer** – Set a countdown to pause playback (e.g. 15, 30, 45, 60 min)

### ⚙️ Customization
- **Dark theme** – Full dark mode with persistent preference
- **Configurable skip intervals** – 10s, 15s, 30s, 45s, or 60s
- **Default playback speed** – Set your preferred speed
- **Language** – English and Português (Brasil)

### 🎨 UI & UX
- **iOS-inspired design** – Clean layout and controls
- **MiniPlayer** – Always visible at the bottom; tap to open full player
- **Tab navigation** – Library and Settings
- **Animations** – Smooth transitions and haptic feedback
- **Notification & lock screen** – Controls from notification and device lock

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 22 (see [.nvmrc](.nvmrc))
- **Yarn** (recommended) or npm
- **Development build** – This app uses `react-native-track-player` for background playback and notification controls, which does not work in Expo Go. Use a [development build](https://docs.expo.dev/develop/development-builds/introduction/): `npx expo run:android` or `npx expo run:ios`.

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-audiobook-player
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start the development server**
   ```bash
   yarn start
   ```

4. **Run on your device**
   - Use a development build: `npx expo run:android` or `npx expo run:ios` (Expo Go does not support the audio player).
   - Or press `a` for Android emulator, `i` for iOS simulator when using a dev build.

### WSL users
If you're using WSL, start with tunnel mode:
```bash
yarn start --tunnel
```

## 📁 Project Structure

```
my-audiobook-player/
├── app/                          # Expo Router
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab layout (Library, Settings) + MiniPlayer
│   │   ├── index.tsx             # Library tab
│   │   └── explore.tsx           # Settings tab
│   ├── _layout.tsx               # Root layout, providers, TrackPlayer registration
│   ├── player.tsx                # Full-screen player (modal)
│   └── notification.click.tsx    # Handle notification tap
├── components/
│   ├── player/                   # Player UI (artwork, controls, seek bar, modals)
│   │   ├── MiniPlayer.tsx
│   │   ├── SleepTimerModal.tsx
│   │   ├── AddBookmarkModal.tsx, BookmarkListModal.tsx
│   │   ├── ChapterListModal.tsx
│   │   └── ...
│   ├── library/                  # Library UI (list, import, edit, actions)
│   ├── settings/                 # Settings sections, pickers, about
│   ├── layout/                   # Parallax scroll, etc.
│   └── ui/                       # Themed text/view, icons, haptic tab
├── context/
│   ├── AudiobookContext.tsx      # Playback state, library, progress
│   ├── SettingsContext.tsx       # Skip intervals, default speed
│   ├── ThemeContext.tsx          # Dark/light theme
│   └── LanguageContext.tsx       # i18n
├── screens/
│   ├── LibraryScreen.tsx
│   ├── PlayerScreen.tsx
│   └── SettingsScreen.tsx
├── services/
│   ├── audioPlayerService.ts     # react-native-track-player setup
│   ├── playbackService.ts        # Background/notification media controls
│   └── storageService.ts         # Audiobooks, progress, bookmarks (AsyncStorage)
├── hooks/
│   ├── useSleepTimer.ts
│   └── use-theme-color.ts
├── utils/
│   ├── audiobookParser.ts        # Title detection, file sorting
│   ├── audioMetadata.ts         # Artwork from audio files
│   ├── coverStorage.ts           # Cover image persistence
│   ├── fileUtils.ts
│   └── timeFormatter.ts
├── i18n/
│   ├── index.ts
│   └── locales/
│       ├── en.json
│       └── pt-BR.json
├── types/
│   ├── audiobook.ts
│   └── bookmark.ts
├── constants/
│   ├── colors.ts
│   ├── storageKeys.ts
│   └── timing.ts
└── assets/
```

## 🛠️ Tech Stack

- **[React Native](https://reactnative.dev/)** – Mobile framework
- **[Expo](https://expo.dev/)** (SDK 54) – Build and tooling
- **[TypeScript](https://www.typescriptlang.org/)** – Type safety
- **[Expo Router](https://docs.expo.dev/router/introduction/)** – File-based navigation
- **[react-native-track-player](https://rntp.dev/)** – Audio playback, background, lock screen & notification
- **[react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/)** & **react-native-gesture-handler** – Animations and gestures
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** – Persistence (library, progress, bookmarks, settings)
- **[expo-document-picker](https://docs.expo.dev/versions/latest/sdk/document-picker/)** – Import audio files
- **[expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)** – Cover images
- **[expo-localization](https://docs.expo.dev/versions/latest/sdk/localization/)** + **[i18n-js](https://github.com/fnando/i18n)** – Internationalization (en, pt-BR)
- **[@missingcore/audio-metadata](https://www.npmjs.com/package/@missingcore/audio-metadata)** – Read metadata/artwork from audio files

## 📱 Usage

### Adding an audiobook
1. Tap **+** in the Library.
2. Select one or more audio files (and optionally an image for the cover).
3. Enter title and author if needed (title can be auto-detected from filenames).
4. Tap **Add** to save.

### Playing
1. Tap an audiobook in the Library.
2. **Play/Pause** – Center button.
3. **Skip backward / forward** – Left/right (intervals set in Settings).
4. **Speed** – Tap to change playback speed.
5. **Chapters** – Open part selector for multi-part books.
6. **Bookmark** – Add a bookmark at the current position; open **View bookmarks** to see and jump to bookmarks.
7. **Sleep Timer** – Set a timer to pause playback after a number of minutes.

### Settings
- **Settings** tab: default speed, skip forward/backward, dark theme, app language (English / Português).

## 🎨 Theming

Light and dark themes; toggle in **Settings → Appearance → Dark Theme**. Preferences are saved automatically.

## 🧪 Scripts

| Command | Description |
|--------|-------------|
| `yarn start` | Start Expo dev server |
| `yarn android` | Run Android dev build |
| `yarn ios` | Run iOS dev build |
| `yarn lint` | Run ESLint |

## 🙏 Acknowledgments

- [Expo](https://expo.dev/)
- [Ionicons](https://ionic.io/ionicons)
- [react-native-track-player](https://rntp.dev/) for audio and notification controls

## 📞 Support

If you run into issues or have questions, open an issue on GitHub.

---

Made with ❤️ by nyllaLabs using React Native and Expo.  
For more on Expo: [documentation](https://docs.expo.dev/) · [tutorial](https://docs.expo.dev/tutorial/introduction/) · [Discord](https://chat.expo.dev).
