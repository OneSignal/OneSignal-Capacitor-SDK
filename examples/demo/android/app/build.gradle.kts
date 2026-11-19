plugins {
    id("com.android.application")
}

val hasGoogleServices = file("google-services.json").exists()

// Off by default so local builds keep the legacy token path. E2E opts in with
// `-PFIREBASE_INSTALLATION_ID_ENABLED=true`; the flag does nothing without the default FirebaseApp.
val firebaseInstallationIdEnabled =
    (findProperty("FIREBASE_INSTALLATION_ID_ENABLED") as? String)?.trim()?.toBoolean() ?: false
if (firebaseInstallationIdEnabled && !hasGoogleServices) {
    throw GradleException("FIREBASE_INSTALLATION_ID_ENABLED requires examples/demo/android/app/google-services.json")
}

// E2E passes `-PDEMO_BUNDLE_ID=com.onesignal.sdkdemo` to match its google-services.json.
val demoBundleId =
    (findProperty("DEMO_BUNDLE_ID") as? String)?.trim()?.takeIf { it.isNotEmpty() } ?: "com.onesignal.example"

android {
    namespace = "com.onesignal.sdkdemo"
    compileSdk = rootProject.extra["compileSdkVersion"] as Int
    buildFeatures {
        resValues = true
    }
    defaultConfig {
        applicationId = demoBundleId
        resValue("string", "package_name", demoBundleId)
        resValue("string", "custom_url_scheme", demoBundleId)
        minSdk = rootProject.extra["minSdkVersion"] as Int
        targetSdk = rootProject.extra["targetSdkVersion"] as Int
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        manifestPlaceholders["firebaseInstallationIdEnabled"] = firebaseInstallationIdEnabled.toString()
        androidResources {
            // Files and dirs to omit from the packaged assets dir, modified to accommodate modern web apps.
            // Default: https://android.googlesource.com/platform/frameworks/base/+/282e181b58cf72b6ca770dc7ca5f91f135444502/tools/aapt/AaptAssets.cpp#61
            ignoreAssetsPattern = "!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~"
        }
    }
    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            // Sign release with Android's auto-generated debug keystore so
            // `assembleRelease` produces an installable app-release.apk for
            // Appium E2E. Don't ship release builds to users this way.
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    // Opt-in via `-PciSingleAbi` to build an arm64-v8a-only APK for CI.
    // BrowserStack devices we test against are all arm64-v8a, so dropping
    // the other ABIs trims native libraries (Capacitor WebView shims and
    // plugin .so files) without affecting test coverage.
    splits {
        abi {
            isEnable = project.hasProperty("ciSingleAbi")
            reset()
            include("arm64-v8a")
            isUniversalApk = false
        }
    }
}

repositories {
    flatDir {
        dirs("../capacitor-cordova-android-plugins/src/main/libs", "libs")
    }
}

dependencies {
    implementation(fileTree(mapOf("dir" to "libs", "include" to listOf("*.jar"))))
    implementation(libs.androidx.appcompat)
    implementation(libs.androidx.coordinatorlayout)
    implementation(libs.androidx.core.splashscreen)
    // OneSignal resolves firebase-messaging 24.x; Installation ID registration needs 25.1.2+.
    implementation(libs.firebase.messaging)
    implementation(project(":capacitor-android"))
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.test.junit)
    androidTestImplementation(libs.androidx.test.espresso.core)
    implementation(project(":capacitor-cordova-android-plugins"))
}

apply(from = "capacitor.build.gradle")

if (hasGoogleServices) {
    apply(plugin = "com.google.gms.google-services")
}
