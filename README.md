# OneSignal-Capacitor-SDK

The pure [Capacitor](https://capacitorjs.com/) plugin for [OneSignal](https://onesignal.com/), providing push notifications, in-app messaging, live activities, and more.

## Install

Install with your package manager of choice:

```bash
# with vp
vp add @onesignal/capacitor-plugin

# with bun
bun add @onesignal/capacitor-plugin

# with npm
npm install @onesignal/capacitor-plugin
```

Then sync Capacitor:

```bash
# with vp
vpx cap sync

# with bun
bunx cap sync

# with npm
npx cap sync
```

## Disabling OneSignal Location

If your app does not use `OneSignal.Location`, you can exclude the native OneSignal location module from iOS and Android builds.

Set `ONESIGNAL_DISABLE_LOCATION=true` in the environment before resolving or building native dependencies. The value is case-insensitive, and `1` is also accepted.

```bash
ONESIGNAL_DISABLE_LOCATION=true npx cap sync
```

For day-to-day native builds and runs, keep the same environment variable set so Capacitor, Swift Package Manager, CocoaPods, and Gradle do not re-resolve with the location module included:

```bash
ONESIGNAL_DISABLE_LOCATION=true npx cap run ios
ONESIGNAL_DISABLE_LOCATION=true npx cap run android
```

In GitHub Actions, set it once at the job or step level so Swift Package Manager, CocoaPods, and Gradle builds inherit it:

```yaml
env:
  ONESIGNAL_DISABLE_LOCATION: true
```

With the location module disabled, calls to `OneSignal.Location` are ignored on Android and `OneSignal.Location.isShared()` resolves `false`.

### Applying the change

The environment variable is read when native dependencies are resolved. If you change the variable in an existing project, clear the relevant cache and re-resolve in a shell where the variable is exported.

> [!IMPORTANT]
> When using Xcode or Android Studio, launch the IDE from a terminal that has `ONESIGNAL_DISABLE_LOCATION` exported. An IDE launched from the Dock/Finder does not inherit variables set only in your shell profile.

Swift Package Manager:

```bash
rm -rf ~/Library/Caches/org.swift.swiftpm ~/Library/Developer/Xcode/DerivedData/*
ONESIGNAL_DISABLE_LOCATION=true npx cap sync ios
```

In Xcode, you can instead use **File -> Packages -> Reset Package Caches** with the variable exported, then build.

CocoaPods:

```bash
cd ios/App
pod deintegrate
rm -rf Pods Podfile.lock
ONESIGNAL_DISABLE_LOCATION=true pod install
```

Android Gradle, which re-reads the variable on each configuration:

```bash
ONESIGNAL_DISABLE_LOCATION=true npx cap sync android
cd android
ONESIGNAL_DISABLE_LOCATION=true ./gradlew assembleDebug
```

On CI, key any DerivedData, SwiftPM, CocoaPods, or Gradle caches on the value of `ONESIGNAL_DISABLE_LOCATION` so a restored cache does not resurrect the location module.

## Usage

```ts
import OneSignal from '@onesignal/capacitor-plugin';

await OneSignal.initialize({ appId: 'YOUR_ONESIGNAL_APP_ID' });
await OneSignal.Notifications.requestPermission(true);
```

See the `examples/demo` directory for a full working example.

## API

<docgen-index>

* [`initialize(...)`](#initialize)
* [`login(...)`](#login)
* [`logout()`](#logout)
* [`setConsentRequired(...)`](#setconsentrequired)
* [`setConsentGiven(...)`](#setconsentgiven)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

The public OneSignal Capacitor plugin API. This is the shape of the default `OneSignal` export.

### initialize(...)

```typescript
initialize(appId: string) => Promise<void>
```

Initialize the SDK with your OneSignal app ID. Call during app startup.

| Param       | Type                |
| ----------- | ------------------- |
| **`appId`** | <code>string</code> |

--------------------


### login(...)

```typescript
login(externalId: string) => Promise<void>
```

Log in to OneSignal as the user identified by `externalId`, switching the user context.

| Param            | Type                |
| ---------------- | ------------------- |
| **`externalId`** | <code>string</code> |

--------------------


### logout()

```typescript
logout() => Promise<void>
```

Log out the current user. The SDK will reference a new device-scoped user.

--------------------


### setConsentRequired(...)

```typescript
setConsentRequired(required: boolean) => void
```

Set whether user privacy consent is required before sending data to OneSignal. Call before `initialize`.

| Param          | Type                 |
| -------------- | -------------------- |
| **`required`** | <code>boolean</code> |

--------------------


### setConsentGiven(...)

```typescript
setConsentGiven(granted: boolean) => void
```

Indicate whether the user has granted privacy consent.

| Param         | Type                 |
| ------------- | -------------------- |
| **`granted`** | <code>boolean</code> |

--------------------


### Interfaces


#### OneSignalDebugAPI

Debug helpers exposed via `OneSignal.Debug`.

| Method            | Signature                                                     | Description                                                               |
| ----------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **setLogLevel**   | (logLevel: <a href="#loglevel">LogLevel</a>) =&gt; void       | Set the log level printed to LogCat (Android) or the Xcode console (iOS). |
| **setAlertLevel** | (visualLogLevel: <a href="#loglevel">LogLevel</a>) =&gt; void | Set the log level shown to the user as alert dialogs.                     |


#### OneSignalUserAPI

Current-user operations exposed via `OneSignal.User`.

| Prop                   | Type                                                                                  | Description                                      |
| ---------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **`pushSubscription`** | <code><a href="#onesignalpushsubscriptionapi">OneSignalPushSubscriptionAPI</a></code> | Push subscription controls for the current user. |

| Method                  | Signature                                                                                                    | Description                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| **setLanguage**         | (language: string) =&gt; Promise&lt;void&gt;                                                                 | Explicitly set a 2-character language code for the current user.                          |
| **addAlias**            | (label: string, id: string) =&gt; Promise&lt;void&gt;                                                        | Add or overwrite a single alias on the current user.                                      |
| **addAliases**          | (aliases: <a href="#record">Record</a>&lt;string, string&gt;) =&gt; Promise&lt;void&gt;                      | Add or overwrite multiple aliases on the current user.                                    |
| **removeAlias**         | (label: string) =&gt; Promise&lt;void&gt;                                                                    | Remove a single alias by label from the current user.                                     |
| **removeAliases**       | (labels: string[]) =&gt; Promise&lt;void&gt;                                                                 | Remove multiple aliases by label from the current user.                                   |
| **addEmail**            | (email: string) =&gt; Promise&lt;void&gt;                                                                    | Add a new email subscription to the current user.                                         |
| **removeEmail**         | (email: string) =&gt; Promise&lt;void&gt;                                                                    | Remove an email subscription from the current user.                                       |
| **addSms**              | (smsNumber: string) =&gt; Promise&lt;void&gt;                                                                | Add a new SMS subscription to the current user.                                           |
| **removeSms**           | (smsNumber: string) =&gt; Promise&lt;void&gt;                                                                | Remove an SMS subscription from the current user.                                         |
| **addTag**              | (key: string, value: string) =&gt; Promise&lt;void&gt;                                                       | Add a single tag (key/value) on the current user, used for targeting and personalization. |
| **addTags**             | (tags: object) =&gt; Promise&lt;void&gt;                                                                     | Add or overwrite multiple tags on the current user.                                       |
| **removeTag**           | (key: string) =&gt; Promise&lt;void&gt;                                                                      | Remove a single tag by key from the current user.                                         |
| **removeTags**          | (keys: string[]) =&gt; Promise&lt;void&gt;                                                                   | Remove multiple tags by key from the current user.                                        |
| **getTags**             | () =&gt; Promise&lt;{ [key: string]: string; }&gt;                                                           | Get the local tags for the current user.                                                  |
| **addEventListener**    | (event: 'change', listener: (event: <a href="#userchangedstate">UserChangedState</a>) =&gt; void) =&gt; void | Add a listener for OneSignal user state changes.                                          |
| **removeEventListener** | (event: 'change', listener: (event: <a href="#userchangedstate">UserChangedState</a>) =&gt; void) =&gt; void | Remove a previously added user state listener.                                            |
| **getOnesignalId**      | () =&gt; Promise&lt;string \| null&gt;                                                                       | Get the OneSignal-assigned ID for the current user, or null if not yet available.         |
| **getExternalId**       | () =&gt; Promise&lt;string \| null&gt;                                                                       | Get the external ID set via `login`, or null if the user is anonymous.                    |
| **trackEvent**          | (name: string, properties?: object \| undefined) =&gt; Promise&lt;void&gt;                                   | Track a custom event with an optional set of JSON-serializable properties.                |


#### UserChangedState

| Prop          | Type                                            |
| ------------- | ----------------------------------------------- |
| **`current`** | <code><a href="#userstate">UserState</a></code> |


#### UserState

| Prop              | Type                |
| ----------------- | ------------------- |
| **`onesignalId`** | <code>string</code> |
| **`externalId`**  | <code>string</code> |


#### OneSignalPushSubscriptionAPI

Push subscription state and controls exposed via `OneSignal.User.pushSubscription`.

| Method                  | Signature                                                                                                                            | Description                                                                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **getIdAsync**          | () =&gt; Promise&lt;string \| null&gt;                                                                                               | Get the current device's push subscription ID, or null if not yet assigned.                                                                                                                         |
| **getTokenAsync**       | () =&gt; Promise&lt;string \| null&gt;                                                                                               | Get the current device's push token, or null if not yet available.                                                                                                                                  |
| **getOptedInAsync**     | () =&gt; Promise&lt;boolean&gt;                                                                                                      | Whether the current user is opted in to push notifications. Returns true when the app has notification permission and `optOut()` has not been called. Does not guarantee a token has been received. |
| **addEventListener**    | (event: 'change', listener: (event: <a href="#pushsubscriptionchangedstate">PushSubscriptionChangedState</a>) =&gt; void) =&gt; void | Add a listener for push subscription state changes.                                                                                                                                                 |
| **removeEventListener** | (event: 'change', listener: (event: <a href="#pushsubscriptionchangedstate">PushSubscriptionChangedState</a>) =&gt; void) =&gt; void | Remove a previously added push subscription state listener.                                                                                                                                         |
| **optIn**               | () =&gt; Promise&lt;void&gt;                                                                                                         | Opt the user in to push notifications. Prompts for permission if needed.                                                                                                                            |
| **optOut**              | () =&gt; Promise&lt;void&gt;                                                                                                         | Opt the user out of push notifications on this device.                                                                                                                                              |


#### PushSubscriptionChangedState

| Prop           | Type                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| **`previous`** | <code><a href="#pushsubscriptionstate">PushSubscriptionState</a></code> |
| **`current`**  | <code><a href="#pushsubscriptionstate">PushSubscriptionState</a></code> |


#### PushSubscriptionState

| Prop          | Type                 |
| ------------- | -------------------- |
| **`id`**      | <code>string</code>  |
| **`token`**   | <code>string</code>  |
| **`optedIn`** | <code>boolean</code> |


#### OneSignalNotificationsAPI

Notification permission and event handling exposed via `OneSignal.Notifications`.

| Method                                  | Signature                                                                                                                                                    | Description                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| **hasPermission**                       | () =&gt; Promise&lt;boolean&gt;                                                                                                                              | Whether the app currently has notification permission (including provisional/ephemeral). |
| **permissionNative**                    | () =&gt; Promise&lt;<a href="#osnotificationpermission">OSNotificationPermission</a>&gt;                                                                     | iOS only. The native notification permission status.                                     |
| **requestPermission**                   | (fallbackToSettings?: boolean \| undefined) =&gt; Promise&lt;boolean&gt;                                                                                     | Prompt the user for notification permission. Optionally fall back to system settings.    |
| **canRequestPermission**                | () =&gt; Promise&lt;boolean&gt;                                                                                                                              | Whether requesting notification permission would still show a prompt.                    |
| **registerForProvisionalAuthorization** | (handler?: ((response: boolean) =&gt; void) \| undefined) =&gt; void                                                                                         | iOS only. Request provisional authorization for quiet notifications without prompting.   |
| **addEventListener**                    | &lt;K extends <a href="#notificationeventname">NotificationEventName</a>&gt;(event: K, listener: (event: NotificationEventTypeMap[K]) =&gt; void) =&gt; void | Add a listener for `click`, `foregroundWillDisplay`, or `permissionChange` events.       |
| **removeEventListener**                 | &lt;K extends <a href="#notificationeventname">NotificationEventName</a>&gt;(event: K, listener: (obj: NotificationEventTypeMap[K]) =&gt; void) =&gt; void   | Remove a previously added notification event listener.                                   |
| **clearAll**                            | () =&gt; Promise&lt;void&gt;                                                                                                                                 | Remove all OneSignal notifications from the notification center.                         |
| **removeNotification**                  | (id: number) =&gt; Promise&lt;void&gt;                                                                                                                       | Android only. Cancel a single notification by its Android notification ID.               |
| **removeGroupedNotifications**          | (id: string) =&gt; Promise&lt;void&gt;                                                                                                                       | Android only. Cancel a group of notifications by group key.                              |


#### NotificationClickEvent

| Prop               | Type                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| **`result`**       | <code><a href="#notificationclickresult">NotificationClickResult</a></code> |
| **`notification`** | <code>OSNotification</code>                                                 |


#### NotificationClickResult

| Prop           | Type                |
| -------------- | ------------------- |
| **`actionId`** | <code>string</code> |
| **`url`**      | <code>string</code> |


#### OneSignalInAppMessagesAPI

In-app message triggers and event handling exposed via `OneSignal.InAppMessages`.

| Method                  | Signature                                                                                                                                                    | Description                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| **addEventListener**    | &lt;K extends <a href="#inappmessageeventname">InAppMessageEventName</a>&gt;(event: K, listener: (event: InAppMessageEventTypeMap[K]) =&gt; void) =&gt; void | Add a listener for IAM `click`, `willDisplay`, `didDisplay`, `willDismiss`, or `didDismiss` events. |
| **removeEventListener** | &lt;K extends <a href="#inappmessageeventname">InAppMessageEventName</a>&gt;(event: K, listener: (obj: InAppMessageEventTypeMap[K]) =&gt; void) =&gt; void   | Remove a previously added IAM event listener.                                                       |
| **addTrigger**          | (key: string, value: string) =&gt; Promise&lt;void&gt;                                                                                                       | Add a single trigger (key/value) used to determine which IAMs are displayed to the user.            |
| **addTriggers**         | (triggers: { [key: string]: string; }) =&gt; Promise&lt;void&gt;                                                                                             | Add or overwrite multiple triggers for the current user.                                            |
| **removeTrigger**       | (key: string) =&gt; Promise&lt;void&gt;                                                                                                                      | Remove a single trigger by key.                                                                     |
| **removeTriggers**      | (keys: string[]) =&gt; Promise&lt;void&gt;                                                                                                                   | Remove multiple triggers by key.                                                                    |
| **clearTriggers**       | () =&gt; Promise&lt;void&gt;                                                                                                                                 | Clear all triggers from the current user.                                                           |
| **setPaused**           | (pause: boolean) =&gt; void                                                                                                                                  | Pause or resume the display of in-app messages.                                                     |
| **getPaused**           | () =&gt; Promise&lt;boolean&gt;                                                                                                                              | Whether in-app messaging is currently paused.                                                       |


#### InAppMessageClickEvent

| Prop          | Type                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| **`message`** | <code><a href="#osinappmessage">OSInAppMessage</a></code>                   |
| **`result`**  | <code><a href="#inappmessageclickresult">InAppMessageClickResult</a></code> |


#### OSInAppMessage

| Prop            | Type                |
| --------------- | ------------------- |
| **`messageId`** | <code>string</code> |


#### InAppMessageClickResult

| Prop                 | Type                                                                            |
| -------------------- | ------------------------------------------------------------------------------- |
| **`closingMessage`** | <code>boolean</code>                                                            |
| **`actionId`**       | <code>string</code>                                                             |
| **`url`**            | <code>string</code>                                                             |
| **`urlTarget`**      | <code><a href="#inappmessageactionurltype">InAppMessageActionUrlType</a></code> |


#### InAppMessageWillDisplayEvent

| Prop          | Type                                                      |
| ------------- | --------------------------------------------------------- |
| **`message`** | <code><a href="#osinappmessage">OSInAppMessage</a></code> |


#### InAppMessageDidDisplayEvent

| Prop          | Type                                                      |
| ------------- | --------------------------------------------------------- |
| **`message`** | <code><a href="#osinappmessage">OSInAppMessage</a></code> |


#### InAppMessageWillDismissEvent

| Prop          | Type                                                      |
| ------------- | --------------------------------------------------------- |
| **`message`** | <code><a href="#osinappmessage">OSInAppMessage</a></code> |


#### InAppMessageDidDismissEvent

| Prop          | Type                                                      |
| ------------- | --------------------------------------------------------- |
| **`message`** | <code><a href="#osinappmessage">OSInAppMessage</a></code> |


#### OneSignalSessionAPI

Outcome reporting exposed via `OneSignal.Session`.

| Method                  | Signature                                               | Description                                                                                        |
| ----------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **addOutcome**          | (name: string) =&gt; Promise&lt;void&gt;                | <a href="#record">Record</a> an outcome with the given name against the current session.           |
| **addUniqueOutcome**    | (name: string) =&gt; Promise&lt;void&gt;                | <a href="#record">Record</a> a unique outcome with the given name against the current session.     |
| **addOutcomeWithValue** | (name: string, value: number) =&gt; Promise&lt;void&gt; | <a href="#record">Record</a> an outcome with the given name and value against the current session. |


#### OneSignalLocationAPI

Location permission and sharing exposed via `OneSignal.Location`.

| Method                | Signature                       | Description                                                     |
| --------------------- | ------------------------------- | --------------------------------------------------------------- |
| **requestPermission** | () =&gt; Promise&lt;void&gt;    | Prompt the user for location permission to enable geotagging.   |
| **setShared**         | (shared: boolean) =&gt; void    | Enable or disable sharing the device location with OneSignal.   |
| **isShared**          | () =&gt; Promise&lt;boolean&gt; | Whether the device location is currently shared with OneSignal. |


#### OneSignalLiveActivitiesAPI

Live activity controls exposed via `OneSignal.LiveActivities`. iOS only unless noted.

| Method                     | Signature                                                                                                                                                                     | Description                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **enter**                  | (activityId: string, token: string, onSuccess?: ((data: unknown) =&gt; void) \| undefined, onFailure?: ((data: unknown) =&gt; void) \| undefined) =&gt; void                  | Associate a live activity ID with a push token so OneSignal can target it.                |
| **exit**                   | (activityId: string, onSuccess?: ((data: unknown) =&gt; void) \| undefined, onFailure?: ((data: unknown) =&gt; void) \| undefined) =&gt; void                                 | Disassociate a live activity ID.                                                          |
| **setPushToStartToken**    | (activityType: string, token: string) =&gt; Promise&lt;void&gt;                                                                                                               | Register a `pushToStart` token for the given live activity attributes type.               |
| **removePushToStartToken** | (activityType: string) =&gt; Promise&lt;void&gt;                                                                                                                              | Remove a previously registered `pushToStart` token for the given attributes type.         |
| **setupDefault**           | (options?: <a href="#liveactivitysetupoptions">LiveActivitySetupOptions</a> \| undefined) =&gt; Promise&lt;void&gt;                                                           | Set up the OneSignal default live activity, optionally enabling pushToStart/pushToUpdate. |
| **startDefault**           | (activityId: string, attributes: <a href="#record">Record</a>&lt;string, unknown&gt;, content: <a href="#record">Record</a>&lt;string, unknown&gt;) =&gt; Promise&lt;void&gt; | Start a live activity backed by the OneSignal default attributes type.                    |


### Type Aliases


#### LogLevel

<code>(typeof <a href="#loglevel">LogLevel</a>)[keyof typeof LogLevel]</code>


#### Record

Construct a type with a set of properties K of type T

<code>{ [P in K]: T; }</code>


#### OSNotificationPermission

<code>(typeof <a href="#osnotificationpermission">OSNotificationPermission</a>)[keyof typeof OSNotificationPermission]</code>


#### NotificationEventName

<code>'click' | 'foregroundWillDisplay' | 'permissionChange'</code>


#### NotificationEventTypeMap

<code>{ click: <a href="#notificationclickevent">NotificationClickEvent</a>; foregroundWillDisplay: NotificationWillDisplayEvent; permissionChange: boolean; }</code>


#### InAppMessageEventName

<code>'click' | 'willDisplay' | 'didDisplay' | 'willDismiss' | 'didDismiss'</code>


#### InAppMessageEventTypeMap

<code>{ click: <a href="#inappmessageclickevent">InAppMessageClickEvent</a>; willDisplay: <a href="#inappmessagewilldisplayevent">InAppMessageWillDisplayEvent</a>; didDisplay: <a href="#inappmessagediddisplayevent">InAppMessageDidDisplayEvent</a>; willDismiss: <a href="#inappmessagewilldismissevent">InAppMessageWillDismissEvent</a>; didDismiss: <a href="#inappmessagediddismissevent">InAppMessageDidDismissEvent</a>; }</code>


#### InAppMessageActionUrlType

<code>'browser' | 'webview' | 'replacement'</code>


#### LiveActivitySetupOptions

The setup options for `OneSignal.LiveActivities.setupDefault`.

<code>{ /** * When true, OneSignal will listen for pushToStart tokens for the `OneSignalLiveActivityAttributes` structure. */ enablePushToStart: boolean; /** * When true, OneSignal will listen for pushToUpdate tokens for each start live activity that uses the * `OneSignalLiveActivityAttributes` structure. */ enablePushToUpdate: boolean; }</code>

</docgen-api>
