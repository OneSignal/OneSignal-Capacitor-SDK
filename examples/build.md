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
npm install @capacitor/keyboard @capacitor/status-bar
npm install react react-dom @ionic/react @ionic/react-router ionicons react-icons
npm install react-router react-router-dom
npm install -D @vitejs/plugin-react @types/react @types/react-dom @types/react-router @types/react-router-dom typescript vite
npx cap init "OneSignal Demo" com.onesignal.example --web-dir dist
npx cap add ios
npx cap add android
```

- TypeScript strict mode enabled
- React + Ionic React for component-based UI with React Router for navigation
- Separate section components per feature area, driven by a central `useOneSignal` hook
- Vite+ (`vite-plus`) with `@vitejs/plugin-react` for bundling, linting, and formatting; output to `dist/` (`webDir` for Capacitor)
- Support both Android and iOS

App branding uses a custom header in `HomeScreen.tsx` with the OneSignal logo and "Capacitor" subtitle (no `IonToolbar` header).

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
- `@capacitor/keyboard`, `@capacitor/status-bar` for native UI control
- `react`, `react-dom` for React
- `@ionic/react`, `@ionic/react-router` for Ionic React components and routing
- `react-router`, `react-router-dom` for page navigation
- `ionicons` for icon support
- `react-icons` for additional icons

Dev:

- `@capacitor/cli` for `cap sync`, `cap run`, etc.
- `vite-plus` for bundling, linting, and formatting
- `@vitejs/plugin-react` for JSX/TSX transform
- `@types/react`, `@types/react-dom`, `@types/react-router`, `@types/react-router-dom`
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
  ios: {
    handleApplicationNotifications: false,
  },
};

export default config;
```

The `handleApplicationNotifications: false` setting is required on iOS so that Capacitor does not intercept notifications before OneSignal's native delegate can process them. Without it, foreground notification display and lifecycle events will not work.

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

## Architecture

The demo app follows a layered architecture with clear separation of concerns:

### `useOneSignal` Hook (Central State Manager)

All OneSignal SDK interactions and state are managed through a single `useOneSignal()` hook in `src/hooks/useOneSignal.ts`. This hook:

- Initializes the SDK (via `OneSignal.initialize()`)
- Registers all event listeners (notifications, IAM, push subscription, user changes, permissions)
- Exposes reactive state (push subscription ID, permission status, aliases, tags, emails, etc.)
- Provides action methods (login, logout, send notification, add tag, etc.)
- Fetches user data from the REST API on user change events
- Handles cleanup of all listeners on unmount

`HomeScreen` calls `useOneSignal()` and passes state/callbacks down to section components as props.

### Repository Pattern

`OneSignalRepository` (`src/repositories/OneSignalRepository.ts`) wraps all OneSignal SDK calls with `Capacitor.isNativePlatform()` guards, providing a safe abstraction that no-ops on web. It also delegates notification sending and user fetching to `OneSignalApiService`.

### Services

- `OneSignalApiService` (`src/services/OneSignalApiService.ts`) — Singleton REST client using `fetch` to send notifications via the OneSignal API and fetch user data
- `PreferencesService` (`src/services/PreferencesService.ts`) — Persists app settings (app ID, consent, IAM paused, location shared, external user ID) to `localStorage`
- `LogManager` (`src/services/LogManager.ts`) — Singleton logger with pub/sub; entries shown in the `LogView` component
- `TooltipHelper` (`src/services/TooltipHelper.ts`) — Fetches tooltip content from the shared `sdk-shared` repo for info modals

### Models

- `NotificationType` (`src/models/NotificationType.ts`) — Enum: `Simple`, `WithImage`, `WithSound`, `Custom`
- `UserData` (`src/models/UserData.ts`) — Interface + parser for REST API user response

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
| HasPermission()                   | `await OneSignal.Notifications.hasPermission()`             |
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

All SDK initialization and event registration is handled inside `useOneSignal()` hook in a single `useEffect`:

```typescript
import OneSignal, { LogLevel } from 'onesignal-capacitor-plugin';

// Inside useEffect in useOneSignal():
OneSignal.Debug.setLogLevel(LogLevel.Verbose);
OneSignal.setConsentRequired(consentRequired);
OneSignal.setConsentGiven(consentGiven);
OneSignal.initialize(appId);

OneSignal.LiveActivities.setupDefault({
  enablePushToStart: true,
  enablePushToUpdate: true,
});
```

Event listeners (addEventListener pattern, same API as React Native):

```typescript
OneSignal.Notifications.addEventListener('click', (e) => {
  log(`Notification click: ${e.notification.title ?? ''}`);
});

OneSignal.Notifications.addEventListener('foregroundWillDisplay', (e) => {
  log(`foregroundWillDisplay: ${e.getNotification().title ?? ''}`);
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
  log(`User changed`);
});

OneSignal.User.pushSubscription.addEventListener('change', (e) => {
  log(`Push sub changed: optedIn=${e.current.optedIn}`);
});
```

All listeners are cleaned up in the `useEffect` return function via `removeEventListener`.

Under the hood, `addEventListener` wraps Capacitor's `this._plugin.addListener(nativeEventName, handler)`. The SDK maps public event names to native event names:

| Namespace               | Public Event            | Native Event                        |
| ----------------------- | ----------------------- | ----------------------------------- |
| `User`                  | `change`                | `userStateChange`                   |
| `User.pushSubscription` | `change`                | `pushSubscriptionChange`            |
| `Notifications`         | `click`                 | `notificationClick`                 |
| `Notifications`         | `foregroundWillDisplay` | `notificationForegroundWillDisplay` |
| `Notifications`         | `permissionChange`      | `permissionChange`                  |
| `InAppMessages`         | `click`                 | `inAppMessageClick`                 |
| `InAppMessages`         | `willDisplay`           | `inAppMessageWillDisplay`           |
| `InAppMessages`         | `didDisplay`            | `inAppMessageDidDisplay`            |
| `InAppMessages`         | `willDismiss`           | `inAppMessageWillDismiss`           |
| `InAppMessages`         | `didDismiss`            | `inAppMessageDidDismiss`            |

---

## State Management

### `useOneSignal` Hook

The `useOneSignal()` hook centralizes all SDK state and actions:

- **Reactive state** via `useState`: app ID, consent settings, external user ID, push subscription ID, push enabled, notification permission, IAM paused, location shared, aliases, emails, SMS numbers, tags, triggers, loading state
- **Refs** via `useRef`: mount tracking (`mountedRef`), request sequencing (`requestSequenceRef`) to discard stale API responses
- **Effects** via `useEffect`: one-time SDK init + listener registration with full cleanup
- **Memoized callbacks** via `useCallback`: `fetchUserDataFromApi` for API-driven state refresh

The hook returns a typed object (`UseOneSignalReturn`) with all state values and action methods. `HomeScreen` destructures this and passes slices to section components as props.

### Persistence

`PreferencesService` persists the following to `localStorage`:

- App ID
- Consent required / consent given
- External user ID
- Location sharing
- IAM paused

On init, `useOneSignal` reads these preferences and restores state accordingly.

### Data Flow

```
useOneSignal (hook)
  ├── OneSignalRepository (SDK calls + native guards)
  │   └── OneSignalApiService (REST API: send notifications, fetch user)
  ├── PreferencesService (localStorage persistence)
  └── LogManager (pub/sub logging → LogView)
```

---

## Capacitor-Specific UI Details

### React Entry (`main.tsx`)

Render the root component with strict mode:

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### App Shell (`App.tsx`)

Uses Ionic React Router for navigation between `HomeScreen` and `Secondary`:

```tsx
<IonApp>
  <IonReactRouter>
    <IonRouterOutlet>
      <Route exact path="/home">
        <HomeScreen />
      </Route>
      <Route exact path="/secondary">
        <Secondary />
      </Route>
      <Route exact path="/">
        <Redirect to="/home" />
      </Route>
    </IonRouterOutlet>
  </IonReactRouter>
</IonApp>
```

`App.tsx` also configures `StatusBar` (dark style) and `Keyboard` (hide accessory bar) on startup.

### HomeScreen

`HomeScreen` is the main page assembling all section components. It:

- Calls `useOneSignal()` to get SDK state and actions
- Manages dialog state for modals (login, add alias, add tag, outcomes, etc.)
- Renders sections as props-driven components
- Renders modals conditionally based on `DialogState` discriminated union

### Section Components

Each feature area is a separate React component under `src/components/sections/`:

- `AppSection` — App ID display, consent toggles
- `UserSection` — External user ID, login/logout
- `PushSection` — Push subscription ID, permission, push toggle
- `SendPushSection` — Send simple/image/sound/custom notifications, clear all
- `InAppSection` — IAM pause toggle
- `SendIamSection` — Send IAM triggers (top banner, bottom banner, center modal, full screen)
- `AliasesSection` — List aliases, add single/multiple
- `EmailsSection` — List emails, add/remove
- `SmsSection` — List SMS numbers, add/remove
- `TagsSection` — List tags, add single/multiple, remove selected
- `OutcomesSection` — Send outcomes (normal, unique, with value)
- `TriggersSection` — List triggers, add single/multiple, remove selected, clear all
- `TrackEventSection` — Track custom events with properties
- `LocationSection` — Location sharing toggle, request permission
- `LiveActivitySection` — Enter/exit live activities

### Shared Components

- `SectionCard` — Reusable wrapper using `IonList` with inset styling and info icon
- `ActionButton` — Styled button component
- `ToggleRow` — Label + toggle component
- `ListWidgets` — Key-value list display with remove actions
- `LoadingOverlay` — Full-screen loading indicator
- `LogView` — Scrollable log display subscribing to `LogManager`

### Modals

Under `src/components/modals/`:

- `ModalShell` — Base modal wrapper
- `SingleInputModal` — Single text input (login, add email, add SMS)
- `PairInputModal` — Two-field input (add alias, add tag, add trigger)
- `MultiPairInputModal` — Dynamic list of key-value pairs
- `MultiSelectRemoveModal` — Checkbox list for bulk removal
- `OutcomeModal` — Outcome name + mode (normal/unique/value)
- `TrackEventModal` — Event name + dynamic properties
- `CustomNotificationModal` — Custom title + body
- `TooltipModal` — Info tooltip display

### Log View

- React component subscribing to `LogManager` singleton
- Displays timestamped log entries with level indicators
- Auto-scrolls to latest entry

### Secondary Page

A minimal second page (`src/pages/Secondary.tsx`) reachable via a "NEXT ACTIVITY" button on HomeScreen, testing navigation behavior with the SDK.

### Accessibility (Appium)

Use `id` props on Ionic React elements for test automation.

---

## iOS Project Setup

The iOS Xcode project includes extension targets:

### Entitlements

- `ios/App/App/App.entitlements` — push notification (`aps-environment`) + app groups

### Notification Service Extension

- `ios/App/OneSignalNotificationServiceExtension/NotificationService.swift` — forwards to `OneSignalExtension` for rich notification support
- `ios/App/OneSignalNotificationServiceExtension/Info.plist` — extension point `com.apple.usernotifications.service`

### Podfile

The Podfile includes the NSE target:

```ruby
target 'App' do
  capacitor_pods
end

target 'OneSignalNotificationServiceExtension' do
  pod 'OneSignalXCFramework', '>= 5.0.0', '< 6.0'
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

- `handleApplicationNotifications: false` in `capacitor.config.ts` to let OneSignal handle notifications
- Capacitor setup with push notification entitlement and app groups
- NSE target in Xcode project
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
    │   ├── main.tsx        # React entry, StrictMode, render <App />
    │   ├── App.tsx         # IonApp + IonReactRouter, StatusBar/Keyboard config
    │   ├── vite-env.d.ts   # Vite client types
    │   ├── assets/
    │   │   └── onesignal_logo.svg
    │   ├── hooks/
    │   │   └── useOneSignal.ts   # Central SDK state + actions hook
    │   ├── models/
    │   │   ├── NotificationType.ts
    │   │   └── UserData.ts
    │   ├── repositories/
    │   │   └── OneSignalRepository.ts  # SDK wrapper with native guards
    │   ├── services/
    │   │   ├── LogManager.ts           # Pub/sub logger singleton
    │   │   ├── OneSignalApiService.ts  # REST API client singleton
    │   │   ├── PreferencesService.ts   # localStorage persistence
    │   │   └── TooltipHelper.ts        # Remote tooltip content
    │   ├── pages/
    │   │   ├── HomeScreen.tsx   # Main page assembling all sections
    │   │   ├── HomeScreen.css
    │   │   ├── Secondary.tsx    # Minimal secondary page
    │   │   └── Secondary.css
    │   ├── components/
    │   │   ├── ActionButton.tsx
    │   │   ├── ListWidgets.tsx
    │   │   ├── LoadingOverlay.tsx
    │   │   ├── LogView.tsx
    │   │   ├── LogView.css
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
    │   │       ├── TrackEventSection.tsx
    │   │       ├── LocationSection.tsx
    │   │       └── LiveActivitySection.tsx
    │   └── theme/
    │       └── variables.css
    ├── dist/              # Vite build output (webDir for Capacitor)
    ├── android/           # Capacitor Android project
    └── ios/               # Capacitor iOS project
        └── App/
            ├── App/                                    # Main app target
            │   ├── App.entitlements                    # Push + app groups
            │   ├── vine_boom.wav                       # Custom notification sound
            │   └── ...
            ├── OneSignalNotificationServiceExtension/  # NSE target
            │   ├── NotificationService.swift
            │   └── Info.plist
            └── Podfile
```

---

## Capacitor Best Practices

- **TypeScript strict mode** on all source files, avoiding `any` and type assertions
- **Central `useOneSignal` hook** manages all SDK state and actions; section components are pure props-driven
- **Repository pattern** wraps SDK calls with `Capacitor.isNativePlatform()` guards
- **Service layer** separates REST API calls, persistence, and logging from UI
- **React + Ionic React** for component-based UI with React Router navigation
- **Separate section components** per feature area for maintainability
- **`useEffect` cleanup** for all SDK event listeners
- **Vite+** (`vite-plus`) with `@vitejs/plugin-react` for bundling, linting, and formatting
- **`cap sync`** after every dependency change to push web assets and native plugins
- **Async getters** (`getIdAsync`, `hasPermission`, etc.) over deprecated sync properties
- **`handleApplicationNotifications: false`** in `capacitor.config.ts` so OneSignal controls notification lifecycle on iOS
