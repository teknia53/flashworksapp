# FlashWorks — Biblical Greek Flashcard App

A native iOS flashcard app for Biblical Greek vocabulary study. Converted from the desktop Xojo app by Teknia Software. Fully offline — no server, no accounts, no internet required.

## Quick Start

```bash
git clone https://github.com/tylermounce/FlashWorksApp.git
cd FlashWorksApp
npm install
npx expo start --dev-client
```

Press `i` to open on iOS Simulator (requires Xcode with iOS Simulator runtime installed).

## Tech Stack

| Layer | Tool | Version |
|-------|------|---------|
| Framework | Expo (managed) | SDK 54 |
| Language | TypeScript | 5.9 |
| Navigation | Expo Router (file-based tabs) | 6.x |
| Database | expo-sqlite (local on-device) | 16.x |
| Animations | react-native-reanimated | 4.x |
| Gestures | react-native-gesture-handler | 2.x |
| Haptics | expo-haptics | 15.x |

## Project Structure

```
FlashWorksApp/
├── app/                          # Expo Router pages
│   ├── _layout.tsx               # Root layout (fonts, providers)
│   ├── index.tsx                 # Redirects to Study tab
│   └── (tabs)/
│       ├── _layout.tsx           # Bottom tab navigator (4 tabs)
│       ├── study.tsx             # Main quiz screen
│       ├── library.tsx           # Word browser + CRUD
│       ├── stats.tsx             # Session statistics
│       └── settings.tsx          # Preferences & filters
├── assets/
│   ├── databases/FlashWorks.sqlite  # Bundled vocabulary database (1,127 words)
│   ├── fonts/                       # GentiumPlus (Greek), Inter (UI)
│   └── images/                      # App icon, splash, professor character
├── src/
│   ├── db/
│   │   ├── database.ts           # DB init, copy asset to document dir
│   │   ├── queries.ts            # All SQL operations
│   │   └── types.ts              # FlashWord, CodesConfig interfaces
│   ├── state/
│   │   ├── DatabaseContext.tsx    # DB connection provider
│   │   ├── StudyContext.tsx       # Quiz state machine (core engine)
│   │   └── PreferencesContext.tsx # Filter/display preferences
│   ├── hooks/
│   │   ├── useDifficultyAdjust.ts  # Counter-based difficulty algorithm
│   │   ├── useAutoTimer.ts         # Auto-reveal timer
│   │   ├── useDynamicFontSize.ts   # Greek text scaling
│   │   ├── useHaptics.ts           # Tactile feedback
│   │   └── useAudioPlayer.ts       # Audio (placeholder — needs .mp3 files)
│   ├── components/
│   │   ├── study/   (FlashCard, SwipeableCard, StudyControls, AutoTimer, GreekText, MeaningText)
│   │   ├── library/ (WordRow, WordForm)
│   │   ├── stats/   (StatCard, ErrorListItem)
│   │   └── ui/      (Section, SettingRow, RangeDisplay, TypeToggle)
│   ├── utils/
│   │   ├── shuffle.ts            # Fisher-Yates shuffle
│   │   ├── importParser.ts       # Tab-delimited text → words
│   │   └── exportFormatter.ts    # Words → tab-delimited text
│   └── theme/
│       ├── colors.ts             # Warm brown/gold palette (light + dark)
│       ├── typography.ts         # Font families
│       ├── spacing.ts            # Spacing tokens
│       └── useTheme.ts           # Theme hook
├── eas.json                      # EAS Build configuration
├── app.json                      # Expo configuration
└── metro.config.js               # Asset extensions (.sqlite)
```

## App Features

### Study Tab (default)
- Manual mode: tap to reveal, then Right/Wrong buttons
- Auto mode: timer auto-reveals, you choose Right/Wrong manually
- Swipe right = correct, swipe left = wrong
- Card flip animation, haptic feedback
- Stop button to exit study session

### Library Tab
- Search all 1,127 Greek words
- Add, edit, delete words
- Import from tab-delimited text files
- Export word lists

### Stats Tab
- Words studied, errors, accuracy %, elapsed time
- Error list showing missed words
- "Drill Missed Words" for focused review
- Reset session

### Settings Tab
- Filter by difficulty (1-5), chapter, frequency, word type
- Font size controls (Greek and meaning text)
- Auto-difficulty toggle
- Auto mode timer (default 5 seconds)

## Core Business Logic

### Difficulty Auto-Adjustment
Each word has a `dbCounter` (1-7, starts at 4 = neutral):
- **Right answer**: counter++ → at 7: difficulty decreases, counter resets to 4
- **Wrong answer**: counter-- → at 1: difficulty increases, counter resets to 4
- Difficulty bounds: 1 (easiest) to 5 (hardest)
- Toggleable per-word and globally

### Database
- SQLite bundled in app assets, copied to device document directory on first launch
- All changes (difficulty updates, word edits) persist locally
- Two tables: `flash` (vocabulary) and `codes` (config/preferences)

## Testing

```bash
npm test
```

24 tests across 4 suites:
- `difficultyAdjust.test.ts` — 12 tests (counter logic, boundary clamps, full cycles)
- `shuffle.test.ts` — 6 tests (length, elements, immutability, randomness)
- `importParser.test.ts` — 5 tests (parsing, defaults, empty lines)
- `exportFormatter.test.ts` — 3 tests (single/multiple/empty export)

## Brand

- **Colors**: Warm brown `#4A2E1F` + gold `#C4941A` on parchment `#FAF7F2`
- **Greek font**: GentiumPlus (professional Biblical Greek)
- **UI font**: Inter
- **Icon**: Professor character on dark brown background

## EAS Build Profiles

| Profile | Purpose | Command |
|---------|---------|---------|
| development | Simulator testing | `eas build --profile development --platform ios` |
| preview | TestFlight (internal) | `eas build --profile preview --platform ios` |
| production | App Store release | `eas build --profile production --platform ios` |

## Expo Project

- **Owner**: @tylermounce
- **Project**: FlashWorksApp
- **Dashboard**: https://expo.dev/accounts/tylermounce/projects/FlashWorksApp
