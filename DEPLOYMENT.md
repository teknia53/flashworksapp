# FlashWorks — Deployment & Handoff Guide

## For the Developer Taking Over

This document covers everything you need to clone, modify, build, and submit FlashWorks to the App Store.

---

## 1. Environment Setup

### Prerequisites
- **macOS** with Xcode installed (15.2+ for simulator, latest for App Store builds)
- **Node.js** 18+ (recommend 22 LTS)
- **Expo account** — sign up at [expo.dev](https://expo.dev)
- **Apple Developer account** ($99/year) — required for TestFlight and App Store

### Clone and Install

```bash
git clone https://github.com/tylermounce/FlashWorksApp.git
cd FlashWorksApp
npm install
```

### EAS CLI Setup

```bash
npm install -g eas-cli
eas login          # Log in with Expo credentials
eas init           # Link to the Expo project (already linked to @tylermounce)
```

> **Note**: If you're working under a different Expo account, update the `owner` and `extra.eas.projectId` fields in `app.json`.

### Run Locally

```bash
# First, build a development client
eas build --profile development --platform ios

# Then start the dev server
npx expo start --dev-client
# Press 'i' to open on iOS Simulator
```

---

## 2. Making Changes

### Code Structure at a Glance

| What you want to change | Where to look |
|--------------------------|---------------|
| Quiz behavior / study flow | `src/state/StudyContext.tsx` |
| Database queries | `src/db/queries.ts` |
| Difficulty algorithm | `src/hooks/useDifficultyAdjust.ts` |
| Preferences / filters | `src/state/PreferencesContext.tsx` |
| Screen UI | `app/(tabs)/study.tsx`, `library.tsx`, `stats.tsx`, `settings.tsx` |
| Flash card appearance | `src/components/study/FlashCard.tsx` |
| Colors / theme | `src/theme/colors.ts` |
| Fonts | `src/theme/typography.ts` + `app/_layout.tsx` (font loading) |
| App icon / splash | `assets/images/` + `app.json` (splash config) |
| Database schema | `assets/databases/FlashWorks.sqlite` + `src/db/types.ts` |

### Development Workflow

1. Start the dev server: `npx expo start --dev-client`
2. Make changes — the app hot-reloads automatically
3. Run tests: `npm test`
4. Commit and push:
   ```bash
   git add -A
   git commit -m "Description of changes"
   git push
   ```

### Key Conventions

- **State management**: React Context + useReducer. No Redux. State flows: `DatabaseContext` → `PreferencesContext` → `StudyContext`
- **Styling**: Inline styles using theme tokens from `src/theme/`. No StyleSheet files — colors come from `useTheme()` hook
- **Database**: All SQL lives in `src/db/queries.ts`. The database is local SQLite on the device — no cloud, no API
- **File-based routing**: Pages go in `app/`, components go in `src/components/`

### Adding a New Screen

1. Create `app/(tabs)/newscreen.tsx`
2. Add a `<Tabs.Screen>` entry in `app/(tabs)/_layout.tsx`
3. Pick an icon from `@expo/vector-icons` (Ionicons)

### Modifying the Database

If you need to change the SQLite schema:
1. Edit the `.sqlite` file directly (use DB Browser for SQLite or similar)
2. Replace `assets/databases/FlashWorks.sqlite`
3. Update `src/db/types.ts` with any new/changed columns
4. Update `src/db/queries.ts` with new queries
5. **Important**: Users who already have the app will keep their old database. You'll need migration logic if the schema changes after release.

---

## 3. Building for TestFlight

### First Time Setup

1. **Apple Developer Program**: Enroll at [developer.apple.com/programs](https://developer.apple.com/programs/) ($99/year)
2. **App Store Connect**: Create your app at [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - Bundle ID: `com.flashworks.app`
   - Name: FlashWorks
   - Category: Education
3. **Get your credentials**:
   - `Apple ID` — your Apple ID email
   - `Apple Team ID` — found in [developer.apple.com/account](https://developer.apple.com/account) under Membership
   - `ASC App ID` — found in App Store Connect → your app → General → Apple ID

### Add Submit Config

Update `eas.json` to add the submit section:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABC1234DEF"
      }
    }
  }
}
```

### Build and Submit

```bash
# Build for TestFlight
eas build --profile preview --platform ios

# Or build for App Store release
eas build --profile production --platform ios

# Submit to App Store Connect / TestFlight
eas submit --platform ios
```

EAS handles code signing and provisioning profiles automatically. It will prompt for your Apple ID password on first run.

---

## 4. App Store Submission Checklist

### Required Before Submission

Listing copy, keywords, review notes, and the full remaining-blockers list live in
[`store-listing.md`](./store-listing.md). This is the short checklist.

- [x] **App Icon**: 1024x1024, alpha flattened by prebuild (`assets/images/icon.png`)
- [x] **Screenshots**: captured in `store-assets/screenshots/`
  - iPhone 6.9" — 1320 × 2868, 6 shots
  - iPad 13" — 2064 × 2752, 4 shots (required: the target is iPhone + iPad)
  - Shows: Study home, flashcard front/back, Stats, Settings filters, Library
- [x] **App Description**: written — see `store-listing.md`
- [x] **Age Rating**: 4+ (no objectionable content)
- [x] **Privacy**: "Data Not Collected" — the app has no network calls or analytics
- [ ] **Privacy Policy URL**: still needed. Required even for offline apps. A simple
      page stating "FlashWorks does not collect any data" is enough.
- [ ] **Support URL**: still needed.
- [ ] **Production build + upload**: `eas build --profile production --platform ios`,
      then `eas submit --platform ios`.

> Screenshot sizes: Apple's current required set is 6.9" iPhone and 13" iPad.
> The 6.7"/5.5" sizes this checklist used to name are no longer what App Store
> Connect asks for.

### App Store Description

Moved to [`store-listing.md`](./store-listing.md), which holds the final copy
along with the subtitle, promotional text, and keywords, each checked against
App Store Connect's character limits.

### Review Notes for Apple

```
FlashWorks is an offline Biblical Greek flashcard study tool. No internet connection is required. No user data is collected. The app bundles a local SQLite database of vocabulary words.
```

---

## 5. Ongoing Maintenance

### Updating Expo SDK

Expo releases new SDKs ~quarterly. To upgrade:

```bash
npx expo install expo@latest
npx expo install --fix   # Updates all packages to compatible versions
```

Test thoroughly after upgrading — SDK updates can include breaking changes.

### Common Tasks

| Task | Command |
|------|---------|
| Run tests | `npm test` |
| Start dev server | `npx expo start --dev-client` |
| Build for simulator | `eas build --profile development --platform ios` |
| Build for TestFlight | `eas build --profile preview --platform ios` |
| Build for App Store | `eas build --profile production --platform ios` |
| Submit to App Store | `eas submit --platform ios` |
| Check build status | Visit [expo.dev](https://expo.dev) dashboard |
| Update OTA (JS only) | `eas update` (requires expo-updates setup) |

### What's Not Yet Implemented

1. **Audio pronunciation** — The hook exists (`useAudioPlayer.ts`) but no .mp3 files are bundled. The database has `dbSayWordFile` fields with filenames like `aggelo`, `amhn`. If audio files become available, place them in `assets/audio/` and wire up the hook.
2. **Printing error lists** — `expo-print` is installed but not wired to the Stats screen.
3. **Database migration** — No versioning system for schema changes post-release. Add one before modifying the SQLite schema.

---

## 6. Credentials & Accounts

| Service | Purpose | Who Has Access |
|---------|---------|----------------|
| GitHub (`tylermounce/FlashWorksApp`) | Source code | Tyler Mounce |
| Expo (`@tylermounce/FlashWorksApp`) | Build service | Tyler Mounce |
| Apple Developer Program | App Store submission | TBD |
| App Store Connect | App listing & TestFlight | TBD |

### Transferring Expo Project Ownership

If a different developer needs to own the Expo project:
1. Go to [expo.dev](https://expo.dev) → Project Settings → Transfer
2. Or create a new Expo project under their account and update `app.json` with the new `projectId`

### Transferring GitHub Repo

1. Go to repo Settings → Collaborators → Add the developer
2. Or transfer ownership: Settings → General → Transfer repository
