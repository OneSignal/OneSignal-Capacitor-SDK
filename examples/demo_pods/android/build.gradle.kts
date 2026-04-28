// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath(libs.android.gradle.plugin)
        classpath(libs.kotlin.gradle.plugin)
        classpath(libs.google.services.plugin)

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

// Capture version catalog values outside the allprojects closure since `libs`
// accessors are only available in the root script body.
val minSdkVersion = libs.versions.minSdk.get().toInt()
val compileSdkVersion = libs.versions.compileSdk.get().toInt()
val targetSdkVersion = libs.versions.targetSdk.get().toInt()
val androidxAppCompatVersion = libs.versions.androidxAppCompat.get()
val cordovaAndroidVersion = libs.versions.cordovaAndroid.get()

allprojects {
    repositories {
        google()
        mavenCentral()
    }

    // Expose version catalog values as project extras so the Capacitor-generated
    // Groovy modules (capacitor-cordova-android-plugins) can resolve them via
    // rootProject.ext.* without needing variables.gradle.
    extra["minSdkVersion"] = minSdkVersion
    extra["compileSdkVersion"] = compileSdkVersion
    extra["targetSdkVersion"] = targetSdkVersion
    extra["androidxAppCompatVersion"] = androidxAppCompatVersion
    extra["cordovaAndroidVersion"] = cordovaAndroidVersion
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
