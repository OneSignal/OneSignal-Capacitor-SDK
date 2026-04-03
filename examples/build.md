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
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npm install react react-dom @ionic/react ionicons
npm install -D @vitejs/plugin-react @types/react @types/react-dom typescript vite
npx cap init "OneSignal Demo" com.onesignal.example --web-dir dist
npx cap add ios
npx cap add android
```

- TypeScript strict mode enabled
- React + Ionic React for component-based UI
- Separate component files per section (mirrors React Native demo structure)
- Vite+ (`vite-plus`) with `@vitejs/plugin-react` for bundling, linting, and formatting; output to `dist/` (`webDir` for Capacitor)
- Support both Android and iOS

App bar title set in `App.tsx`:

```tsx
<IonHeader>
  <IonToolbar color="danger">
    <IonTitle>OneSignal Capacitor</IonTitle>
  </IonToolbar>
</IonHeader>
```

App icon generation uses `@capacitor/assets`. Place the OneSignal logo in `assets/icon-only.png`, then:

```bash
npx @capacitor/assets generate --ios --android --iconBackgroundColor '#ffffff' --splashBackgroundColor '#ffffff'
```

Local SDK reference via packed tarball:

```json
"onesignal-capacitor-plugin": "file:../../onesignal-capacitor-plugin.tgz"
```

A `setup.sh` script in `examples/` handles building, packing, installing, and running `cap sync` automatically.

Package scripts:

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

### Dependencies (package.json)

Runtime:

- `onesignal-capacitor-plugin` (local tarball)
- `@capacitor/core`, `@capacitor/ios`, `@capacitor/android` for Capacitor runtime
- `react`, `react-dom` for React
- `@ionic/react` for Ionic React components (native-looking UI)
- `ionicons` for icon support

Dev:

- `@capacitor/cli` for `cap sync`, `cap run`, etc.
- `vite-plus` for bundling, linting, and formatting
- `@vitejs/plugin-react` for JSX/TSX transform
- `@types/react`, `@types/react-dom`
- `typescript`

Vite+ config (`vite.config.ts`):

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  fmt: {
    singleQuote: true,
    sortImports: {
      enabled: true,
    },
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
  },
});
```

Capacitor config (`capacitor.config.ts`):

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.onesignal.example',
  appName: 'OneSignal Demo',
  webDir: 'dist',
};

export default config;
```

### setup.sh Details

The setup script performs:

1. Builds the SDK from repo root (`bun run build`)
2. Packs to `onesignal-capacitor-plugin.tgz`
3. Reinstalls the tarball in the demo app
4. Builds the React web app (`vp build`)
5. Runs `bunx cap sync`

### Run Scripts

- `run-android.sh`: Lists connected ADB devices, prompts for selection if multiple, runs `npx cap run android --target <device>`
- `run-ios.sh`: Lists booted iOS simulators, prompts for selection if multiple, runs `npx cap run ios --target <udid>`

---

## OneSignal Repository (SDK API Mapping)

Use the default export `OneSignal` from `onesignal-capacitor-plugin`:

```typescript
import OneSignal, { LogLevel } from 'onesignal-capacitor-plugin';
```

| Operation                         | SDK Call                                                    |
| --------------------------------- | ----------------------------------------------------------- |
| LoginUser(externalUserId)         | `OneSignal.login(externalUserId)`                           |
| LogoutUser()                      | `OneSignal.logout()`                                        |
| AddAlias(label, id)               | `OneSignal.User.addAlias(label, id)`                        |
| AddAliases(aliases)               | `OneSignal.User.addAliases(aliases)`                        |
| RemoveAlias(label)                | `OneSignal.User.removeAlias(label)`                         |
| RemoveAliases(labels)             | `OneSignal.User.removeAliases(labels)`                      |
| AddEmail(email)                   | `OneSignal.User.addEmail(email)`                            |
| RemoveEmail(email)                | `OneSignal.User.removeEmail(email)`                         |
| AddSms(number)                    | `OneSignal.User.addSms(number)`                             |
| RemoveSms(number)                 | `OneSignal.User.removeSms(number)`                          |
| AddTag(key, value)                | `OneSignal.User.addTag(key, value)`                         |
| AddTags(tags)                     | `OneSignal.User.addTags(tags)`                              |
| RemoveTag(key)                    | `OneSignal.User.removeTag(key)`                             |
| RemoveTags(keys)                  | `OneSignal.User.removeTags(keys)`                           |
| GetTags()                         | `await OneSignal.User.getTags()`                            |
| SetLanguage(language)             | `OneSignal.User.setLanguage(language)`                      |
| AddTrigger(key, value)            | `OneSignal.InAppMessages.addTrigger(key, value)`            |
| AddTriggers(triggers)             | `OneSignal.InAppMessages.addTriggers(triggers)`             |
| RemoveTrigger(key)                | `OneSignal.InAppMessages.removeTrigger(key)`                |
| RemoveTriggers(keys)              | `OneSignal.InAppMessages.removeTriggers(keys)`              |
| ClearTriggers()                   | `OneSignal.InAppMessages.clearTriggers()`                   |
| GetPaused()                       | `await OneSignal.InAppMessages.getPaused()`                 |
| SetPaused(paused)                 | `OneSignal.InAppMessages.setPaused(paused)`                 |
| SendOutcome(name)                 | `OneSignal.Session.addOutcome(name)`                        |
| SendUniqueOutcome(name)           | `OneSignal.Session.addUniqueOutcome(name)`                  |
| SendOutcomeWithValue(name, value) | `OneSignal.Session.addOutcomeWithValue(name, value)`        |
| TrackEvent(name, properties)      | `OneSignal.User.trackEvent(name, properties)`               |
| GetPushSubscriptionId()           | `await OneSignal.User.pushSubscription.getIdAsync()`        |
| GetPushSubscriptionToken()        | `await OneSignal.User.pushSubscription.getTokenAsync()`     |
| IsPushOptedIn()                   | `await OneSignal.User.pushSubscription.getOptedInAsync()`   |
| OptInPush()                       | `OneSignal.User.pushSubscription.optIn()`                   |
| OptOutPush()                      | `OneSignal.User.pushSubscription.optOut()`                  |
| ClearAllNotifications()           | `OneSignal.Notifications.clearAll()`                        |
| RemoveNotification(id)            | `OneSignal.Notifications.removeNotification(id)`            |
| RemoveGroupedNotifications(id)    | `OneSignal.Notifications.removeGroupedNotifications(id)`    |
| HasPermission()                   | `await OneSignal.Notifications.getPermissionAsync()`        |
| RequestPermission(fallback)       | `await OneSignal.Notifications.requestPermission(fallback)` |
| CanRequestPermission()            | `await OneSignal.Notifications.canRequestPermission()`      |
| SetLocationShared(shared)         | `OneSignal.Location.setShared(shared)`                      |
| IsLocationShared()                | `await OneSignal.Location.isShared()`                       |
| RequestLocationPermission()       | `OneSignal.Location.requestPermission()`                    |
| SetConsentRequired(required)      | `OneSignal.setConsentRequired(required)`                    |
| SetConsentGiven(granted)          | `OneSignal.setConsentGiven(granted)`                        |
| GetExternalId()                   | `await OneSignal.User.getExternalId()`                      |
| GetOnesignalId()                  | `await OneSignal.User.getOnesignalId()`                     |
| SetLogLevel(level)                | `OneSignal.Debug.setLogLevel(level)`                        |
| SetAlertLevel(level)              | `OneSignal.Debug.setAlertLevel(level)`                      |

### Live Activities (iOS only)

| Operation                                     | SDK Call                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------ |
| SetupDefault(options)                         | `OneSignal.LiveActivities.setupDefault(options)`                         |
| StartDefault(activityId, attributes, content) | `OneSignal.LiveActivities.startDefault(activityId, attributes, content)` |
| Enter(activityId, token)                      | `OneSignal.LiveActivities.enter(activityId, token)`                      |
| Exit(activityId)                              | `OneSignal.LiveActivities.exit(activityId)`                              |
| SetPushToStartToken(activityType, token)      | `OneSignal.LiveActivities.setPushToStartToken(activityType, token)`      |
| RemovePushToStartToken(activityType)          | `OneSignal.LiveActivities.removePushToStartToken(activityType)`          |

REST API client uses built-in `fetch`.

---

## SDK Initialization & Observers

In `App.tsx`, initialize via a callback passed to the `AppSection` component:

```typescript
import OneSignal, { LogLevel } from 'onesignal-capacitor-plugin';

function initOneSignal(appId: string) {
  OneSignal.Debug.setLogLevel(LogLevel.Verbose);
  OneSignal.setConsentRequired(false);
  OneSignal.setConsentGiven(true);
  OneSignal.initialize(appId);

  OneSignal.LiveActivities.setupDefault({
    enablePushToStart: true,
    enablePushToUpdate: true,
  });
}
```

Event listeners (addEventListener pattern, same API as React Native):

```typescript
OneSignal.Notifications.addEventListener('click', (e) => {
  log(`Notification click: ${e.notification.title ?? ''}`);
});

OneSignal.Notifications.addEventListener('foregroundWillDisplay', (e) => {
  log(`foregroundWillDisplay: ${e.getNotification().title ?? ''}`);
  e.getNotification().display();
});

OneSignal.Notifications.addEventListener('permissionChange', (granted) => {
  log(`Permission changed: ${granted}`);
});

OneSignal.InAppMessages.addEventListener('click', (e) => {
  log(`IAM click: ${e.result.actionId ?? 'unknown'}`);
});
```

User and push subscription observers:

```typescript
OneSignal.User.addEventListener('change', (e) => {
  log(`User changed: onesignalId=${e.current.onesignalId ?? 'null'}`);
});

OneSignal.User.pushSubscription.addEventListener('change', (e) => {
  log(`Push sub changed: optedIn=${e.current.optedIn}`);
});
```

Under the hood, `addEventListener` wraps Capacitor's `this._plugin.addListener(nativeEventName, handler)`. The SDK maps public event names to native event names:

| Namespace               | Public Event            | Native Event              |
| ----------------------- | ----------------------- | ------------------------- |
| `User`                  | `change`                | `userStateChange`         |
| `User.pushSubscription` | `change`                | `pushSubscriptionChange`  |
| `Notifications`         | `click`                 | `notificationClick`       |
| `Notifications`         | `foregroundWillDisplay` | `foregroundWillDisplay`   |
| `Notifications`         | `permissionChange`      | `permissionChange`        |
| `InAppMessages`         | `click`                 | `inAppMessageClick`       |
| `InAppMessages`         | `willDisplay`           | `inAppMessageWillDisplay` |
| `InAppMessages`         | `didDisplay`            | `inAppMessageDidDisplay`  |
| `InAppMessages`         | `willDismiss`           | `inAppMessageWillDismiss` |
| `InAppMessages`         | `didDismiss`            | `inAppMessageDidDismiss`  |

---

## State Management

The demo app uses React state and hooks:

- `useState` for log entries and initialization tracking
- `useRef` for input values (via Ionic `IonInput` refs)
- `useEffect` for registering/cleaning up SDK event listeners
- State is read directly from the SDK via async getters in `useEffect` hooks

Each section component manages its own local state and calls the SDK directly:

```tsx
const [onesignalId, setOnesignalId] = useState<string | null>(null);

useEffect(() => {
  const refresh = () => {
    void OneSignal.User.getOnesignalId().then(setOnesignalId);
  };
  refresh();
  OneSignal.User.addEventListener('change', refresh);
  return () => OneSignal.User.removeEventListener('change', refresh);
}, []);
```

### Persistence

- No persistence layer in the demo — all state is read from the SDK on demand
- Triggers list is transient

---

## Capacitor-Specific UI Details

### React Entry (`main.tsx`)

Initialize Ionic React and render the root component:

```tsx
import { setupIonicReact } from '@ionic/react';
import { createRoot } from 'react-dom/client';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

import App from './App';

setupIonicReact();

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
```

### App Shell (`App.tsx`)

Uses Ionic React components for the native-looking shell:

```tsx
<IonApp>
  <IonHeader>
    <IonToolbar color="danger">
      <IonTitle>OneSignal Capacitor</IonTitle>
    </IonToolbar>
  </IonHeader>
  <IonContent>
    <HomeScreen logs={logs} onInit={initOneSignal} onLog={log} />
  </IonContent>
</IonApp>
```

### Section Components

Each feature area is a separate React component under `src/components/sections/`:

- `SectionCard` — reusable wrapper using `IonListHeader` + `IonList` with `inset`
- Sections use `IonItem`, `IonInput`, `IonButton`, `IonToggle`, `IonLabel`, `IonNote`
- Input values read via `useRef<HTMLIonInputElement>` and `ref.current?.value`

### Log View

- React component rendering log entries as `<p>` elements
- Auto-scrolls to bottom via `useEffect` + `ref.scrollTop`
- Monospace font, fixed height, scrollable container

### Accessibility (Appium)

Use `id` props on Ionic React elements for test automation.

---

## iOS Project Setup

The iOS Xcode project includes extension targets matching the React Native demo structure:

### Entitlements

- `ios/App/App/App.entitlements` — push notification (`aps-environment`) + app groups
- `ios/App/OneSignalNotificationServiceExtension/OneSignalNotificationServiceExtension.entitlements` — app groups

### Notification Service Extension

- `ios/App/OneSignalNotificationServiceExtension/NotificationService.swift` — forwards to `OneSignalExtension` for rich notification support
- `ios/App/OneSignalNotificationServiceExtension/Info.plist` — extension point `com.apple.usernotifications.service`

### Widget / Live Activity Extension

- `ios/App/OneSignalWidget/OneSignalWidgetBundle.swift` — `@main` `WidgetBundle`
- `ios/App/OneSignalWidget/OneSignalWidgetLiveActivity.swift` — `ActivityConfiguration` for `DefaultLiveActivityAttributes`, Dynamic Island + lock screen UI
- `ios/App/OneSignalWidget/Info.plist` — extension point `com.apple.widgetkit-extension`

### Podfile

The Podfile includes extension targets:

```ruby
target 'OneSignalNotificationServiceExtension' do
  pod 'OneSignalXCFramework', '>= 5.0.0', '< 6.0'
end

target 'OneSignalWidgetExtension' do
  pod 'OneSignalXCFramework', '>= 5.0.0', '< 6.0'
end

target 'App' do
  capacitor_pods
end
```

---

## Platform Config

### Android

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

### iOS

- Capacitor setup with push notification entitlement and app groups
- NSE and Widget extension targets in Xcode project
- Podspec named `OnesignalCapacitorPlugin` to match Capacitor's derived pod name (Capacitor's `fixName` converts `onesignal-capacitor-plugin` → `OnesignalCapacitorPlugin`)

### Custom Notification Sound

Copy `vine_boom.wav` from [sdk-shared/assets](https://github.com/OneSignal/sdk-shared/tree/main/assets) and place in:

- **Android**: `android/app/src/main/res/raw/vine_boom.wav`
- **iOS**: `ios/App/App/vine_boom.wav` (add to Xcode project as a bundle resource)

---

## Key Files Structure

```
examples/
├── setup.sh              # Build SDK, pack, install, vite build, cap sync
├── run-android.sh        # Device selection + cap run android
├── run-ios.sh            # Simulator selection + cap run ios
├── build.md              # This file
└── demo/
    ├── index.html         # Minimal HTML shell with React root
    ├── capacitor.config.ts
    ├── vite.config.ts
    ├── tsconfig.json
    ├── package.json
    ├── src/
    │   ├── main.tsx        # React entry, setupIonicReact, render <App />
    │   ├── App.tsx         # IonApp shell, OneSignal init, event listeners
    │   ├── vite-env.d.ts   # Vite client types
    │   ├── screens/
    │   │   └── HomeScreen.tsx  # Assembles all section components
    │   └── components/
    │       ├── LogView.tsx      # Scrollable log display
    │       ├── SectionCard.tsx  # Reusable IonList section wrapper
    │       └── sections/
    │           ├── AppSection.tsx
    │           ├── UserSection.tsx
    │           ├── PushSection.tsx
    │           ├── AliasesSection.tsx
    │           ├── EmailSection.tsx
    │           ├── SmsSection.tsx
    │           ├── TagsSection.tsx
    │           ├── InAppMessagesSection.tsx
    │           ├── OutcomesSection.tsx
    │           ├── TrackEventSection.tsx
    │           ├── LocationSection.tsx
    │           ├── NotificationsSection.tsx
    │           └── LiveActivitySection.tsx
    ├── dist/              # Vite build output (webDir for Capacitor)
    ├── android/           # Capacitor Android project
    └── ios/               # Capacitor iOS project
        └── App/
            ├── App/                                    # Main app target
            │   ├── App.entitlements                    # Push + app groups
            │   └── ...
            ├── OneSignalNotificationServiceExtension/  # NSE target
            │   ├── NotificationService.swift
            │   ├── Info.plist
            │   └── OneSignalNotificationServiceExtension.entitlements
            ├── OneSignalWidget/                        # Live Activity widget target
            │   ├── OneSignalWidgetBundle.swift
            │   ├── OneSignalWidgetLiveActivity.swift
            │   └── Info.plist
            └── Podfile
```

---

## Capacitor Best Practices

- **TypeScript strict mode** on all source files, avoiding `any` and type assertions
- **React + Ionic React** for component-based UI matching the React Native demo structure
- **Separate section components** per feature area for maintainability
- **`useEffect` cleanup** for all SDK event listeners
- **Vite+** (`vite-plus`) with `@vitejs/plugin-react` for bundling, linting, and formatting
- **`cap sync`** after every dependency change to push web assets and native plugins
- **Async getters** (`getIdAsync`, `getPermissionAsync`, etc.) over deprecated sync properties
- **No native code beyond SDK** since the OneSignal Capacitor plugin handles all bridging via `registerPlugin`
