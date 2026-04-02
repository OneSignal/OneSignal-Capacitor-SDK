import Foundation
import OneSignalFramework

@objc public class OneSignalCapacitor: NSObject {
    @objc public func initialize(_ appId: String) {
        OneSignalWrapper.sdkType = "capacitor"
        OneSignalWrapper.sdkVersion = "010000"
        OneSignal.initialize(appId, withLaunchOptions: nil)
    }

    @objc public func login(_ externalId: String) {
        OneSignal.login(externalId)
    }

    @objc public func logout() {
        OneSignal.logout()
    }

    @objc public func setConsentRequired(_ required: Bool) {
        OneSignal.setConsentRequired(required)
    }

    @objc public func setConsentGiven(_ granted: Bool) {
        OneSignal.setConsentGiven(granted)
    }

    @objc public func setLogLevel(_ logLevel: Int) {
        OneSignal.Debug.setLogLevel(ONE_S_LOG_LEVEL(rawValue: UInt32(logLevel))!)
    }

    @objc public func setAlertLevel(_ logLevel: Int) {
        OneSignal.Debug.setAlertLevel(ONE_S_LOG_LEVEL(rawValue: UInt32(logLevel))!)
    }
}
