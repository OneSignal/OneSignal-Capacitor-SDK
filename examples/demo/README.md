# OneSignal Capacitor Demo

Reference app for the `@onesignal/capacitor-plugin`. Use it to exercise the SDK on a real device or simulator and to reproduce/debug issues against the local plugin sources at `../../`.

---

## Prerequisites

- Bun, Xcode (with a booted simulator), and Android Studio (with an emulator or attached device)
- `vp` (Vite+) on `PATH` — the demo uses it instead of running `bun`/`vite` directly. Install with:

  ```bash
  # macOS / Linux
  curl -fsSL https://vite.plus | bash

  # Windows (PowerShell)
  irm https://vite.plus/ps1 | iex
  ```

  See the [Vite+ install guide](https://viteplus.dev/guide/#install-vp) for other platforms.

- A OneSignal app id

Copy `.env.example` to `.env` and fill in your app id (and REST API key if you plan to send notifications from inside the demo):

```bash
cp .env.example .env
```

```env
VITE_ONESIGNAL_APP_ID=<your_app_id>
VITE_ONESIGNAL_API_KEY=<your_rest_api_key>
VITE_ONESIGNAL_ANDROID_CHANNEL_ID=
VITE_E2E_MODE=false
```

---

## Run modes

There are two ways to run the demo. Both rebuild the local plugin from `../../` first (via `setup.sh`), so any change you make to the plugin sources is picked up automatically.

| Script                                  | What it does                                                                             | When to use                                                                                             |
| --------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `vp run android` / `vp run ios`         | Bundles the web app to `dist/`, syncs into the native project, installs and launches     | You only changed native (Kotlin/Swift) code, or you want a "clean" install that mirrors a release build |
| `vp run dev:android` / `vp run dev:ios` | Same install, but the WebView loads from a Vite dev server with HMR + React Fast Refresh | You're iterating on TypeScript/React. Save a file and the WebView updates without a reinstall           |

Both modes prompt you to pick a device/simulator if more than one is available.

### Standard (non-dev)

```bash
vp run android
# or
vp run ios
```

The webview loads the prebuilt bundle from inside the app. JS edits require re-running the script. Native code changes always require this path (or a fresh `dev:*` run, which performs a sync).

### Dev (live reload)

```bash
vp run dev:android
# or
vp run dev:ios
```

What happens:

1. `setup.sh` rebuilds the plugin and installs it.
2. The script starts a Vite dev server on `http://localhost:5173` (or reuses one that's already listening — useful if you'd rather run `vp run dev` in a separate terminal for cleaner logs).
3. Capacitor installs the app with `--live-reload --host localhost --port 5173`. On Android it also calls `adb reverse` so the device's `localhost` resolves to your machine.
4. Save a `.ts`/`.tsx` file → HMR pushes it into the WebView.

`Ctrl+C` tears down the Vite server only if the script started it. If you started Vite yourself, that one keeps running.

Notes:

- **Native changes still need a reinstall.** HMR only covers JS/CSS. Editing Kotlin/Swift means re-running `dev:*` (or `android` / `ios`).
- **JS plugin changes require restarting `dev:*`.** `setup.sh` rebuilds and reinstalls the plugin tarball, and also invalidates Vite's prebundle cache + kills any stale Vite on `:5173` so the new code is picked up. The next `dev:*` run starts Vite fresh.
- **Override the port** with `DEV_PORT=5174 vp run dev:android` if `5173` is taken.

---

## Other scripts

| Script                 | Purpose                                                                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vp run setup`         | Build the plugin, pack it, install into the demo, `vp build`, `cap sync`. Runs automatically before `android` / `ios` / `dev:android` / `dev:ios`. |
| `vp build`             | Build the web bundle into `dist/` only.                                                                                                            |
| `vp run clean:android` | Wipe Android build outputs (`android/app/build`, `.cxx`, `android/build`).                                                                         |
| `vp run clean:ios`     | Wipe iOS build outputs and SPM checkouts.                                                                                                          |

---

## Troubleshooting

- **App stuck on splash (`dev:*`)** — the Vite dev server isn't reachable from the device. Confirm `http://localhost:5173` works in your host browser, then re-run `dev:*`. On a physical Android device, `adb reverse` (handled via `--forwardPorts`) requires `adb` to see the device as `device`, not `offline`.
- **`Invalid target ID` / device shows as `offline`** — `adb kill-server && adb start-server`, then re-run.
- **Plugin changes not showing up in the WebView** — kill the script with `Ctrl+C` and re-run `dev:*`. `setup.sh` will rebuild the plugin, drop `node_modules/.vite/`, and start Vite clean.
- **iOS WebView won't connect to Safari Web Inspector** — make sure the simulator is booted before running `dev:ios`. `webContentsDebuggingEnabled: true` is already set in `capacitor.config.ts`.
