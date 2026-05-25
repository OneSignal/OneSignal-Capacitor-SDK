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
bun add @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen
bun add react react-dom @ionic/react @ionic/react-router ionicons react-icons
bun add react-router react-router-dom
bun add -d @vitejs/plugin-react @types/react @types/react-dom @types/react-router @types/react-router-dom typescript
bunx cap init "OneSignal Demo" com.onesignal.example --web-dir dist
bunx cap add ios
bunx cap add android
```

- TypeScript strict mode enabled
- React + Ionic React for component-based UI with React Router for navigation
- Build chain uses the `vp` CLI (see `demo/README.md`); `vite-plus` is imported by `vite.config.ts` but not declared in package.json. Output goes to `dist/` (`webDir` for Capacitor).
- Custom header in `HomeScreen.tsx` with the OneSignal logo and "Capacitor" subtitle (no `IonToolbar` header)
- Reference the OneSignal Capacitor plugin via local tarball:

  ```json
  "@onesignal/capacitor-plugin": "file:../../onesignal-capacitor-plugin.tgz"
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

A `setup.sh` script in `examples/` builds the SDK from the repo root, packs it to `onesignal-capacitor-plugin.tgz`, reinstalls it in the demo, runs `vp build`, and runs `bunx cap sync`. `run-android.sh` and `run-ios.sh` list connected devices/simulators, prompt for selection if multiple, and run `npx cap run`. `dev-android.sh` and `dev-ios.sh` start a Vite dev server and point the platform's `capacitor.config.json` at it for live-reload runs.

`package.json` scripts wire these up:

```json
{
  "scripts": {
    "setup": "../setup.sh",
    "preandroid": "vp run setup",
    "preios": "vp run setup",
    "predev:android": "vp run setup",
    "predev:ios": "vp run setup",
    "android": "bash ../run-android.sh",
    "ios": "bash ../run-ios.sh",
    "dev:android": "bash ../dev-android.sh",
    "dev:ios": "bash ../dev-ios.sh",
    "build": "vp build",
    "dev": "vp dev --host --port 5173",
    "clean:android": "rm -rf android/app/build android/app/.cxx android/build",
    "clean:ios": "rm -rf ios/App/build ios/DerivedData ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/swiftpm"
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
  loggingBehavior: 'debug',
  ios: {
    handleApplicationNotifications: false,
    webContentsDebuggingEnabled: true,
  },
  // The real config also includes a `plugins.SplashScreen` block
  // (`launchAutoHide: false`, `launchShowDuration: 2000`, white background,
  // no spinner) -- omitted here for brevity. See `Splash screen` below.
};

export default config;
```

`handleApplicationNotifications: false` is required on iOS so Capacitor does not intercept notifications before OneSignal's native delegate processes them. `webContentsDebuggingEnabled: true` keeps `WKWebView.isInspectable = true` in Release builds so Appium's XCUITest driver can find the WebView context (test-only convenience). `loggingBehavior: 'debug'` lets the bridge surface JS console + native plugin logs in dev builds.

---

## State Management

State lives in a single `useOneSignal()` hook (`src/hooks/useOneSignal.ts`) called once from `HomeScreen`. No Context+reducer, no repository class, no provider wrapper (only a separate `ToastProvider` for snackbars).

### SDK init

Module-scoped `initOneSignal()` runs at import time of `useOneSignal.ts` -- before any React render. It restores cached consent flags from `PreferencesService` BEFORE `OneSignal.initialize(...)`, then restores IAM paused / location shared AFTER initialize, then calls `OneSignal.login(storedExternalUserId)` if a cached external id exists. The inner hook `load()` only reads SDK state once the bridge is ready (`isReady`).

```ts
OneSignal.Debug.setLogLevel(LogLevel.Verbose);
OneSignal.setConsentRequired(preferences.getConsentRequired());
OneSignal.setConsentGiven(preferences.getConsentGiven());
void OneSignal.initialize(RESOLVED_APP_ID);

void OneSignal.LiveActivities.setupDefault({ enablePushToStart: true, enablePushToUpdate: true });
OneSignal.InAppMessages.setPaused(preferences.getIamPaused());
OneSignal.Location.setShared(preferences.getLocationShared());

const storedExternalUserId = preferences.getExternalUserId();
if (storedExternalUserId) void OneSignal.login(storedExternalUserId);
```

### Stale-result protection

`requestSequenceRef` in the hook drops out-of-date REST results from rapid back-to-back fetches.

### REST client

`OneSignalApiService` (singleton, `src/services/OneSignalApiService.ts`) uses `CapacitorHttp` for push sends, user fetch, and Live Activity update/end. Retries up to 5x on transient subscription-indexing failures.

### Preferences

`PreferencesService` (singleton, `src/services/PreferencesService.ts`) wraps `localStorage` for consent, IAM paused, location shared, and external user id. App ID is read from `.env` (`VITE_ONESIGNAL_APP_ID`), not from preferences.

### List merging

`mergePairs` and `mergeUnique` helpers in the hook merge REST results into existing in-memory lists so locally-added entries that have not yet round-tripped through the API are preserved.

### Environment variables

The demo reads three Vite env vars at build time:

- `VITE_ONESIGNAL_APP_ID` -- defaults to `77e32082-ea27-42e3-a898-c72e141824ef` if unset.
- `VITE_ONESIGNAL_API_KEY` -- REST auth for Live Activity update/end via `Authorization: Key ...`. `LiveActivitySection` is gated UI-wise when missing.
- `VITE_ONESIGNAL_ANDROID_CHANNEL_ID` -- channel id used by the WITH SOUND push payload on Android.

---

## Capacitor-Specific UI Details

### Notification Permission

- `useOneSignal` exposes `isReady` (set after the initial load completes) and `promptPush()`
- `HomeScreen` calls `promptPush()` in a `useEffect` gated by `isReady`

### Loading State

- No global overlay; section components (Aliases, Emails, SMS, Tags) render an inline spinner in the empty-state slot when `isLoading` is true
- Stale-result protection via `requestSequenceRef` in the hook

### Toast / SnackBar

- Single `ToastProvider` (`src/components/ToastProvider.tsx`) is rendered inside `App` (wrapping `IonReactRouter`) and owns the Ionic `<IonToast>` state.
- The provider exports a `useSnackbar()` hook returning `(message: string) => void`. Section components call `const showSnackbar = useSnackbar()` at the top of the component body and invoke it from `onSubmit` handlers for the allowed actions (Outcomes, Custom Events, Location check).
- Replace-on-show: the provider clears its `toast` React state, then re-sets it via `queueMicrotask(() => setToast({ id, message }))` so `<IonToast>` unmounts and remounts with a fresh key, restarting its 3s timer.
- Duration is the module-level constant `TOAST_DURATION_MS = 3000`, passed as `<IonToast duration={TOAST_DURATION_MS} />`.
- No hand-rolled module-level toast stores, separate host components, or `useSyncExternalStore` plumbing -- the React Context + hook in `ToastProvider` is the only access path.
- `useOneSignal` / the SDK context must not hold toast state or expose a `showToast` method.

### Modals

- `HomeScreen` owns layout + `TooltipModal` only. Tooltip visibility is a single local `tooltipOpen` boolean; action dialog state never lives here or in the SDK context.
- Sections render modals as siblings of `SectionCard`, with one local `useState` boolean per dialog (`open`, `addOpen`, `removeOpen`, ...). The section's button click sets the flag to `true`; the modal's `onSubmit` calls the SDK callback received via props, then closes the modal and (where applicable) calls `showSnackbar`.
- Shared modal primitives live in `src/components/modals/` and render through a custom `ModalShell` (`src/components/ModalShell.tsx`) using a CSS backdrop + card pattern. The demo does NOT use `<IonModal>`. Single-field prompts share `SingleInputModal`; key/value prompts share `PairInputModal`; bulk add/remove use `MultiPairInputModal` and `MultiSelectRemoveModal`. Outcome/TrackEvent/CustomNotification/Tooltip modals also live here.
- Login uses `SingleInputModal` inline in `UserSection.tsx`; there is no dedicated `LoginModal` component.
- Do not centralize action dialogs in a `DialogState` union on `HomeScreen` and do not lift dialog visibility into the SDK context.

### Secondary route

The `/secondary` page (`src/pages/Secondary.tsx`) uses a standard `IonToolbar` header, in contrast to the custom header on `HomeScreen` (OneSignal logo + "Capacitor" subtitle, no `IonToolbar`).

### Accessibility (Appium)

Apply test ids using `data-testid` on Ionic React elements; the shared Appium suite under `sdk-shared/appium/tests/` queries by these ids.

---

## iOS Project Setup

The iOS Xcode project includes the main App target plus a Notification Service Extension and a Widget Extension (for Live Activities).

- `ios/App/App/AppDebug.entitlements` and `ios/App/App/AppRelease.entitlements` -- push notification (`aps-environment`) + app groups, per build configuration
- `ios/App/OneSignalNotificationServiceExtension/NotificationService.swift` -- forwards to `OneSignalExtension` for rich notifications
- `ios/App/OneSignalNotificationServiceExtension/OneSignalNotificationServiceExtensionDebug.entitlements` -- only the debug entitlements file is committed for the NSE; the release variant is not in the demo today
- `ios/App/OneSignalWidget/OneSignalWidgetLiveActivity.swift` -- Live Activity widget; replace contents with the shared reference at `https://raw.githubusercontent.com/OneSignal/sdk-shared/main/demo/LiveActivity.swift`

### Swift Package Manager

The demo uses SPM instead of CocoaPods. Capacitor manages App-target plugin dependencies through `ios/App/CapApp-SPM/Package.swift`. The two extension targets reference the OneSignal XCFramework Swift package directly:

- App target -> `CapApp-SPM` local package (Capacitor + plugin products, regenerated by `cap sync`)
- `OneSignalNotificationServiceExtension` -> `OneSignalExtension` product from `https://github.com/OneSignal/OneSignal-XCFramework`
- `OneSignalWidget` -> `OneSignalFramework` product from `https://github.com/OneSignal/OneSignal-XCFramework` (transitively pulls in `OneSignalLiveActivities`)

The committed `project.pbxproj` has empty `packageProductDependencies` for both extension targets; the NSE Frameworks phase is empty; the widget links only `WidgetKit` + `SwiftUI`. Swift sources do `import OneSignalExtension` and `import OneSignalLiveActivities` -- meaning users will need to add these SPM dependencies through Xcode's Package Dependencies tab the first time they open the project.

`ios/debug.xcconfig` is wired up as the App target's Debug base configuration so Capacitor's debug-only behaviors stay enabled.

The plugin's SPM product is named `OnesignalCapacitorPlugin` to match Capacitor's derived package name (`fixName` converts `@onesignal/capacitor-plugin` -> `OnesignalCapacitorPlugin`).

To migrate an existing CocoaPods-based project to SPM, run `bunx cap spm-migration-assistant` and add the local `CapApp-SPM` package and any extension dependencies through Xcode's Package Dependencies tab.

---

## Live Activities (iOS only)

- `LiveActivitySection` (`src/components/sections/LiveActivitySection.tsx`) is rendered only when `Capacitor.getPlatform() === 'ios'`.
- `OneSignal.LiveActivities.setupDefault({ enablePushToStart: true, enablePushToUpdate: true })` and `startDefault()` are called in `initOneSignal()`.
- REST update/end go through `OneSignalApiService.updateLiveActivity(...)` / `.endLiveActivity(...)` using `VITE_ONESIGNAL_API_KEY` as `Authorization: Key ...`. The section is gated UI-wise when the env var is missing.
- The widget target uses the `OneSignalLiveActivities` framework + `DefaultLiveActivityAttributes`. Replace `OneSignalWidgetLiveActivity.swift` with the shared reference at `https://raw.githubusercontent.com/OneSignal/sdk-shared/main/demo/LiveActivity.swift` whenever it is updated.

---

## Splash screen

- `@capacitor/splash-screen` is a runtime dependency.
- `capacitor.config.ts` sets `plugins.SplashScreen.launchAutoHide: false` (with `launchShowDuration: 2000`, white background, no spinner) so the splash is dismissed manually rather than racing native dialogs.
- `HomeScreen` hides the splash before calling `promptPush()` so the Android 13+ runtime permission dialog does not appear behind/over the splash.
- Splash source images live at `assets/splash.png` and `assets/splash-dark.png` and are consumed by `bunx @capacitor/assets generate --ios --android`.

---

## Tooltip content

`TooltipHelper.init()` (`src/services/TooltipHelper.ts`) fetches tooltip copy from the shared `sdk-shared` repo via GitHub raw JSON at runtime and falls back to bundled values if the network fetch fails. `HomeScreen`'s tooltip modal renders whatever `TooltipHelper` returns.

---

## Platform Config

### Android

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

### Custom Notification Sound

The WITH SOUND push payload uses `ios_sound: 'vine_boom.wav'` and the `VITE_ONESIGNAL_ANDROID_CHANNEL_ID` channel inside `OneSignalApiService`. The `vine_boom.wav` asset is bundled in the demo:

- **Android**: `android/app/src/main/res/raw/vine_boom.wav`
- **iOS**: `ios/App/App/vine_boom.wav` (wired into the Xcode `App` target as a bundle resource)

If you start from a fresh clone and the asset is missing, copy it from [sdk-shared/assets](https://github.com/OneSignal/sdk-shared/tree/main/assets) into the same paths and add the iOS file to the Xcode target as a bundle resource.

---

## File Structure

```
examples/
├── setup.sh              # Build SDK, pack, install, vite build, cap sync
├── run-android.sh        # Device selection + cap run android
├── run-ios.sh            # Simulator selection + cap run ios
├── dev-android.sh        # Vite dev server + cap run android with live reload
├── dev-ios.sh            # Vite dev server + cap run ios with live reload
├── build.md              # This file
└── demo/
    ├── README.md
    ├── index.html
    ├── capacitor.config.ts
    ├── vite.config.ts
    ├── tsconfig.json
    ├── package.json
    ├── .env.example
    ├── assets/
    │   ├── icon-only.png         # OneSignal logo on white
    │   ├── icon-foreground.png   # Android adaptive icon foreground (transparent)
    │   ├── icon-background.png   # Android adaptive icon background (solid white)
    │   ├── splash.png            # Splash screen (light)
    │   └── splash-dark.png       # Splash screen (dark)
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx             # IonApp + ToastProvider + IonReactRouter, StatusBar config
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
    │   │   ├── ToastProvider.tsx
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
    │   └── theme/
    │       └── variables.css
    ├── android/                    # Capacitor Android project
    └── ios/
        └── App/
            ├── App/                                    # Main app target
            │   ├── AppDebug.entitlements
            │   ├── AppRelease.entitlements
            │   └── ...
            ├── OneSignalNotificationServiceExtension/  # NSE target
            │   ├── NotificationService.swift
            │   ├── OneSignalNotificationServiceExtensionDebug.entitlements
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
