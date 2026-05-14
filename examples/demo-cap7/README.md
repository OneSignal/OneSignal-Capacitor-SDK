# demo-cap7

Minimal Capacitor 7 sample app used to verify the OneSignal Capacitor plugin against the older Kotlin 1.9.x / AGP 8.2.x toolchain that Capacitor 7 ships with. Pairs with `examples/demo` (Capacitor 8).

## Layout

- Vanilla TypeScript + Vite (no React, no Ionic) – kept tiny on purpose.
- Three buttons:
  1. Initialize OneSignal
  2. Request notification permission
  3. Show the OneSignal user id / push subscription id (send a test push to it from the OneSignal dashboard)
- A simple on-screen log shows what each call returned.

## First-time setup

```bash
# from the repo root: build + pack the plugin tarball
vp run build

# in this folder, install Cap 7 deps and add the native platforms
cd examples/demo-cap7
bun install
bunx cap add android
bunx cap add ios   # optional
```

`bunx cap add android` scaffolds a Capacitor 7 Android project (Kotlin 1.9.x / AGP 8.2.x). The OneSignal plugin module compiles against that toolchain because it no longer pins its own Kotlin / AGP versions.

Replace the placeholder `ONESIGNAL_APP_ID` in `src/main.ts` with your OneSignal App ID before running on a device.

## Running

```bash
bun run build           # build the web bundle
bunx cap sync           # copy web + plugin into native projects
bunx cap run android    # or: bunx cap run ios
```
