// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "OneSignalCapacitorPlugin",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "OneSignalCapacitorPlugin",
            targets: ["OneSignalCapacitorPlugin"]
        )
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0"),
        .package(url: "https://github.com/nicklama/onesignal-xcframework-spm", from: "5.0.0")
    ],
    targets: [
        .target(
            name: "OneSignalCapacitorPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "OneSignalFramework", package: "onesignal-xcframework-spm")
            ],
            path: "ios/Sources/OneSignalCapacitorPlugin"
        )
    ]
)
