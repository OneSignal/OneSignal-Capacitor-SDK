buildscript {
    val catalogFile = file("gradle/libs.versions.toml")

    // Lightweight reader for the [versions] table of libs.versions.toml.
    // Inlined here because buildscript {} is evaluated before the rest of the
    // script body, and Gradle's built-in version catalog APIs aren't available
    // to a Capacitor plugin consumed as a sub-project.
    fun fromCatalog(key: String): String {
        var inVersions = false
        var result: String? = null
        catalogFile.forEachLine { raw ->
            if (result != null) return@forEachLine
            val line = raw.substringBefore("#").trim()
            when {
                line.startsWith("[") && line.endsWith("]") -> inVersions = (line == "[versions]")
                inVersions && "=" in line -> {
                    val (rawKey, rawValue) = line.split("=", limit = 2)
                    if (rawKey.trim() == key) {
                        result = rawValue.trim().trim('"')
                    }
                }
            }
        }
        return result ?: error("Version '$key' not found in ${catalogFile.name}")
    }

    val kotlinVersion: String = if (project.hasProperty("kotlin_version")) {
        rootProject.extra["kotlin_version"] as String
    } else {
        fromCatalog("kotlin")
    }
    val androidGradlePluginVersion: String = fromCatalog("androidGradlePlugin")

    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:$androidGradlePluginVersion")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
    }
}

// Duplicates the buildscript-local reader intentionally: the buildscript block
// closes over its own scope, so this helper is reused for the module body.
fun catalogVersion(key: String): String {
    val toml = file("gradle/libs.versions.toml")
    var inVersions = false
    var result: String? = null
    toml.forEachLine { raw ->
        if (result != null) return@forEachLine
        val line = raw.substringBefore("#").trim()
        when {
            line.startsWith("[") && line.endsWith("]") -> inVersions = (line == "[versions]")
            inVersions && "=" in line -> {
                val (rawKey, rawValue) = line.split("=", limit = 2)
                if (rawKey.trim() == key) {
                    result = rawValue.trim().trim('"')
                }
            }
        }
    }
    return result ?: error("Version '$key' not found in ${toml.name}")
}

fun propertyOrCatalog(propertyName: String, catalogKey: String): String =
    if (project.hasProperty(propertyName)) {
        rootProject.extra[propertyName] as String
    } else {
        catalogVersion(catalogKey)
    }

fun intPropertyOrCatalog(propertyName: String, catalogKey: String): Int =
    if (project.hasProperty(propertyName)) {
        rootProject.extra[propertyName] as Int
    } else {
        catalogVersion(catalogKey).toInt()
    }

val junitVersion: String = propertyOrCatalog("junitVersion", "junit")
val androidxAppCompatVersion: String = propertyOrCatalog("androidxAppCompatVersion", "androidxAppCompat")

extra["junitVersion"] = junitVersion
extra["androidxAppCompatVersion"] = androidxAppCompatVersion

apply(plugin = "com.android.library")
apply(plugin = "kotlin-android")

configure<com.android.build.gradle.LibraryExtension> {
    namespace = "com.onesignal.capacitor"
    compileSdk = intPropertyOrCatalog("compileSdkVersion", "compileSdk")
    defaultConfig {
        minSdk = intPropertyOrCatalog("minSdkVersion", "minSdk")
        @Suppress("DEPRECATION")
        targetSdk = intPropertyOrCatalog("targetSdkVersion", "targetSdk")
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
    "implementation"("com.onesignal:OneSignal:${catalogVersion("onesignal")}")
    "testImplementation"("junit:junit:$junitVersion")
    "androidTestImplementation"("androidx.test.ext:junit:${catalogVersion("androidxTestJunit")}")
    "androidTestImplementation"("androidx.test.espresso:espresso-core:${catalogVersion("androidxEspresso")}")
}
