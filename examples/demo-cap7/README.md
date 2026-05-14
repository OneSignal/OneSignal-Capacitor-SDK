# demo-cap7

Minimal Capacitor 7 + Angular sample used to verify the OneSignal Capacitor plugin against the older Kotlin / AGP toolchain that Capacitor 7 ships with. Pairs with `examples/demo` (Capacitor 8, Ionic React).

## Stack

- Capacitor 7 (`@capacitor/core` `^7.4.3`)
- Angular 18 standalone components, bootstrapped with `bootstrapApplication`
- Angular CLI (`ng build` / `ng serve`) – no Ionic, no extra build tooling
- Single root component with three buttons and a signal-backed log

## What the demo does

1. Initialize OneSignal
2. Request notification permission
3. Show the OneSignal user / push subscription id (paste it into the OneSignal dashboard to send a test push)

## First-time setup

```bash
# from the repo root: build + pack the plugin tarball
vp run build
vp pm pack && mv onesignal-capacitor-plugin-*.tgz onesignal-capacitor-plugin.tgz

# in this folder: install deps, build the web bundle, add native platforms
cd examples/demo-cap7
bun install
bun run build
bunx cap add android
bunx cap add ios    # optional
```

`bunx cap add android` scaffolds a Capacitor 7 Android project (AGP 8.7.x, no root Kotlin Gradle Plugin classpath). The OneSignal plugin module compiles against the Kotlin 2.2.20 compiler it ships in its own buildscript, which reads both 1.x and 2.x `kotlin-stdlib` bytecode.

`ONESIGNAL_APP_ID` in `src/app/app.component.ts` defaults to the shared OneSignal demo app id (same one used by `examples/demo`). Swap it for your own app id before pointing the demo at a production environment.

## Running

```bash
bun run build           # ng build → dist/browser
bunx cap sync           # copy web + plugin into native projects
bunx cap run android    # or: bunx cap run ios
```

The Angular CLI builder emits to `dist/browser/`; `capacitor.config.ts` points `webDir` there.
