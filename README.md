# 📚 Audiobook Player

A beautiful, feature-rich audiobook player built with React Native and Expo. Enjoy your favorite audiobooks with an intuitive iOS-inspired interface, complete with dark mode support and customizable playback settings.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Expo](https://img.shields.io/badge/Expo-SDK%2052-000020.svg?logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB.svg?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6.svg?logo=typescript)

## ✨ Features

### 🎵 Core Playback
- **Full playback controls** - Play, pause, skip forward/backward
- **Adjustable playback speed** - 0.75x to 2.0x
- **Progress tracking** - Auto-save every 10 seconds
- **Resume functionality** - Pick up right where you left off
- **Multi-part support** - Handle audiobooks with multiple parts/chapters
- **Background playback** - Continue listening while using other apps

### 📖 Library Management
- **Import audiobooks** - From device storage or cloud services
- **Custom cover images** - Upload your own artwork
- **Edit metadata** - Update titles, authors, and covers
- **Beautiful library view** - Grid layout with cover thumbnails
- **Quick actions** - Edit or delete with action menu

### ⚙️ Customization
- **Dark theme** - Full dark mode support
- **Configurable skip intervals** - 10s, 15s, 30s, 45s, or 60s
- **Default playback speed** - Set your preferred speed
- **Persistent settings** - All preferences saved automatically

### 🎨 User Interface
- **iOS-inspired design** - Clean, modern, and intuitive
- **MiniPlayer** - Quick access from any screen
- **Tab navigation** - Easy switching between Library and Settings
- **Smooth animations** - Polished transitions throughout
- **Responsive layouts** - Optimized for all screen sizes

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.19.4
- Yarn (recommended) or npm
- **Development build** (required for audio): This app uses `react-native-track-player` for background playback and notification controls, which does not work in Expo Go. Create a [development build](https://docs.expo.dev/develop/development-builds/introduction/) with `npx expo run:android` or `npx expo run:ios`.

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-audiobook-app
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

### WSL Users
If you're using WSL, start with tunnel mode:
```bash
yarn start --tunnel
```

## 📁 Project Structure

```
my-audiobook-app/
├── app/                    # Expo Router navigation
│   ├── (tabs)/            # Tab navigation layout
│   └── _layout.tsx        # Root layout with providers
├── components/            # Reusable components
│   └── MiniPlayer.tsx     # Bottom mini player
├── context/               # React Context providers
│   ├── AudiobookContext.tsx   # Audiobook state management
│   ├── SettingsContext.tsx    # App settings
│   └── ThemeContext.tsx       # Theme management
├── screens/               # Main app screens
│   ├── LibraryScreen.tsx  # Audiobook library
│   ├── PlayerScreen.tsx   # Full player view
│   └── SettingsScreen.tsx # App settings
├── services/              # Business logic
│   ├── audioPlayerService.ts  # Audio playback (react-native-track-player)
│   ├── playbackService.ts    # Background/notification media controls
│   └── storageService.ts      # AsyncStorage wrapper
├── types/                 # TypeScript definitions
│   └── audiobook.ts       # Audiobook interfaces
└── constants/             # App constants
    └── colors.ts          # Theme colors
```

## 🛠️ Tech Stack

- **[React Native](https://reactnative.dev/)** - Mobile framework
- **[Expo](https://expo.dev/)** - Development platform
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Expo Router](https://docs.expo.dev/router/introduction/)** - File-based navigation
- **[react-native-track-player](https://rntp.dev/)** - Audio playback, background, lock screen & notification controls
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** - Data persistence
- **[expo-document-picker](https://docs.expo.dev/versions/latest/sdk/document-picker/)** - File selection
- **[expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)** - Image selection

## 📱 Usage

### Adding an Audiobook
1. Tap the **+** button in the Library
2. Select an audio file from your device
3. Enter the title and author (optional)
4. Add a cover image (optional)
5. Tap **Add** to save

### Playing an Audiobook
1. Tap any audiobook in the Library
2. Use the player controls:
   - **Play/Pause** - Center button
   - **Skip backward** - Left button (default: 15s)
   - **Skip forward** - Right button (default: 30s)
   - **Speed** - Tap speed button to adjust
   - **Parts** - Tap part selector for multi-part books

### Customizing Settings
1. Go to the **Settings** tab
2. Tap any setting to change:
   - **Default Playback Speed** - Choose from 0.75x to 2.0x
   - **Skip Forward** - Set interval (10s-60s)
   - **Skip Backward** - Set interval (10s-60s)
   - **Dark Theme** - Toggle dark mode

## 🎨 Theming

The app supports both light and dark themes. Toggle between them in Settings → Appearance → Dark Theme.

**Light Theme:**
- Clean, bright interface
- High contrast for readability
- iOS-inspired colors

**Dark Theme:**
- Easy on the eyes
- OLED-friendly dark grays
- Reduced eye strain

## 🧪 Testing

Run tests with vitest:
```bash
yarn test
```

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Icons from [Ionicons](https://ionic.io/ionicons)
- Audio playback and notification controls powered by [react-native-track-player](https://rntp.dev/)

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Made with ❤️ using React Native and Expo

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
