// swift-tools-version: 5.9

import PackageDescription
import Foundation

func oneSignalEnvFlag(_ name: String) -> Bool {
    let value = Context.environment[name]?.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    return value == "true" || value == "1"
}

let oneSignalDisableLocation = oneSignalEnvFlag("ONESIGNAL_DISABLE_LOCATION")

// InAppMessages, Location, and Extension are separate library products in
// OneSignal-XCFramework and must be linked explicitly under SPM. Location can
// be omitted for apps that do not use OneSignal.Location.
var oneSignalDependencies: [Target.Dependency] = [
    .product(name: "OneSignalFramework", package: "OneSignal-XCFramework"),
    .product(name: "OneSignalInAppMessages", package: "OneSignal-XCFramework"),
    .product(name: "OneSignalExtension", package: "OneSignal-XCFramework"),
]

if !oneSignalDisableLocation {
    oneSignalDependencies.append(.product(name: "OneSignalLocation", package: "OneSignal-XCFramework"))
}

var capacitorPluginDependencies: [Target.Dependency] = [
    .product(name: "Capacitor", package: "capacitor-swift-pm"),
    .product(name: "Cordova", package: "capacitor-swift-pm"),
]
capacitorPluginDependencies.append(contentsOf: oneSignalDependencies)
capacitorPluginDependencies.append("OSCapacitorLaunchOptions")

let package = Package(
    name: "OnesignalCapacitorPlugin",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "OnesignalCapacitorPlugin",
            targets: ["OnesignalCapacitorPlugin"]
        )
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", "7.0.0"..<"9.0.0"),
        .package(url: "https://github.com/OneSignal/OneSignal-XCFramework", from: "5.0.0")
    ],
    targets: [
        // Obj-C helper that captures the iOS launchOptions dictionary at
        // process start (via +load + UIApplicationDidFinishLaunchingNotification)
        // so cold-start notification taps are still available when the JS
        // layer initializes the plugin later. SPM cannot mix Swift and Obj-C
        // in the same target, so this lives as its own target.
        .target(
            name: "OSCapacitorLaunchOptions",
            path: "ios/Sources/OSCapacitorLaunchOptions",
            publicHeadersPath: "include"
        ),
        .target(
            name: "OnesignalCapacitorPlugin",
            dependencies: capacitorPluginDependencies,
            path: "ios/Sources/OneSignalCapacitorPlugin"
        )
    ]
)
