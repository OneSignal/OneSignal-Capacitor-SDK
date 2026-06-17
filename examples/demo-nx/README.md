# OneSignal Capacitor Nx pnpm Repro

Minimal Nx-style monorepo that mirrors the package layout from
https://github.com/j-oppenhuis/onesignal-capacitor-test at commit
`c8a3f0a998b8afb3887b56700a2330d9ec510f38`.

The Capacitor app lives in `apps/shop`, while dependencies are declared at the
workspace root. Both plugins are direct root dependencies:

- `@capawesome/capacitor-app-update`
- `@onesignal/capacitor-plugin`

To reproduce:

```sh
COREPACK_ENABLE_STRICT=0 npx pnpm@10.33.0 install
COREPACK_ENABLE_STRICT=0 npx pnpm@10.33.0 run sync
```

The `COREPACK_ENABLE_STRICT=0` prefix is only needed when this fixture is run
inside this SDK checkout, because the parent package is configured for Bun.

Expected current behavior:

- Capacitor detects `@capawesome/capacitor-app-update`.
- Capacitor does not detect `@onesignal/capacitor-plugin`.
- Generated native files contain Capawesome entries but no OneSignal entries:
  - `apps/shop/android/capacitor.settings.gradle`
  - `apps/shop/android/app/capacitor.build.gradle`
  - `apps/shop/ios/App/CapApp-SPM/Package.swift`
