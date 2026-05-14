# OneSignal Capacitor Plugin – Android

This module is a thin Capacitor wrapper around the OneSignal Android SDK. It is designed to be consumed from a Capacitor host app and intentionally does **not** pin its own Kotlin or Android Gradle Plugin versions.

## Toolchain inheritance

The plugin's `android/build.gradle.kts` does not add `org.jetbrains.kotlin:kotlin-gradle-plugin` or `com.android.tools.build:gradle` to its own `buildscript` classpath. Both are resolved from the host Capacitor app's root project, which means a single published artifact works under both:

- Capacitor 7 (Kotlin 1.9.x / AGP 8.2.x)
- Capacitor 8 (Kotlin 2.1.x / AGP 8.7+)

If your app pins a different Kotlin version via `ext.kotlin_version` in its root `build.gradle`, the plugin compiles against that version automatically.

## SDK level overrides

`compileSdk`, `minSdk`, and `targetSdk` default to the Capacitor 7 floors (35 / 23 / 35). Host apps that need different levels can override any of them by setting `rootProject.ext.compileSdkVersion`, `rootProject.ext.minSdkVersion`, or `rootProject.ext.targetSdkVersion` (this is what `examples/demo` does for Capacitor 8).

## Library versions

`androidx.appcompat`, `junit`, espresso, and the OneSignal native SDK versions live in [`gradle/libs.versions.toml`](gradle/libs.versions.toml). The `androidxAppCompatVersion` and `junitVersion` values can be overridden per-project via `rootProject.ext` if needed.
