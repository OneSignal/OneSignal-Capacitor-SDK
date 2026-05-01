# OneSignal-Capacitor-SDK

The pure [Capacitor](https://capacitorjs.com/) plugin for [OneSignal](https://onesignal.com/), providing push notifications, in-app messaging, live activities, and more.

## Install

```bash
npm install onesignal-capacitor-plugin
npx cap sync
```

## Usage

```ts
import OneSignal from 'onesignal-capacitor-plugin';

await OneSignal.initialize({ appId: 'YOUR_ONESIGNAL_APP_ID' });
await OneSignal.Notifications.requestPermission(true);
```

See the `examples/demo` directory for a full working example.

## API

<docgen-index>

- [`initialize(...)`](#initialize)
- [`login(...)`](#login)
- [`logout()`](#logout)
- [`setConsentRequired(...)`](#setconsentrequired)
- [`setConsentGiven(...)`](#setconsentgiven)
- [`setLogLevel(...)`](#setloglevel)
- [`setAlertLevel(...)`](#setalertlevel)
- [`setLanguage(...)`](#setlanguage)
- [`addAliases(...)`](#addaliases)
- [`removeAliases(...)`](#removealiases)
- [`addEmail(...)`](#addemail)
- [`removeEmail(...)`](#removeemail)
- [`addSms(...)`](#addsms)
- [`removeSms(...)`](#removesms)
- [`addTags(...)`](#addtags)
- [`removeTags(...)`](#removetags)
- [`getTags()`](#gettags)
- [`getOnesignalId()`](#getonesignalid)
- [`getExternalId()`](#getexternalid)
- [`trackEvent(...)`](#trackevent)
- [`getPushSubscriptionId()`](#getpushsubscriptionid)
- [`getPushSubscriptionToken()`](#getpushsubscriptiontoken)
- [`getPushSubscriptionOptedIn()`](#getpushsubscriptionoptedin)
- [`optInPushSubscription()`](#optinpushsubscription)
- [`optOutPushSubscription()`](#optoutpushsubscription)
- [`getPermission()`](#getpermission)
- [`permissionNative()`](#permissionnative)
- [`requestPermission(...)`](#requestpermission)
- [`canRequestPermission()`](#canrequestpermission)
- [`registerForProvisionalAuthorization()`](#registerforprovisionalauthorization)
- [`clearAllNotifications()`](#clearallnotifications)
- [`removeNotification(...)`](#removenotification)
- [`removeGroupedNotifications(...)`](#removegroupednotifications)
- [`preventDefault(...)`](#preventdefault)
- [`proceedWithWillDisplay(...)`](#proceedwithwilldisplay)
- [`displayNotification(...)`](#displaynotification)
- [`addTriggers(...)`](#addtriggers)
- [`removeTriggers(...)`](#removetriggers)
- [`clearTriggers()`](#cleartriggers)
- [`setPaused(...)`](#setpaused)
- [`isPaused()`](#ispaused)
- [`addOutcome(...)`](#addoutcome)
- [`addUniqueOutcome(...)`](#adduniqueoutcome)
- [`addOutcomeWithValue(...)`](#addoutcomewithvalue)
- [`requestLocationPermission()`](#requestlocationpermission)
- [`setLocationShared(...)`](#setlocationshared)
- [`isLocationShared()`](#islocationshared)
- [`enterLiveActivity(...)`](#enterliveactivity)
- [`exitLiveActivity(...)`](#exitliveactivity)
- [`setPushToStartToken(...)`](#setpushtostarttoken)
- [`removePushToStartToken(...)`](#removepushtostarttoken)
- [`setupDefaultLiveActivity(...)`](#setupdefaultliveactivity)
- [`startDefaultLiveActivity(...)`](#startdefaultliveactivity)
- [Type Aliases](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### initialize(...)

```typescript
initialize(options: { appId: string; }) => Promise<void>
```

Initialize the OneSignal SDK with your app ID. Call during app startup.

| Param         | Type                            |
| ------------- | ------------------------------- |
| **`options`** | <code>{ appId: string; }</code> |

---

### login(...)

```typescript
login(options: { externalId: string; }) => Promise<void>
```

Log in to OneSignal as the user identified by `externalId`, switching the user context.

| Param         | Type                                 |
| ------------- | ------------------------------------ |
| **`options`** | <code>{ externalId: string; }</code> |

---

### logout()

```typescript
logout() => Promise<void>
```

Log out the current user. The SDK will reference a new device-scoped user.

---

### setConsentRequired(...)

```typescript
setConsentRequired(options: { required: boolean; }) => Promise<void>
```

Set whether user privacy consent is required before sending data to OneSignal. Call before `initialize`.

| Param         | Type                                |
| ------------- | ----------------------------------- |
| **`options`** | <code>{ required: boolean; }</code> |

---

### setConsentGiven(...)

```typescript
setConsentGiven(options: { granted: boolean; }) => Promise<void>
```

Indicate whether the user has granted privacy consent.

| Param         | Type                               |
| ------------- | ---------------------------------- |
| **`options`** | <code>{ granted: boolean; }</code> |

---

### setLogLevel(...)

```typescript
setLogLevel(options: { logLevel: LogLevel; }) => Promise<void>
```

Set the log level printed to LogCat (Android) or Xcode console (iOS).

| Param         | Type                                                         |
| ------------- | ------------------------------------------------------------ |
| **`options`** | <code>{ logLevel: <a href="#loglevel">LogLevel</a>; }</code> |

---

### setAlertLevel(...)

```typescript
setAlertLevel(options: { logLevel: LogLevel; }) => Promise<void>
```

Set the log level shown to the user as alert dialogs.

| Param         | Type                                                         |
| ------------- | ------------------------------------------------------------ |
| **`options`** | <code>{ logLevel: <a href="#loglevel">LogLevel</a>; }</code> |

---

### setLanguage(...)

```typescript
setLanguage(options: { language: string; }) => Promise<void>
```

Explicitly set a 2-character language code for the current user.

| Param         | Type                               |
| ------------- | ---------------------------------- |
| **`options`** | <code>{ language: string; }</code> |

---

### addAliases(...)

```typescript
addAliases(options: { aliases: Record<string, string>; }) => Promise<void>
```

Add or overwrite aliases for the current user.

| Param         | Type                                                                          |
| ------------- | ----------------------------------------------------------------------------- |
| **`options`** | <code>{ aliases: <a href="#record">Record</a>&lt;string, string&gt;; }</code> |

---

### removeAliases(...)

```typescript
removeAliases(options: { labels: string[]; }) => Promise<void>
```

Remove aliases (by label) from the current user.

| Param         | Type                               |
| ------------- | ---------------------------------- |
| **`options`** | <code>{ labels: string[]; }</code> |

---

### addEmail(...)

```typescript
addEmail(options: { email: string; }) => Promise<void>
```

Add a new email subscription to the current user.

| Param         | Type                            |
| ------------- | ------------------------------- |
| **`options`** | <code>{ email: string; }</code> |

---

### removeEmail(...)

```typescript
removeEmail(options: { email: string; }) => Promise<void>
```

Remove an email subscription from the current user.

| Param         | Type                            |
| ------------- | ------------------------------- |
| **`options`** | <code>{ email: string; }</code> |

---

### addSms(...)

```typescript
addSms(options: { smsNumber: string; }) => Promise<void>
```

Add a new SMS subscription to the current user.

| Param         | Type                                |
| ------------- | ----------------------------------- |
| **`options`** | <code>{ smsNumber: string; }</code> |

---

### removeSms(...)

```typescript
removeSms(options: { smsNumber: string; }) => Promise<void>
```

Remove an SMS subscription from the current user.

| Param         | Type                                |
| ------------- | ----------------------------------- |
| **`options`** | <code>{ smsNumber: string; }</code> |

---

### addTags(...)

```typescript
addTags(options: { tags: Record<string, string>; }) => Promise<void>
```

Add or overwrite tags on the current user (used for targeting and personalization).

| Param         | Type                                                                       |
| ------------- | -------------------------------------------------------------------------- |
| **`options`** | <code>{ tags: <a href="#record">Record</a>&lt;string, string&gt;; }</code> |

---

### removeTags(...)

```typescript
removeTags(options: { keys: string[]; }) => Promise<void>
```

Remove tags by key from the current user.

| Param         | Type                             |
| ------------- | -------------------------------- |
| **`options`** | <code>{ keys: string[]; }</code> |

---

### getTags()

```typescript
getTags() => Promise<{ tags: Record<string, string>; }>
```

Get the local tags for the current user.

**Returns:** <code>Promise&lt;{ tags: <a href="#record">Record</a>&lt;string, string&gt;; }&gt;</code>

---

### getOnesignalId()

```typescript
getOnesignalId() => Promise<{ onesignalId: string | null; }>
```

Get the OneSignal-assigned ID for the current user, or null if not yet available.

**Returns:** <code>Promise&lt;{ onesignalId: string | null; }&gt;</code>

---

### getExternalId()

```typescript
getExternalId() => Promise<{ externalId: string | null; }>
```

Get the external ID set via `login`, or null if the user is anonymous.

**Returns:** <code>Promise&lt;{ externalId: string | null; }&gt;</code>

---

### trackEvent(...)

```typescript
trackEvent(options: { name: string; properties?: Record<string, unknown>; }) => Promise<void>
```

Track a custom event with an optional set of JSON-serializable properties.

| Param         | Type                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------ |
| **`options`** | <code>{ name: string; properties?: <a href="#record">Record</a>&lt;string, unknown&gt;; }</code> |

---

### getPushSubscriptionId()

```typescript
getPushSubscriptionId() => Promise<{ id: string | null; }>
```

Get the current device's push subscription ID, or null if not yet assigned.

**Returns:** <code>Promise&lt;{ id: string | null; }&gt;</code>

---

### getPushSubscriptionToken()

```typescript
getPushSubscriptionToken() => Promise<{ token: string | null; }>
```

Get the current device's push token, or null if not yet available.

**Returns:** <code>Promise&lt;{ token: string | null; }&gt;</code>

---

### getPushSubscriptionOptedIn()

```typescript
getPushSubscriptionOptedIn() => Promise<{ optedIn: boolean; }>
```

Whether the current user is opted in to push notifications.

**Returns:** <code>Promise&lt;{ optedIn: boolean; }&gt;</code>

---

### optInPushSubscription()

```typescript
optInPushSubscription() => Promise<void>
```

Opt in to push notifications. Prompts for permission if needed.

---

### optOutPushSubscription()

```typescript
optOutPushSubscription() => Promise<void>
```

Opt out of push notifications on this device.

---

### getPermission()

```typescript
getPermission() => Promise<{ permission: boolean; }>
```

Whether the app currently has notification permission (including provisional/ephemeral).

**Returns:** <code>Promise&lt;{ permission: boolean; }&gt;</code>

---

### permissionNative()

```typescript
permissionNative() => Promise<{ permission: OSNotificationPermission; }>
```

iOS only. The native notification permission status.

**Returns:** <code>Promise&lt;{ permission: <a href="#osnotificationpermission">OSNotificationPermission</a>; }&gt;</code>

---

### requestPermission(...)

```typescript
requestPermission(options: { fallbackToSettings: boolean; }) => Promise<{ permission: boolean; }>
```

Prompt the user for notification permission. Optionally fall back to system settings.

| Param         | Type                                          |
| ------------- | --------------------------------------------- |
| **`options`** | <code>{ fallbackToSettings: boolean; }</code> |

**Returns:** <code>Promise&lt;{ permission: boolean; }&gt;</code>

---

### canRequestPermission()

```typescript
canRequestPermission() => Promise<{ canRequest: boolean; }>
```

Whether requesting notification permission would still show a prompt.

**Returns:** <code>Promise&lt;{ canRequest: boolean; }&gt;</code>

---

### registerForProvisionalAuthorization()

```typescript
registerForProvisionalAuthorization() => Promise<{ accepted: boolean; }>
```

iOS only. Request provisional authorization for quiet notifications without prompting.

**Returns:** <code>Promise&lt;{ accepted: boolean; }&gt;</code>

---

### clearAllNotifications()

```typescript
clearAllNotifications() => Promise<void>
```

Remove all OneSignal notifications from the notification center.

---

### removeNotification(...)

```typescript
removeNotification(options: { id: number; }) => Promise<void>
```

Android only. Cancel a single notification by its Android notification ID.

| Param         | Type                         |
| ------------- | ---------------------------- |
| **`options`** | <code>{ id: number; }</code> |

---

### removeGroupedNotifications(...)

```typescript
removeGroupedNotifications(options: { id: string; }) => Promise<void>
```

Android only. Cancel a group of notifications by group key.

| Param         | Type                         |
| ------------- | ---------------------------- |
| **`options`** | <code>{ id: string; }</code> |

---

### preventDefault(...)

```typescript
preventDefault(options: { notificationId: string; discard: boolean; }) => Promise<void>
```

Internal. Cancel display of a notification while inside the foreground willDisplay handler.

| Param         | Type                                                       |
| ------------- | ---------------------------------------------------------- |
| **`options`** | <code>{ notificationId: string; discard: boolean; }</code> |

---

### proceedWithWillDisplay(...)

```typescript
proceedWithWillDisplay(options: { notificationId: string; }) => Promise<void>
```

Internal. Continue display flow for a notification handled in foreground willDisplay.

| Param         | Type                                     |
| ------------- | ---------------------------------------- |
| **`options`** | <code>{ notificationId: string; }</code> |

---

### displayNotification(...)

```typescript
displayNotification(options: { notificationId: string; }) => Promise<void>
```

Internal. Display a previously prevented notification.

| Param         | Type                                     |
| ------------- | ---------------------------------------- |
| **`options`** | <code>{ notificationId: string; }</code> |

---

### addTriggers(...)

```typescript
addTriggers(options: { triggers: Record<string, string>; }) => Promise<void>
```

Add or overwrite triggers for the current user. Triggers determine when an IAM is shown.

| Param         | Type                                                                           |
| ------------- | ------------------------------------------------------------------------------ |
| **`options`** | <code>{ triggers: <a href="#record">Record</a>&lt;string, string&gt;; }</code> |

---

### removeTriggers(...)

```typescript
removeTriggers(options: { keys: string[]; }) => Promise<void>
```

Remove triggers by key from the current user.

| Param         | Type                             |
| ------------- | -------------------------------- |
| **`options`** | <code>{ keys: string[]; }</code> |

---

### clearTriggers()

```typescript
clearTriggers() => Promise<void>
```

Clear all triggers from the current user.

---

### setPaused(...)

```typescript
setPaused(options: { pause: boolean; }) => Promise<void>
```

Pause or resume the display of in-app messages.

| Param         | Type                             |
| ------------- | -------------------------------- |
| **`options`** | <code>{ pause: boolean; }</code> |

---

### isPaused()

```typescript
isPaused() => Promise<{ paused: boolean; }>
```

Whether in-app messaging is currently paused.

**Returns:** <code>Promise&lt;{ paused: boolean; }&gt;</code>

---

### addOutcome(...)

```typescript
addOutcome(options: { name: string; }) => Promise<void>
```

<a href="#record">Record</a> an outcome with the given name against the current session.

| Param         | Type                           |
| ------------- | ------------------------------ |
| **`options`** | <code>{ name: string; }</code> |

---

### addUniqueOutcome(...)

```typescript
addUniqueOutcome(options: { name: string; }) => Promise<void>
```

<a href="#record">Record</a> a unique outcome with the given name against the current session.

| Param         | Type                           |
| ------------- | ------------------------------ |
| **`options`** | <code>{ name: string; }</code> |

---

### addOutcomeWithValue(...)

```typescript
addOutcomeWithValue(options: { name: string; value: number; }) => Promise<void>
```

<a href="#record">Record</a> an outcome with the given name and value against the current session.

| Param         | Type                                          |
| ------------- | --------------------------------------------- |
| **`options`** | <code>{ name: string; value: number; }</code> |

---

### requestLocationPermission()

```typescript
requestLocationPermission() => Promise<void>
```

Prompt the user for location permission to enable geotagging.

---

### setLocationShared(...)

```typescript
setLocationShared(options: { shared: boolean; }) => Promise<void>
```

Enable or disable sharing the device location with OneSignal.

| Param         | Type                              |
| ------------- | --------------------------------- |
| **`options`** | <code>{ shared: boolean; }</code> |

---

### isLocationShared()

```typescript
isLocationShared() => Promise<{ shared: boolean; }>
```

Whether the device location is currently shared with OneSignal.

**Returns:** <code>Promise&lt;{ shared: boolean; }&gt;</code>

---

### enterLiveActivity(...)

```typescript
enterLiveActivity(options: { activityId: string; token: string; }) => Promise<void>
```

iOS only. Associate a live activity ID with a push token so OneSignal can target it.

| Param         | Type                                                |
| ------------- | --------------------------------------------------- |
| **`options`** | <code>{ activityId: string; token: string; }</code> |

---

### exitLiveActivity(...)

```typescript
exitLiveActivity(options: { activityId: string; }) => Promise<void>
```

iOS only. Disassociate a live activity ID. Currently unsupported on the native side.

| Param         | Type                                 |
| ------------- | ------------------------------------ |
| **`options`** | <code>{ activityId: string; }</code> |

---

### setPushToStartToken(...)

```typescript
setPushToStartToken(options: { activityType: string; token: string; }) => Promise<void>
```

iOS only. Register a pushToStart token for the given live activity attributes type.

| Param         | Type                                                  |
| ------------- | ----------------------------------------------------- |
| **`options`** | <code>{ activityType: string; token: string; }</code> |

---

### removePushToStartToken(...)

```typescript
removePushToStartToken(options: { activityType: string; }) => Promise<void>
```

iOS only. Remove a previously registered pushToStart token for the given attributes type.

| Param         | Type                                   |
| ------------- | -------------------------------------- |
| **`options`** | <code>{ activityType: string; }</code> |

---

### setupDefaultLiveActivity(...)

```typescript
setupDefaultLiveActivity(options?: { enablePushToStart: boolean; enablePushToUpdate: boolean; } | undefined) => Promise<void>
```

iOS only. Set up the OneSignal default live activity, optionally enabling pushToStart/pushToUpdate.

| Param         | Type                                                                      |
| ------------- | ------------------------------------------------------------------------- |
| **`options`** | <code>{ enablePushToStart: boolean; enablePushToUpdate: boolean; }</code> |

---

### startDefaultLiveActivity(...)

```typescript
startDefaultLiveActivity(options: { activityId: string; attributes: Record<string, unknown>; content: Record<string, unknown>; }) => Promise<void>
```

iOS only. Start a live activity backed by the OneSignal default attributes type.

| Param         | Type                                                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`options`** | <code>{ activityId: string; attributes: <a href="#record">Record</a>&lt;string, unknown&gt;; content: <a href="#record">Record</a>&lt;string, unknown&gt;; }</code> |

---

### Type Aliases

#### LogLevel

<code>(typeof <a href="#loglevel">LogLevel</a>)[keyof typeof LogLevel]</code>

#### Record

Construct a type with a set of properties K of type T

<code>{
[P in K]: T;
}</code>

#### OSNotificationPermission

<code>(typeof <a href="#osnotificationpermission">OSNotificationPermission</a>)[keyof typeof OSNotificationPermission]</code>

</docgen-api>
