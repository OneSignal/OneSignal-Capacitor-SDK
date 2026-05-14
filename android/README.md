# OneSignal Capacitor Plugin – Android

Thin Capacitor wrapper around the OneSignal Android SDK. Designed to be consumed as a Capacitor sub-project under both Capacitor 7 and Capacitor 8.

## Kotlin / AGP toolchain

The plugin module declares its own `buildscript` classpath for the Android Gradle Plugin and the Kotlin Gradle Plugin. This is required because Capacitor 7's host `build.gradle` does not classpath the Kotlin Gradle Plugin for sub-projects; without our own classpath the `kotlin-android` plugin would fail to resolve.

Defaults live in [`gradle/libs.versions.toml`](gradle/libs.versions.toml):

- `kotlin = "2.2.20"` – the compiler version used to build this module. Matches the Capacitor 8 upgrade guide's recommended `kotlin_version`, and a 2.2.x compiler reads `kotlin-stdlib` bytecode from both 1.x and 2.x, which is what makes a single artifact work on Capacitor 7 hosts (Kotlin 1.9.x stdlib) and Capacitor 8 hosts (Kotlin 2.2.x stdlib).
- `androidGradlePlugin = "8.7.3"` – tracks Capacitor 8's AGP. Plugin-only Gradle invocations target this version; under a Cap 7 host the host's AGP wins, which is fine because both 8.2.x and 8.7.x compile this source set.

Host apps that need to pin a different Kotlin compiler can do so by setting `rootProject.ext.kotlin_version` in their root `build.gradle`. The plugin reads it via `propertyOrCatalog("kotlin_version", "kotlin")`.

## SDK levels

`compileSdk`, `minSdk`, and `targetSdk` default to the Capacitor 7 floors (35 / 23 / 35). Host apps override any of them by setting the matching `rootProject.ext.<name>Version` (this is what `examples/demo` does for Capacitor 8 with `compileSdk = 36`, `minSdk = 24`, `targetSdk = 36`).

## Library versions

`androidx.appcompat`, `junit`, espresso, and the OneSignal native SDK versions also live in [`gradle/libs.versions.toml`](gradle/libs.versions.toml). `androidxAppCompatVersion` and `junitVersion` can be overridden per-project via `rootProject.ext`.
