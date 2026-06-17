# OneSignal Capacitor Nx pnpm Repro

Minimal Nx-style monorepo that mirrors the package layout from
https://github.com/j-oppenhuis/onesignal-capacitor-test at commit
`c8a3f0a998b8afb3887b56700a2330d9ec510f38`.

The Capacitor app lives in `apps/shop`, while dependencies are declared at the
workspace root. Both plugins are direct root dependencies:

- `@capawesome/capacitor-app-update`
- `@onesignal/capacitor-plugin` from a local SDK tarball

This fixture is committed in the post-fix state. It validates that a locally
packed version of this SDK is detected by Capacitor in the Nx/pnpm monorepo
layout.

From the SDK root, build and pack the plugin tarball:

```sh
vp pack
rm -f onesignal-capacitor-plugin*.tgz
vp pm pack
mv onesignal-capacitor-plugin-*.tgz onesignal-capacitor-plugin.tgz
```

Then run the fixture:

```sh
cd examples/demo-nx
COREPACK_ENABLE_STRICT=0 npx pnpm@10.33.0 install
COREPACK_ENABLE_STRICT=0 npx pnpm@10.33.0 run sync
```

The `COREPACK_ENABLE_STRICT=0` prefix is only needed when this fixture is run
inside this SDK checkout, because the parent package is configured for Bun.

Expected behavior:

- Capacitor detects `@capawesome/capacitor-app-update`.
- Capacitor detects `@onesignal/capacitor-plugin`.
- Generated native files contain both Capawesome and OneSignal entries:
  - `apps/shop/android/capacitor.settings.gradle`
  - `apps/shop/android/app/capacitor.build.gradle`
  - `apps/shop/ios/App/CapApp-SPM/Package.swift`
