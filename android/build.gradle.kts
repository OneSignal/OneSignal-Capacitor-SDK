val junitVersion: String = if (project.hasProperty("junitVersion")) {
    rootProject.extra["junitVersion"] as String
} else {
    "4.13.2"
}

val androidxAppCompatVersion: String = if (project.hasProperty("androidxAppCompatVersion")) {
    rootProject.extra["androidxAppCompatVersion"] as String
} else {
    "1.7.0"
}

extra["junitVersion"] = junitVersion
extra["androidxAppCompatVersion"] = androidxAppCompatVersion

buildscript {
    val kotlinVersion: String = if (project.hasProperty("kotlin_version")) {
        rootProject.extra["kotlin_version"] as String
    } else {
        "1.9.25"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.7.3")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
    }
}

apply(plugin = "com.android.library")
apply(plugin = "kotlin-android")

configure<com.android.build.gradle.LibraryExtension> {
    namespace = "com.onesignal.capacitor"
    compileSdk = if (project.hasProperty("compileSdkVersion")) {
        rootProject.extra["compileSdkVersion"] as Int
    } else {
        35
    }
    defaultConfig {
        minSdk = if (project.hasProperty("minSdkVersion")) {
            rootProject.extra["minSdkVersion"] as Int
        } else {
            23
        }
        @Suppress("DEPRECATION")
        targetSdk = if (project.hasProperty("targetSdkVersion")) {
            rootProject.extra["targetSdkVersion"] as Int
        } else {
            35
        }
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    kotlinOptions.jvmTarget = "17"
}

repositories {
    google()
    mavenCentral()
}

dependencies {
    "implementation"(project(":capacitor-android"))
    "implementation"("androidx.appcompat:appcompat:$androidxAppCompatVersion")
    "implementation"("com.onesignal:OneSignal:5.7.6")
    "testImplementation"("junit:junit:$junitVersion")
    "androidTestImplementation"("androidx.test.ext:junit:1.2.1")
    "androidTestImplementation"("androidx.test.espresso:espresso-core:3.6.1")
}
