# OneSignal Capacitor No-Location Demo

This lightweight runnable example shows the native build flag for apps that use OneSignal push and in-app messaging, but do not use `OneSignal.Location`.

Run it with:

```sh
vp run ios
vp run android
```

## Setup

Copy `.env.example` to `.env` and set your OneSignal app ID:

```sh
cp .env.example .env
```

Then edit `.env`:

```sh
VITE_ONESIGNAL_APP_ID=your-onesignal-app-id
```

The `setup` script exports `ONESIGNAL_DISABLE_LOCATION=true` before packing the local plugin and running Capacitor sync, so Android Gradle and iOS Swift Package Manager resolve OneSignal without the location module.

## iOS

The `ios` script runs `setup`, which syncs Capacitor with:

```sh
ONESIGNAL_DISABLE_LOCATION=true
```

If you run `vpx cap sync ios`, Xcode, or Swift Package Manager manually, set `ONESIGNAL_DISABLE_LOCATION=true` in that environment too.

## Android

The `android` script runs `setup`, which syncs Capacitor with:

```sh
ONESIGNAL_DISABLE_LOCATION=true
```

If you build Android another way, such as Android Studio or a raw `./gradlew` invocation, set `ONESIGNAL_DISABLE_LOCATION=true` in that environment too.

## App Code

`src/App.tsx` initializes OneSignal and requests notification permission without calling the `OneSignal.Location` namespace during normal app flow. The optional location test button calls `OneSignal.Location.isShared()` to confirm the no-location bridge resolves safely.
