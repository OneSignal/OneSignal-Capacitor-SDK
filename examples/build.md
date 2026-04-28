# OneSignal Capacitor Sample App - Build Guide

This document extends the shared build guide with Capacitor-specific details.

**Read the shared guide first:**
https://raw.githubusercontent.com/OneSignal/sdk-shared/refs/heads/main/demo/build.md

Replace `{{PLATFORM}}` with `Capacitor` everywhere in that guide. Everything below either overrides or supplements sections from the shared guide.

---

## Project Setup

Create a new Capacitor + React project at `examples/demo/` (relative to the SDK repo root):

```bash
mkdir -p examples/demo/src
cd examples/demo
bun init -y
bun add @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
bun add @capacitor/keyboard @capacitor/status-bar
bun add react react-dom @ionic/react @ionic/react-router ionicons react-icons
bun add react-router react-router-dom
bun add -d @vitejs/plugin-react @types/react @types/react-dom @types/react-router @types/react-router-dom typescript vite-plus
bunx cap init "OneSignal Demo" com.onesignal.example --web-dir dist
bunx cap add ios
bunx cap add android
```

- TypeScript strict mode enabled
- React + Ionic React for component-based UI with React Router for navigation
- Vite+ (`vite-plus`) with `@vitejs/plugin-react` for bundling, linting, and formatting; output to `dist/` (`webDir` for Capacitor)
- Custom header in `HomeScreen.tsx` with the OneSignal logo and "Capacitor" subtitle (no `IonToolbar` header)
- Reference the OneSignal Capacitor plugin via local tarball:

  ```json
  "onesignal-capacitor-plugin": "file:../../onesignal-capacitor-plugin.tgz"
  ```

### App icons

Each demo's `assets/` directory holds the three 1024x1024 source images that [`@capacitor/assets`](https://capacitorjs.com/docs/guides/splash-screens-and-icons) consumes:

```
assets/
├── icon-only.png         # OneSignal logo on white
├── icon-foreground.png   # OneSignal logo on transparent (Android adaptive foreground)
└── icon-background.png   # solid white                   (Android adaptive background)
```

To (re)generate all native icon assets, run from inside a demo:

```bash
bunx @capacitor/assets generate --ios --android
```

That produces the full Android adaptive icon set (foreground/background mipmaps + `mipmap-anydpi-v26/ic_launcher{,_round}.xml`) and the iOS `AppIcon.appiconset`. No additional steps.

### Build & run scripts

A `setup.sh` script in `examples/` builds the SDK from the repo root, packs it to `onesignal-capacitor-plugin.tgz`, reinstalls it in the demo, runs `vp build`, and runs `bunx cap sync`. `run-android.sh` and `run-ios.sh` list connected devices/simulators, prompt for selection if multiple, and run `bunx cap run`.

`package.json` scripts wire these up:

```json
{
  "scripts": {
    "setup": "../setup.sh",
    "preandroid": "bun run setup",
    "preios": "bun run setup",
    "android": "bash ../run-android.sh",
    "ios": "bash ../run-ios.sh"
  }
}
```

### Capacitor config (`capacitor.config.ts`)

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.onesignal.example',
  appName: 'OneSignal Demo',
  webDir: 'dist',
  ios: {
    handleApplicationNotifications: false,
    webContentsDebuggingEnabled: true,
  },
};

export default config;
```

`handleApplicationNotifications: false` is required on iOS so Capacitor does not intercept notifications before OneSignal's native delegate processes them. `webContentsDebuggingEnabled: true` keeps `WKWebView.isInspectable = true` in Release builds so Appium's XCUITest driver can find the WebView context (test-only convenience).

---

## State Management

Use a single `useOneSignal()` hook (`src/hooks/useOneSignal.ts`) as the central state manager. There is no repository wrapper — the hook calls the OneSignal SDK directly.

- `useState` for reactive state (app id, push subscription id, aliases, tags, emails, SMS, triggers, consent, location, IAM paused, loading, ready)
- `useRef` `requestSequenceRef` discards stale REST results when a newer fetch is in flight
- One `useEffect` registers SDK observers and cleans them up on unmount via `removeEventListener`
- `useCallback` memoizes `fetchUserDataFromApi` so the user-state observer's dependency stays stable
- `OneSignalApiService` (singleton, `src/services/OneSignalApiService.ts`) wraps the REST API (send notification, fetch user, live activity update/end) using `CapacitorHttp` so requests work uniformly across iOS, Android, and the dev browser
- `PreferencesService` (singleton, `src/services/PreferencesService.ts`) wraps `localStorage` for consent, IAM paused, location shared, and external user id. App ID is read from `.env` (`VITE_ONESIGNAL_APP_ID`), not from preferences.
- `mergePairs` and `mergeUnique` helpers in the hook merge REST results into existing in-memory lists so locally-added entries that have not yet round-tripped through the API are preserved

### SDK state restoration

In `useOneSignal`'s `load()`, restore SDK state from `localStorage` BEFORE `initialize`:

```ts
OneSignal.Debug.setLogLevel(LogLevel.Verbose);
OneSignal.setConsentRequired(cachedConsentRequired);
OneSignal.setConsentGiven(cachedConsentGiven);
OneSignal.initialize(appId);
```

Then AFTER initialize:

```ts
OneSignal.LiveActivities.setupDefault({ enablePushToStart: true, enablePushToUpdate: true });
OneSignal.InAppMessages.setPaused(cachedIamPaused);
OneSignal.Location.setShared(cachedLocationShared);
```

Read UI state directly from the SDK once it's initialized (push subscription, permission, external id) instead of from cache.

---

## Capacitor-Specific UI Details

### Notification Permission

- `useOneSignal` exposes `isReady` (set after the initial load completes) and `promptPush()`
- `HomeScreen` calls `promptPush()` in a `useEffect` gated by `isReady`

### Loading State

- No global overlay; section components (Aliases, Emails, SMS, Tags) render an inline spinner in the empty-state slot when `isLoading` is true
- Stale-result protection via `requestSequenceRef` in the hook

### Toast / SnackBar

- Use Ionic's `IonToast` from `HomeScreen`, fed by a local `showToast(message)` helper that hides the previous toast before showing the next

### Send In-App Message Icons

Use `react-icons/md`: `MdVerticalAlignTop`, `MdVerticalAlignBottom`, `MdCropSquare`, `MdFullscreen`.

### Modals

All modals live in `src/components/modals/` and render through Ionic's `IonModal`. Single-field prompts share `SingleInputModal`; key/value prompts share `PairInputModal`; bulk add/remove use `MultiPairInputModal` and `MultiSelectRemoveModal`.

### Accessibility (Appium)

Apply test ids using `data-testid` on Ionic React elements; the shared Appium suite under `sdk-shared/appium/tests/` queries by these ids.

---

## iOS Project Setup

The iOS Xcode project includes the main App target plus a Notification Service Extension and a Widget Extension (for Live Activities).

- `ios/App/App/App.entitlements` — push notification (`aps-environment`) + app groups
- `ios/App/OneSignalNotificationServiceExtension/NotificationService.swift` — forwards to `OneSignalExtension` for rich notifications
- `ios/App/OneSignalWidget/OneSignalWidgetLiveActivity.swift` — Live Activity widget; replace contents with the shared reference at `https://raw.githubusercontent.com/OneSignal/sdk-shared/main/demo/LiveActivity.swift`

### Swift Package Manager

The demo uses SPM instead of CocoaPods. Capacitor manages App-target plugin dependencies through `ios/App/CapApp-SPM/Package.swift`. The two extension targets reference the OneSignal XCFramework Swift package directly:

- App target → `CapApp-SPM` local package (Capacitor + plugin products, regenerated by `cap sync`)
- `OneSignalNotificationServiceExtension` → `OneSignalExtension` product from `https://github.com/OneSignal/OneSignal-XCFramework`
- `OneSignalWidget` → `OneSignalFramework` product from `https://github.com/OneSignal/OneSignal-XCFramework` (transitively pulls in `OneSignalLiveActivities`)

`ios/debug.xcconfig` is wired up as the App target's Debug base configuration so Capacitor's debug-only behaviors stay enabled.

The plugin's SPM product is named `OnesignalCapacitorPlugin` to match Capacitor's derived package name (`fixName` converts `onesignal-capacitor-plugin` → `OnesignalCapacitorPlugin`).

To migrate an existing CocoaPods-based project to SPM, run `bunx cap spm-migration-assistant` and add the local `CapApp-SPM` package and any extension dependencies through Xcode's Package Dependencies tab.

---

## Platform Config

### Android

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

### Custom Notification Sound

Copy `vine_boom.wav` from [sdk-shared/assets](https://github.com/OneSignal/sdk-shared/tree/main/assets) and place in:

- **Android**: `android/app/src/main/res/raw/vine_boom.wav`
- **iOS**: `ios/App/App/vine_boom.wav` (add to the Xcode project as a bundle resource)

---

## File Structure

```
examples/
├── setup.sh              # Build SDK, pack, install, vite build, cap sync
├── run-android.sh        # Device selection + cap run android
├── run-ios.sh            # Simulator selection + cap run ios
├── build.md              # This file
└── demo/
    ├── index.html
    ├── capacitor.config.ts
    ├── vite.config.ts
    ├── tsconfig.json
    ├── package.json
    ├── .env.example
    ├── assets/
    │   ├── icon-only.png         # OneSignal logo on white
    │   ├── icon-foreground.png   # Android adaptive icon foreground (transparent)
    │   └── icon-background.png   # Android adaptive icon background (solid white)
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx             # IonApp + IonReactRouter, StatusBar config
    │   ├── vite-env.d.ts
    │   ├── assets/
    │   │   └── onesignal_logo.svg
    │   ├── hooks/
    │   │   └── useOneSignal.ts
    │   ├── models/
    │   │   ├── NotificationType.ts
    │   │   └── UserData.ts
    │   ├── services/
    │   │   ├── OneSignalApiService.ts
    │   │   ├── PreferencesService.ts
    │   │   └── TooltipHelper.ts
    │   ├── pages/
    │   │   ├── HomeScreen.tsx
    │   │   ├── HomeScreen.css
    │   │   ├── Secondary.tsx
    │   │   └── Secondary.css
    │   ├── components/
    │   │   ├── ActionButton.tsx
    │   │   ├── ListWidgets.tsx
    │   │   ├── SectionCard.tsx
    │   │   ├── ToggleRow.tsx
    │   │   ├── modals/
    │   │   │   ├── ModalShell.tsx
    │   │   │   ├── SingleInputModal.tsx
    │   │   │   ├── PairInputModal.tsx
    │   │   │   ├── MultiPairInputModal.tsx
    │   │   │   ├── MultiSelectRemoveModal.tsx
    │   │   │   ├── OutcomeModal.tsx
    │   │   │   ├── TrackEventModal.tsx
    │   │   │   ├── CustomNotificationModal.tsx
    │   │   │   └── TooltipModal.tsx
    │   │   └── sections/
    │   │       ├── AppSection.tsx
    │   │       ├── UserSection.tsx
    │   │       ├── PushSection.tsx
    │   │       ├── SendPushSection.tsx
    │   │       ├── InAppSection.tsx
    │   │       ├── SendIamSection.tsx
    │   │       ├── AliasesSection.tsx
    │   │       ├── EmailsSection.tsx
    │   │       ├── SmsSection.tsx
    │   │       ├── TagsSection.tsx
    │   │       ├── OutcomesSection.tsx
    │   │       ├── TriggersSection.tsx
    │   │       ├── CustomEventsSection.tsx
    │   │       ├── LocationSection.tsx
    │   │       └── LiveActivitySection.tsx
    │   ├── theme/
    │   │   └── variables.css
    │   └── utils/
    │       └── maskValue.ts        # E2E_MODE bullet masking helper
    ├── android/                    # Capacitor Android project
    └── ios/
        └── App/
            ├── App/                                    # Main app target
            │   ├── App.entitlements
            │   ├── vine_boom.wav
            │   └── ...
            ├── OneSignalNotificationServiceExtension/  # NSE target
            │   ├── NotificationService.swift
            │   ├── OneSignalNotificationServiceExtension.entitlements
            │   └── Info.plist
            ├── OneSignalWidget/                         # Widget + Live Activity
            │   ├── OneSignalWidgetBundle.swift
            │   ├── OneSignalWidgetLiveActivity.swift
            │   └── Info.plist
            └── CapApp-SPM/                              # Capacitor-managed SPM
                ├── Package.swift                        # Auto-generated by cap sync
                └── Sources/CapApp-SPM/CapApp-SPM.swift
```

A second variant lives at `examples/demo_pods/` that mirrors `demo/` but uses CocoaPods for iOS instead of SPM. The TypeScript / React source is kept in sync with `demo/`.

---

## Capacitor Best Practices

- Run `bunx cap sync` after every native dependency or web-asset change to push `dist/` into the platform projects and regenerate `CapApp-SPM/Package.swift`
- Prefer the async getters (`getIdAsync`, `getOptedInAsync`, `hasPermission`) over the deprecated sync property accessors
- Keep `handleApplicationNotifications: false` in `capacitor.config.ts` so OneSignal owns the iOS notification lifecycle
- Use `CapacitorHttp` for REST calls so the same code path works on iOS, Android, and the dev browser without CORS workarounds
- Name the iOS SPM product `OnesignalCapacitorPlugin` (Capacitor's `fixName` derivation) — renaming will break `cap sync`
