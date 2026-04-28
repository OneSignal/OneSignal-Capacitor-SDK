// swift-tools-version: 5.9

import PackageDescription

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
        .target(
            name: "OnesignalCapacitorPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                // InAppMessages and Location are separate library products in
                // OneSignal-XCFramework and must be linked explicitly under SPM,
                // otherwise their xcframeworks aren't loaded and the namespaces
                // are silent no-ops at runtime.
                .product(name: "OneSignalFramework", package: "OneSignal-XCFramework"),
                .product(name: "OneSignalInAppMessages", package: "OneSignal-XCFramework"),
                .product(name: "OneSignalLocation", package: "OneSignal-XCFramework"),
                .product(name: "OneSignalExtension", package: "OneSignal-XCFramework")
            ],
            path: "ios/Sources/OneSignalCapacitorPlugin"
        )
    ]
)
