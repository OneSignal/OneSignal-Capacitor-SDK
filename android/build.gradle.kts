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

    // Both AGP and Kotlin Gradle Plugin are classpathed here so the plugin
    // builds inside Capacitor 7 hosts, whose root build.gradle does not
    // provide either for sub-projects. Capacitor 8 hosts that already pin
    // their own kotlin_version can override via rootProject.ext.kotlin_version.
    //
    // The catalog default matches the Capacitor 8 upgrade guide's
    // recommended kotlin_version (2.2.20). That matters because the host
    // classpath can resolve kotlin-stdlib to 2.x; the 1.9 compiler can't
    // read 2.x metadata, which is exactly what broke 1.0.2 on Capacitor 8
    // (issue #18). A 2.2.x compiler reads both 1.x and 2.x stdlib bytecode,
    // so the plugin works under Cap 7 and Cap 8.
    // findProperty matches hasProperty's broad source set (extras, gradle.properties,
    // -P flags, ORG_GRADLE_PROJECT_* env vars). Reading rootProject.extra directly
    // would only see ext { ... } values and crash on the others with
    // UnknownPropertyException, so prefer findProperty + toString().
    val kotlinVersion: String =
        project.findProperty("kotlin_version")?.toString() ?: fromCatalog("kotlin")
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

// See the kotlin_version note in buildscript {}: findProperty honors every property
// source hasProperty does (extras, gradle.properties, -P, env), and toString()
// avoids the String/Int cast hazard since gradle.properties values are always String.
fun propertyOrCatalog(propertyName: String, catalogKey: String): String =
    project.findProperty(propertyName)?.toString() ?: catalogVersion(catalogKey)

fun intPropertyOrCatalog(propertyName: String, catalogKey: String): Int =
    project.findProperty(propertyName)?.toString()?.toInt() ?: catalogVersion(catalogKey).toInt()

fun envFlag(envName: String): Boolean {
    val value = System.getenv(envName)
    val normalizedValue = value?.trim()
    return normalizedValue.equals("true", ignoreCase = true) || normalizedValue == "1"
}

val junitVersion: String = propertyOrCatalog("junitVersion", "junit")
val androidxAppCompatVersion: String = propertyOrCatalog("androidxAppCompatVersion", "androidxAppCompat")
val oneSignalVersion: String = catalogVersion("onesignal")
val oneSignalDisableLocation: Boolean = envFlag("ONESIGNAL_DISABLE_LOCATION")

extra["junitVersion"] = junitVersion
extra["androidxAppCompatVersion"] = androidxAppCompatVersion

apply(plugin = "com.android.library")

val androidPluginVersion = com.android.build.api.AndroidPluginVersion.getCurrent()

// AGP 9 provides Kotlin support itself, while AGP 8 hosts still require this plugin.
if (androidPluginVersion < com.android.build.api.AndroidPluginVersion(9, 0)) {
    apply(plugin = "kotlin-android")
}

configure<com.android.build.api.dsl.LibraryExtension> {
    namespace = "com.onesignal.capacitor"
    compileSdk = intPropertyOrCatalog("compileSdkVersion", "compileSdk")
    defaultConfig {
        minSdk = intPropertyOrCatalog("minSdkVersion", "minSdk")
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    compilerOptions.jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
}

repositories {
    google()
    mavenCentral()
}

dependencies {
    "implementation"(project(":capacitor-android"))
    "implementation"("androidx.appcompat:appcompat:$androidxAppCompatVersion")
    if (oneSignalDisableLocation) {
        "implementation"("com.onesignal:core:$oneSignalVersion")
        "implementation"("com.onesignal:notifications:$oneSignalVersion")
        "implementation"("com.onesignal:in-app-messages:$oneSignalVersion")
    } else {
        "implementation"("com.onesignal:OneSignal:$oneSignalVersion")
    }
    "testImplementation"("junit:junit:$junitVersion")
    "androidTestImplementation"("androidx.test.ext:junit:${catalogVersion("androidxTestJunit")}")
    "androidTestImplementation"("androidx.test.espresso:espresso-core:${catalogVersion("androidxEspresso")}")
}
