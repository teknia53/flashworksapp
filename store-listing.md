# FlashWorks — App Store Connect Listing

Copy-paste source for App Store Connect. Field limits are noted in each heading.
Character counts below were measured against the exact text in the code blocks.

App Store Connect app: `ascAppId 6792080725` · Bundle ID `com.flashworks.app` · Team `G3G3GEQKU6`

---

## App Name (30 char limit) — 26 chars

```
FlashWorks: Biblical Greek
```

## Subtitle (30 char limit) — 25 chars

```
Greek Vocabulary Practice
```

## Promotional Text (170 char limit) — 149 chars

Editable any time without submitting a new build. Use it for seasonal notes
("New semester? Start at chapter 4.") once the app is live.

```
Master Biblical Greek vocabulary with flashcards that adapt as you learn. 1,127 words, drill your misses, works entirely offline. No account, no ads.
```

## Description (4,000 char limit) — 1,902 chars

```
FlashWorks turns Biblical Greek vocabulary into something you can actually finish.

Built on the vocabulary from Basics of Biblical Greek, FlashWorks gives you 1,127 Greek words with meanings and principal parts, ready to study the moment you open the app. No sign-up, no subscription, no internet connection required.

SMART FLASHCARDS THAT ADAPT

Every word carries its own difficulty rating. Get a word right several times and FlashWorks quietly demotes it so you see it less. Miss it and the word climbs back into rotation. Your deck reshapes itself around what you actually struggle with, so you spend your time on the words that need it.

STUDY THE WAY YOU LIKE

• Tap to reveal the meaning, then mark yourself right or wrong
• Or swipe — right for correct, left for missed
• Auto mode reveals each card on a timer you set, for hands-free review
• Card flip animations and haptic feedback keep the rhythm going

STUDY EXACTLY WHAT YOU NEED

Filter your session by chapter, difficulty level, word frequency, and part of speech — nouns, verbs, adjectives, prepositions, and more. Working through chapter 12 this week? Set the range and study only that. Cramming the highest-frequency words before an exam? Filter by frequency instead.

SEE WHERE YOU STAND

The stats screen tracks words studied, errors, accuracy, and elapsed time for every session, and lists exactly which words you missed. One tap drills those missed words until they stick.

MAKE IT YOUR OWN

Add your own words, edit any entry, or delete what you don't need. Import word lists from tab-delimited text files and export your deck back out whenever you want.

BUILT FOR READING GREEK

Greek is set in a classic serif face that renders accents and breathing marks cleanly, and you can size the Greek and the English independently until both read comfortably. Full dark mode support for late-night study.

Everything stays on your device. FlashWorks collects nothing.
```

## Keywords (100 char limit, comma-separated, no spaces after commas) — 98 chars

```
greek,koine,biblical,vocabulary,flashcards,seminary,mounce,bible,testament,memorize,review,offline
```

Note: your app name already covers "FlashWorks" and "Biblical Greek" — Apple indexes
the name and subtitle too, so don't waste keyword characters repeating them.

## What's New — 1.0 initial release

Not required for a first submission. If App Store Connect asks:

```
First release of FlashWorks for iPhone and iPad.
```

---

## App Review Information

### Notes for the Reviewer

```
FlashWorks is an offline Biblical Greek vocabulary flashcard app.

No account, login, or internet connection is required to use any feature — the reviewer can exercise the entire app immediately on launch. There is no demo account to provide because there are no accounts.

All 1,127 vocabulary words ship inside the app as a bundled SQLite database, which is copied to the app's document directory on first launch. All study progress, difficulty adjustments, and user-added words are stored only on the device. No data is transmitted anywhere.

To exercise the main flow: open the Study tab, tap the card to reveal the meaning, then mark it right or wrong (or swipe right/left). The Stats tab shows the session summary and a "Drill Missed Words" option. The Settings tab controls session filters.
```

### Contact

Provided at submission time — Apple requires a real name, phone, and email for review contact.

---

## App Store Connect Configuration

| Field | Value |
|---|---|
| Primary Category | Education |
| Secondary Category | Reference |
| Age Rating | 4+ (no objectionable content) |
| Price | Set at submission |
| Availability | All territories |
| Content Rights | Does not contain third-party content |
| Export Compliance | Already answered in `app.json` via `ITSAppUsesNonExemptEncryption: false` |

### App Privacy — answer "Data Not Collected"

FlashWorks has no analytics, no crash reporting SDK, no ads, and no network calls
that transmit user data. In the App Privacy section, select **"No, we do not collect
data from this app."** That single answer completes the section.

A Privacy Policy URL is still **required** even for apps that collect nothing.
See "Remaining blockers" in the handoff notes.

---

## Claims deliberately kept OUT of this copy

These are not implemented in the shipping build. Do not add them to the listing
until the features actually exist, or the app risks rejection under
App Store Review Guideline 2.3 (Accurate Metadata):

- **Audio pronunciation** — `useAudioPlayer.ts` exists but no `.mp3` files are bundled.
- **Printing error lists** — `expo-print` is installed but not wired to any screen.
- **Syncing / cloud backup** — there is none; storage is local only.

---

## Screenshots

Captured from a Release build on the iOS Simulator, status bar normalized to
Apple's 9:41 / full-signal marketing state.

| Set | Path | Size | Count |
|---|---|---|---|
| iPhone 6.9" | `store-assets/screenshots/iphone-6.9/` | 1320 × 2868 | 6 |
| iPad 13" | `store-assets/screenshots/ipad-13/` | 2064 × 2752 | 4 |

Both sets are at exactly the dimensions App Store Connect expects, so they upload
without resizing. iPad screenshots are **required** because the target ships as
`TARGETED_DEVICE_FAMILY = "1,2"` (iPhone + iPad) and `app.json` sets
`supportsTablet: true`. Dropping iPad support would remove that requirement.

Upload order is the filename order — the first screenshot is the one shown in
search results, so `01-study-home` and `02-flashcard-greek` carry the most weight.

---

## Verified before submission

- `npm test` — 39 tests across 5 suites, all passing
- Release build compiles clean for the iOS Simulator (0 errors)
- App icon: 1024×1024, **no alpha channel** in the generated native asset
  (`ios/FlashWorks/Images.xcassets/AppIcon.appiconset/`) — Expo's prebuild
  flattens the transparency in `assets/images/icon.png` automatically
- Bundle ID `com.flashworks.app` matches between `app.json` and the Xcode project
- `MARKETING_VERSION = 1.0`, `CURRENT_PROJECT_VERSION = 1`
- `ITSAppUsesNonExemptEncryption: false` is set, so export compliance is pre-answered
- App runs correctly on both iPhone 17 Pro Max and iPad Pro 13" simulators

---

## Remaining blockers — these need you

Ordered by what will stop the submission first.

1. **Privacy Policy URL (hard blocker).** App Store Connect will not accept the
   submission without one, even though the app collects nothing. A single static
   page on `billmounce.com` saying FlashWorks collects no data and stores
   everything on-device is sufficient.
2. **Support URL (hard blocker).** Can be a contact page on the same domain.
3. **Production build + upload.** Nothing here is built for the App Store yet —
   the build I made is a simulator build and cannot be submitted:
   ```bash
   eas build --profile production --platform ios
   ```
   then:
   ```bash
   eas submit --platform ios
   ```
   `eas.json` already has the submit credentials (`teknia@mac.com`,
   `ascAppId 6792080725`, team `G3G3GEQKU6`).
4. **Review contact info.** Apple requires a real name, phone, and email.
5. **Price and territory selection.**

## Worth fixing, but not blocking

- **Pronouns are labeled "Adjective."** `ἐγώ`, `σύ`, and `αὐτός` are all stored
  with `dbType = 'A'` in the bundled database, so the Library and the card footer
  display them as *Adjective*. This is inherited from the original Xojo data,
  which had no pronoun category. It is visible in the shipped screenshots and
  will be obvious to anyone who knows Greek. Fixing it properly means adding a
  pronoun type to `WordType` / `WORD_TYPE_LABELS` in `src/db/types.ts` and
  re-typing those rows — worth doing, but it is a content change, not a
  submission requirement.
- **The iPad layout leaves a lot of empty space.** Study and Settings render as a
  centered column with the bottom half of a 13" iPad blank. The Library screen
  uses the space well; the others do not. Not a rejection risk in practice, but
  the iPad screenshots look noticeably sparser than the iPhone ones.
- **GentiumPlus is bundled but never used.** `app/_layout.tsx` loads
  `GentiumPlus-Regular.ttf` and `GentiumPlus-Bold.ttf`, but nothing references
  those families. Every Greek-rendering component hardcodes
  `fontFamily: 'Times New Roman'` — `GreekText.tsx`, `WordRow.tsx`,
  `ErrorListItem.tsx`, `WordForm.tsx` — and the `fontFamilies.greek` token in
  `src/theme/typography.ts` has no consumers at all. So the app ships ~1.7 MB of
  font it never draws with. Two ways out: point the Greek components at
  `'GentiumPlus'` (it is the better face for polytonic Greek), or drop the two
  .ttf files and the `useFonts` entries. Either is fine; shipping both fonts and
  using neither deliberately is the only bad option.
  **The listing copy no longer names a typeface**, so it stays accurate whichever
  way this is resolved.
