# Cold-start tap repro (SDK-5461 / SDK-5498)

Repro-only branch: do not merge. The demo is switched to Capacitor 8's scene template (`SceneDelegate` in `AppDelegate.swift`), `handleApplicationNotifications: false` is removed from `capacitor.config.ts`, and `[Repro]` log probes are added to the plugin.

## Run

1. Boot one iOS simulator, then from `examples/demo`: `vp run ios` (or `vp run setup` and run from Xcode). Accept the push permission prompt.
2. `./repro-cold-start.sh` (optionally pass a launch URL; defaults to `https://onesignal.com`).
3. Tap the banner. The app cold-starts.

## Bug 2: nothing captured (scene template + default config)

Expected: the app opens and Safari opens `https://onesignal.com`.

Actual: the app opens on its home page, no click event, no URL. Logs:

```
[Repro] didFinishLaunching: wrapping UN delegate OSUNUserNotificationCenterDelegate
[Repro] scene connected: UN delegate is now Optional(Capacitor.NotificationRouter)
[Repro] initialize: replaying 0 response(s), isMainThread=0, ...
```

The wrap is installed on OneSignal's own delegate, then `CAPBridgeViewController` makes `NotificationRouter` the delegate, so the tap is never captured.

## Bug 1: launch URL never opened (replay off the main thread)

Restore `handleApplicationNotifications: false` in `capacitor.config.ts`, run `vp run ios` again, and repeat the steps.

Actual: the click fires but the URL is not opened. Logs:

```
[Repro] captured response on OSUNUserNotificationCenterDelegate (consumed=0)
[Repro] initialize: replaying 1 response(s), isMainThread=0, ...
handleNotificationOpened called! isActive: YES notificationId: ...
```

The replay runs on Capacitor's `bridge` GCD queue, and the iOS SDK's `launchWebURL:` uses `performSelector:afterDelay:`, which never fires without a run loop.

Control: background the app (do not kill it) and tap a push. Safari opens the URL.
