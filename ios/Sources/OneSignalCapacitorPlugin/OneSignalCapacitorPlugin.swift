import Foundation
import Capacitor
import OneSignalFramework
import OneSignalLiveActivities

@objc(OneSignalCapacitorPlugin)
public class OneSignalCapacitorPlugin: CAPPlugin, CAPBridgedPlugin,
    OSNotificationPermissionObserver,
    OSNotificationLifecycleListener,
    OSNotificationClickListener,
    OSPushSubscriptionObserver,
    OSInAppMessageLifecycleListener,
    OSInAppMessageClickListener,
    OSUserStateObserver {

    public let identifier = "OneSignalCapacitorPlugin"
    public let jsName = "OneSignalCapacitor"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "initialize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "login", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "logout", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setConsentRequired", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setConsentGiven", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setLogLevel", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setAlertLevel", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setLanguage", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "addAliases", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "removeAliases", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "addEmail", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "removeEmail", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "addSms", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "removeSms", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "addTags", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "removeTags", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getTags", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getOnesignalId", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getExternalId", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "trackEvent", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPushSubscriptionId", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPushSubscriptionToken", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPushSubscriptionOptedIn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "optInPushSubscription", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "optOutPushSubscription", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "permissionNative", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "canRequestPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "registerForProvisionalAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearAllNotifications", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "removeNotification", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "removeGroupedNotifications", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "preventDefault", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "proceedWithWillDisplay", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "displayNotification", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "addTriggers", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "removeTriggers", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearTriggers", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setPaused", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isPaused", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "addOutcome", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "addUniqueOutcome", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "addOutcomeWithValue", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestLocationPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setLocationShared", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isLocationShared", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "enterLiveActivity", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "exitLiveActivity", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setPushToStartToken", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "removePushToStartToken", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setupDefaultLiveActivity", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startDefaultLiveActivity", returnType: CAPPluginReturnPromise),
    ]

    private var notificationWillDisplayCache = [String: OSNotificationWillDisplayEvent]()
    private var preventDefaultCache = [String: OSNotificationWillDisplayEvent]()
    private var pendingClickEvent: OSNotificationClickEvent?

    // MARK: - Core

    @objc func initialize(_ call: CAPPluginCall) {
        guard let appId = call.getString("appId") else {
            call.reject("appId is required")
            return
        }
        OneSignalWrapper.sdkType = "capacitor"
        OneSignalWrapper.sdkVersion = "010000"
        OneSignal.initialize(appId, withLaunchOptions: nil)
        OneSignal.Notifications.addPermissionObserver(self)
        OneSignal.Notifications.addForegroundLifecycleListener(self)
        OneSignal.Notifications.addClickListener(self)
        OneSignal.User.pushSubscription.addObserver(self)
        OneSignal.User.addObserver(self)
        OneSignal.InAppMessages.addLifecycleListener(self)
        OneSignal.InAppMessages.addClickListener(self)

        if let pending = pendingClickEvent {
            sendNotificationClickEvent(pending)
            pendingClickEvent = nil
        }
        call.resolve()
    }

    @objc func login(_ call: CAPPluginCall) {
        guard let externalId = call.getString("externalId") else {
            call.reject("externalId is required")
            return
        }
        OneSignal.login(externalId)
        call.resolve()
    }

    @objc func logout(_ call: CAPPluginCall) {
        OneSignal.logout()
        call.resolve()
    }

    @objc func setConsentRequired(_ call: CAPPluginCall) {
        let required = call.getBool("required") ?? false
        OneSignal.setConsentRequired(required)
        call.resolve()
    }

    @objc func setConsentGiven(_ call: CAPPluginCall) {
        let granted = call.getBool("granted") ?? false
        OneSignal.setConsentGiven(granted)
        call.resolve()
    }

    // MARK: - Debug

    @objc func setLogLevel(_ call: CAPPluginCall) {
        let level = call.getInt("logLevel") ?? 0
        OneSignal.Debug.setLogLevel(ONE_S_LOG_LEVEL(rawValue: UInt(level))!)
        call.resolve()
    }

    @objc func setAlertLevel(_ call: CAPPluginCall) {
        let level = call.getInt("logLevel") ?? 0
        OneSignal.Debug.setAlertLevel(ONE_S_LOG_LEVEL(rawValue: UInt(level))!)
        call.resolve()
    }

    // MARK: - User

    @objc func setLanguage(_ call: CAPPluginCall) {
        guard let language = call.getString("language") else {
            call.reject("language is required")
            return
        }
        OneSignal.User.setLanguage(language)
        call.resolve()
    }

    @objc func addAliases(_ call: CAPPluginCall) {
        guard let aliases = call.getObject("aliases") as? [String: String] else {
            call.reject("aliases is required")
            return
        }
        OneSignal.User.addAliases(aliases)
        call.resolve()
    }

    @objc func removeAliases(_ call: CAPPluginCall) {
        guard let labels = call.getArray("labels", String.self) else {
            call.reject("labels is required")
            return
        }
        OneSignal.User.removeAliases(labels)
        call.resolve()
    }

    @objc func addEmail(_ call: CAPPluginCall) {
        guard let email = call.getString("email") else {
            call.reject("email is required")
            return
        }
        OneSignal.User.addEmail(email)
        call.resolve()
    }

    @objc func removeEmail(_ call: CAPPluginCall) {
        guard let email = call.getString("email") else {
            call.reject("email is required")
            return
        }
        OneSignal.User.removeEmail(email)
        call.resolve()
    }

    @objc func addSms(_ call: CAPPluginCall) {
        guard let smsNumber = call.getString("smsNumber") else {
            call.reject("smsNumber is required")
            return
        }
        OneSignal.User.addSms(smsNumber)
        call.resolve()
    }

    @objc func removeSms(_ call: CAPPluginCall) {
        guard let smsNumber = call.getString("smsNumber") else {
            call.reject("smsNumber is required")
            return
        }
        OneSignal.User.removeSms(smsNumber)
        call.resolve()
    }

    @objc func addTags(_ call: CAPPluginCall) {
        guard let tags = call.getObject("tags") as? [String: String] else {
            call.reject("tags is required")
            return
        }
        OneSignal.User.addTags(tags)
        call.resolve()
    }

    @objc func removeTags(_ call: CAPPluginCall) {
        guard let keys = call.getArray("keys", String.self) else {
            call.reject("keys is required")
            return
        }
        OneSignal.User.removeTags(keys)
        call.resolve()
    }

    @objc func getTags(_ call: CAPPluginCall) {
        let tags = OneSignal.User.getTags()
        call.resolve(["tags": tags])
    }

    @objc func getOnesignalId(_ call: CAPPluginCall) {
        call.resolve(["onesignalId": OneSignal.User.onesignalId ?? NSNull()])
    }

    @objc func getExternalId(_ call: CAPPluginCall) {
        call.resolve(["externalId": OneSignal.User.externalId ?? NSNull()])
    }

    @objc func trackEvent(_ call: CAPPluginCall) {
        guard let name = call.getString("name") else {
            call.reject("name is required")
            return
        }
        let properties = call.getObject("properties")
        OneSignal.User.trackEvent(name: name, properties: properties)
        call.resolve()
    }

    // MARK: - Push Subscription

    @objc func getPushSubscriptionId(_ call: CAPPluginCall) {
        call.resolve(["id": OneSignal.User.pushSubscription.id ?? NSNull()])
    }

    @objc func getPushSubscriptionToken(_ call: CAPPluginCall) {
        call.resolve(["token": OneSignal.User.pushSubscription.token ?? NSNull()])
    }

    @objc func getPushSubscriptionOptedIn(_ call: CAPPluginCall) {
        call.resolve(["optedIn": OneSignal.User.pushSubscription.optedIn])
    }

    @objc func optInPushSubscription(_ call: CAPPluginCall) {
        OneSignal.User.pushSubscription.optIn()
        call.resolve()
    }

    @objc func optOutPushSubscription(_ call: CAPPluginCall) {
        OneSignal.User.pushSubscription.optOut()
        call.resolve()
    }

    // MARK: - Notifications

    @objc func getPermission(_ call: CAPPluginCall) {
        call.resolve(["permission": OneSignal.Notifications.permission])
    }

    @objc func permissionNative(_ call: CAPPluginCall) {
        call.resolve(["permission": OneSignal.Notifications.permissionNative.rawValue])
    }

    @objc func requestPermission(_ call: CAPPluginCall) {
        let fallback = call.getBool("fallbackToSettings") ?? false
        OneSignal.Notifications.requestPermission({ accepted in
            call.resolve(["permission": accepted])
        }, fallbackToSettings: fallback)
    }

    @objc func canRequestPermission(_ call: CAPPluginCall) {
        call.resolve(["canRequest": OneSignal.Notifications.canRequestPermission])
    }

    @objc func registerForProvisionalAuthorization(_ call: CAPPluginCall) {
        OneSignal.Notifications.registerForProvisionalAuthorization { accepted in
            call.resolve(["accepted": accepted])
        }
    }

    @objc func clearAllNotifications(_ call: CAPPluginCall) {
        OneSignal.Notifications.clearAll()
        call.resolve()
    }

    @objc func removeNotification(_ call: CAPPluginCall) {
        call.resolve()
    }

    @objc func removeGroupedNotifications(_ call: CAPPluginCall) {
        call.resolve()
    }

    @objc func preventDefault(_ call: CAPPluginCall) {
        guard let notificationId = call.getString("notificationId") else {
            call.reject("notificationId is required")
            return
        }
        guard let event = notificationWillDisplayCache[notificationId] else {
            call.reject("Could not find notification will display event")
            return
        }
        event.preventDefault()
        preventDefaultCache[notificationId] = event
        call.resolve()
    }

    @objc func proceedWithWillDisplay(_ call: CAPPluginCall) {
        guard let notificationId = call.getString("notificationId") else {
            call.reject("notificationId is required")
            return
        }
        guard let event = notificationWillDisplayCache[notificationId] else {
            call.reject("Could not find notification will display event")
            return
        }
        if preventDefaultCache[notificationId] == nil {
            event.notification.display()
        }
        call.resolve()
    }

    @objc func displayNotification(_ call: CAPPluginCall) {
        guard let notificationId = call.getString("notificationId") else {
            call.reject("notificationId is required")
            return
        }
        guard let event = notificationWillDisplayCache[notificationId] else {
            call.reject("Could not find notification will display event")
            return
        }
        event.notification.display()
        call.resolve()
    }

    // MARK: - In-App Messages

    @objc func addTriggers(_ call: CAPPluginCall) {
        guard let triggers = call.getObject("triggers") as? [String: String] else {
            call.reject("triggers is required")
            return
        }
        OneSignal.InAppMessages.addTriggers(triggers)
        call.resolve()
    }

    @objc func removeTriggers(_ call: CAPPluginCall) {
        guard let keys = call.getArray("keys", String.self) else {
            call.reject("keys is required")
            return
        }
        OneSignal.InAppMessages.removeTriggers(keys)
        call.resolve()
    }

    @objc func clearTriggers(_ call: CAPPluginCall) {
        OneSignal.InAppMessages.clearTriggers()
        call.resolve()
    }

    @objc func setPaused(_ call: CAPPluginCall) {
        let pause = call.getBool("pause") ?? false
        OneSignal.InAppMessages.paused = pause
        call.resolve()
    }

    @objc func isPaused(_ call: CAPPluginCall) {
        call.resolve(["paused": OneSignal.InAppMessages.paused])
    }

    // MARK: - Session / Outcomes

    @objc func addOutcome(_ call: CAPPluginCall) {
        guard let name = call.getString("name") else {
            call.reject("name is required")
            return
        }
        OneSignal.Session.addOutcome(name)
        call.resolve()
    }

    @objc func addUniqueOutcome(_ call: CAPPluginCall) {
        guard let name = call.getString("name") else {
            call.reject("name is required")
            return
        }
        OneSignal.Session.addUniqueOutcome(name)
        call.resolve()
    }

    @objc func addOutcomeWithValue(_ call: CAPPluginCall) {
        guard let name = call.getString("name") else {
            call.reject("name is required")
            return
        }
        let value = call.getFloat("value") ?? 0
        OneSignal.Session.addOutcome(name, NSNumber(value: value))
        call.resolve()
    }

    // MARK: - Location

    @objc func requestLocationPermission(_ call: CAPPluginCall) {
        OneSignal.Location.requestPermission()
        call.resolve()
    }

    @objc func setLocationShared(_ call: CAPPluginCall) {
        let shared = call.getBool("shared") ?? false
        OneSignal.Location.isShared = shared
        call.resolve()
    }

    @objc func isLocationShared(_ call: CAPPluginCall) {
        call.resolve(["shared": OneSignal.Location.isShared])
    }

    // MARK: - Live Activities

    @objc func enterLiveActivity(_ call: CAPPluginCall) {
        guard let activityId = call.getString("activityId"),
              let token = call.getString("token") else {
            call.reject("activityId and token are required")
            return
        }
        OneSignal.LiveActivities.enter(activityId, withToken: token, withSuccess: { _ in
            call.resolve()
        }, withFailure: { error in
            call.reject(error?.localizedDescription ?? "Unknown error")
        })
    }

    @objc func exitLiveActivity(_ call: CAPPluginCall) {
        guard let activityId = call.getString("activityId") else {
            call.reject("activityId is required")
            return
        }
        OneSignal.LiveActivities.exit(activityId, withSuccess: { _ in
            call.resolve()
        }, withFailure: { error in
            call.reject(error?.localizedDescription ?? "Unknown error")
        })
    }

    @objc func setPushToStartToken(_ call: CAPPluginCall) {
        #if !targetEnvironment(macCatalyst)
        guard let activityType = call.getString("activityType"),
              let token = call.getString("token") else {
            call.reject("activityType and token are required")
            return
        }
        if #available(iOS 17.2, *) {
            do {
                try OneSignalLiveActivitiesManagerImpl.setPushToStartToken(activityType, withToken: token)
            } catch {
                call.reject("activityType must be the name of your ActivityAttributes struct")
                return
            }
        }
        #endif
        call.resolve()
    }

    @objc func removePushToStartToken(_ call: CAPPluginCall) {
        #if !targetEnvironment(macCatalyst)
        guard let activityType = call.getString("activityType") else {
            call.reject("activityType is required")
            return
        }
        if #available(iOS 17.2, *) {
            do {
                try OneSignalLiveActivitiesManagerImpl.removePushToStartToken(activityType)
            } catch {
                call.reject("activityType must be the name of your ActivityAttributes struct")
                return
            }
        }
        #endif
        call.resolve()
    }

    @objc func setupDefaultLiveActivity(_ call: CAPPluginCall) {
        #if !targetEnvironment(macCatalyst)
        if #available(iOS 16.1, *) {
            var laOptions: LiveActivitySetupOptions? = nil
            if let enablePushToStart = call.getBool("enablePushToStart"),
               let enablePushToUpdate = call.getBool("enablePushToUpdate") {
                laOptions = LiveActivitySetupOptions()
                laOptions?.enablePushToStart = enablePushToStart
                laOptions?.enablePushToUpdate = enablePushToUpdate
            }
            OneSignalLiveActivitiesManagerImpl.setupDefault(options: laOptions)
        }
        #endif
        call.resolve()
    }

    @objc func startDefaultLiveActivity(_ call: CAPPluginCall) {
        #if !targetEnvironment(macCatalyst)
        guard let activityId = call.getString("activityId"),
              let attributes = call.getObject("attributes"),
              let content = call.getObject("content") else {
            call.reject("activityId, attributes, and content are required")
            return
        }
        if #available(iOS 16.1, *) {
            OneSignalLiveActivitiesManagerImpl.startDefault(activityId, attributes: attributes, content: content)
        }
        #endif
        call.resolve()
    }

    // MARK: - Observer Callbacks

    public func onNotificationPermissionDidChange(_ permission: Bool) {
        notifyListeners("permissionChange", data: ["permission": permission])
    }

    public func onPushSubscriptionDidChange(state: OSPushSubscriptionChangedState) {
        var previous: [String: Any] = ["optedIn": state.previous.optedIn]
        if let id = state.previous.id { previous["id"] = id }
        if let token = state.previous.token { previous["token"] = token }

        var current: [String: Any] = ["optedIn": state.current.optedIn]
        if let id = state.current.id { current["id"] = id }
        if let token = state.current.token { current["token"] = token }

        notifyListeners("pushSubscriptionChange", data: [
            "previous": previous,
            "current": current
        ])
    }

    public func onUserStateDidChange(state: OSUserChangedState) {
        var current: [String: Any] = [:]
        if let onesignalId = state.current.onesignalId { current["onesignalId"] = onesignalId }
        if let externalId = state.current.externalId { current["externalId"] = externalId }

        notifyListeners("userStateChange", data: ["current": current])
    }

    public func onWillDisplay(event: OSNotificationWillDisplayEvent) {
        guard let notificationId = event.notification.notificationId else { return }
        notificationWillDisplayCache[notificationId] = event
        event.preventDefault()
        if let data = event.notification.stringify().data(using: .utf8),
           let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            notifyListeners("notificationForegroundWillDisplay", data: json)
        }
    }

    public func onClick(event: OSNotificationClickEvent) {
        if bridge != nil {
            sendNotificationClickEvent(event)
        } else {
            pendingClickEvent = event
        }
    }

    private func sendNotificationClickEvent(_ event: OSNotificationClickEvent) {
        if let data = event.stringify().data(using: .utf8),
           let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            notifyListeners("notificationClick", data: json)
        }
    }

    @objc(onWillDisplayInAppMessage:)
    public func onWillDisplay(event: OSInAppMessageWillDisplayEvent) {
        notifyListeners("inAppMessageWillDisplay", data: [
            "message": ["messageId": event.message.messageId]
        ])
    }

    @objc(onDidDisplayInAppMessage:)
    public func onDidDisplay(event: OSInAppMessageDidDisplayEvent) {
        notifyListeners("inAppMessageDidDisplay", data: [
            "message": ["messageId": event.message.messageId]
        ])
    }

    @objc(onWillDismissInAppMessage:)
    public func onWillDismiss(event: OSInAppMessageWillDismissEvent) {
        notifyListeners("inAppMessageWillDismiss", data: [
            "message": ["messageId": event.message.messageId]
        ])
    }

    @objc(onDidDismissInAppMessage:)
    public func onDidDismiss(event: OSInAppMessageDidDismissEvent) {
        notifyListeners("inAppMessageDidDismiss", data: [
            "message": ["messageId": event.message.messageId]
        ])
    }

    public func onClick(event: OSInAppMessageClickEvent) {
        let urlTargetStr: String
        switch event.result.urlTarget.rawValue {
        case 0: urlTargetStr = "browser"
        case 1: urlTargetStr = "webview"
        case 2: urlTargetStr = "replacement"
        default: urlTargetStr = "browser"
        }

        var clickResult: [String: Any] = [
            "closingMessage": event.result.closingMessage
        ]
        if let actionId = event.result.actionId {
            clickResult["actionId"] = actionId
        }
        if let url = event.result.url {
            clickResult["url"] = url
        }
        clickResult["urlTarget"] = urlTargetStr

        notifyListeners("inAppMessageClick", data: [
            "message": ["messageId": event.message.messageId],
            "result": clickResult
        ])
    }
}
