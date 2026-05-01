import type { LogLevel } from './DebugNamespace';
import type { OSNotificationPermission } from './NotificationsNamespace';
import type { PushSubscriptionChangedState } from './PushSubscriptionNamespace';
import type { InAppMessageEventName, InAppMessageEventTypeMap } from './types/InAppMessage';
import type { LiveActivitySetupOptions } from './types/LiveActivities';
import type { NotificationEventName, NotificationEventTypeMap } from './types/NotificationClicked';
import type { UserChangedState } from './UserNamespace';

/**
 * Debug helpers exposed via `OneSignal.Debug`.
 */
export interface OneSignalDebugAPI {
  /** Set the log level printed to LogCat (Android) or the Xcode console (iOS). */
  setLogLevel(logLevel: LogLevel): void;

  /** Set the log level shown to the user as alert dialogs. */
  setAlertLevel(visualLogLevel: LogLevel): void;
}

/**
 * Push subscription state and controls exposed via `OneSignal.User.pushSubscription`.
 */
export interface OneSignalPushSubscriptionAPI {
  /** Get the current device's push subscription ID, or null if not yet assigned. */
  getIdAsync(): Promise<string | null>;

  /** Get the current device's push token, or null if not yet available. */
  getTokenAsync(): Promise<string | null>;

  /**
   * Whether the current user is opted in to push notifications. Returns true when the app has
   * notification permission and `optOut()` has not been called. Does not guarantee a token has
   * been received.
   */
  getOptedInAsync(): Promise<boolean>;

  /** Add a listener for push subscription state changes. */
  addEventListener(event: 'change', listener: (event: PushSubscriptionChangedState) => void): void;

  /** Remove a previously added push subscription state listener. */
  removeEventListener(
    event: 'change',
    listener: (event: PushSubscriptionChangedState) => void,
  ): void;

  /** Opt the user in to push notifications. Prompts for permission if needed. */
  optIn(): Promise<void>;

  /** Opt the user out of push notifications on this device. */
  optOut(): Promise<void>;
}

/**
 * Current-user operations exposed via `OneSignal.User`.
 */
export interface OneSignalUserAPI {
  /** Push subscription controls for the current user. */
  pushSubscription: OneSignalPushSubscriptionAPI;

  /** Explicitly set a 2-character language code for the current user. */
  setLanguage(language: string): Promise<void>;

  /** Add or overwrite a single alias on the current user. */
  addAlias(label: string, id: string): Promise<void>;

  /** Add or overwrite multiple aliases on the current user. */
  addAliases(aliases: Record<string, string>): Promise<void>;

  /** Remove a single alias by label from the current user. */
  removeAlias(label: string): Promise<void>;

  /** Remove multiple aliases by label from the current user. */
  removeAliases(labels: string[]): Promise<void>;

  /** Add a new email subscription to the current user. */
  addEmail(email: string): Promise<void>;

  /** Remove an email subscription from the current user. */
  removeEmail(email: string): Promise<void>;

  /** Add a new SMS subscription to the current user. */
  addSms(smsNumber: string): Promise<void>;

  /** Remove an SMS subscription from the current user. */
  removeSms(smsNumber: string): Promise<void>;

  /** Add a single tag (key/value) on the current user, used for targeting and personalization. */
  addTag(key: string, value: string): Promise<void>;

  /** Add or overwrite multiple tags on the current user. */
  addTags(tags: object): Promise<void>;

  /** Remove a single tag by key from the current user. */
  removeTag(key: string): Promise<void>;

  /** Remove multiple tags by key from the current user. */
  removeTags(keys: string[]): Promise<void>;

  /** Get the local tags for the current user. */
  getTags(): Promise<{ [key: string]: string }>;

  /** Add a listener for OneSignal user state changes. */
  addEventListener(event: 'change', listener: (event: UserChangedState) => void): void;

  /** Remove a previously added user state listener. */
  removeEventListener(event: 'change', listener: (event: UserChangedState) => void): void;

  /** Get the OneSignal-assigned ID for the current user, or null if not yet available. */
  getOnesignalId(): Promise<string | null>;

  /** Get the external ID set via `login`, or null if the user is anonymous. */
  getExternalId(): Promise<string | null>;

  /** Track a custom event with an optional set of JSON-serializable properties. */
  trackEvent(name: string, properties?: object): Promise<void>;
}

/**
 * Notification permission and event handling exposed via `OneSignal.Notifications`.
 */
export interface OneSignalNotificationsAPI {
  /** Whether the app currently has notification permission (including provisional/ephemeral). */
  hasPermission(): Promise<boolean>;

  /** iOS only. The native notification permission status. */
  permissionNative(): Promise<OSNotificationPermission>;

  /** Prompt the user for notification permission. Optionally fall back to system settings. */
  requestPermission(fallbackToSettings?: boolean): Promise<boolean>;

  /** Whether requesting notification permission would still show a prompt. */
  canRequestPermission(): Promise<boolean>;

  /** iOS only. Request provisional authorization for quiet notifications without prompting. */
  registerForProvisionalAuthorization(handler?: (response: boolean) => void): void;

  /** Add a listener for `click`, `foregroundWillDisplay`, or `permissionChange` events. */
  addEventListener<K extends NotificationEventName>(
    event: K,
    listener: (event: NotificationEventTypeMap[K]) => void,
  ): void;

  /** Remove a previously added notification event listener. */
  removeEventListener<K extends NotificationEventName>(
    event: K,
    listener: (obj: NotificationEventTypeMap[K]) => void,
  ): void;

  /** Remove all OneSignal notifications from the notification center. */
  clearAll(): Promise<void>;

  /** Android only. Cancel a single notification by its Android notification ID. */
  removeNotification(id: number): Promise<void>;

  /** Android only. Cancel a group of notifications by group key. */
  removeGroupedNotifications(id: string): Promise<void>;
}

/**
 * In-app message triggers and event handling exposed via `OneSignal.InAppMessages`.
 */
export interface OneSignalInAppMessagesAPI {
  /** Add a listener for IAM `click`, `willDisplay`, `didDisplay`, `willDismiss`, or `didDismiss` events. */
  addEventListener<K extends InAppMessageEventName>(
    event: K,
    listener: (event: InAppMessageEventTypeMap[K]) => void,
  ): void;

  /** Remove a previously added IAM event listener. */
  removeEventListener<K extends InAppMessageEventName>(
    event: K,
    listener: (obj: InAppMessageEventTypeMap[K]) => void,
  ): void;

  /** Add a single trigger (key/value) used to determine which IAMs are displayed to the user. */
  addTrigger(key: string, value: string): Promise<void>;

  /** Add or overwrite multiple triggers for the current user. */
  addTriggers(triggers: { [key: string]: string }): Promise<void>;

  /** Remove a single trigger by key. */
  removeTrigger(key: string): Promise<void>;

  /** Remove multiple triggers by key. */
  removeTriggers(keys: string[]): Promise<void>;

  /** Clear all triggers from the current user. */
  clearTriggers(): Promise<void>;

  /** Pause or resume the display of in-app messages. */
  setPaused(pause: boolean): void;

  /** Whether in-app messaging is currently paused. */
  getPaused(): Promise<boolean>;
}

/**
 * Outcome reporting exposed via `OneSignal.Session`.
 */
export interface OneSignalSessionAPI {
  /** Record an outcome with the given name against the current session. */
  addOutcome(name: string): Promise<void>;

  /** Record a unique outcome with the given name against the current session. */
  addUniqueOutcome(name: string): Promise<void>;

  /** Record an outcome with the given name and value against the current session. */
  addOutcomeWithValue(name: string, value: number): Promise<void>;
}

/**
 * Location permission and sharing exposed via `OneSignal.Location`.
 */
export interface OneSignalLocationAPI {
  /** Prompt the user for location permission to enable geotagging. */
  requestPermission(): Promise<void>;

  /** Enable or disable sharing the device location with OneSignal. */
  setShared(shared: boolean): void;

  /** Whether the device location is currently shared with OneSignal. */
  isShared(): Promise<boolean>;
}

/**
 * Live activity controls exposed via `OneSignal.LiveActivities`. iOS only unless noted.
 */
export interface OneSignalLiveActivitiesAPI {
  /** Associate a live activity ID with a push token so OneSignal can target it. */
  enter(
    activityId: string,
    token: string,
    onSuccess?: (data: unknown) => void,
    onFailure?: (data: unknown) => void,
  ): void;

  /**
   * Disassociate a live activity ID.
   * @deprecated Currently unsupported on the native side.
   */
  exit(
    activityId: string,
    onSuccess?: (data: unknown) => void,
    onFailure?: (data: unknown) => void,
  ): void;

  /** Register a `pushToStart` token for the given live activity attributes type. */
  setPushToStartToken(activityType: string, token: string): Promise<void>;

  /** Remove a previously registered `pushToStart` token for the given attributes type. */
  removePushToStartToken(activityType: string): Promise<void>;

  /** Set up the OneSignal default live activity, optionally enabling pushToStart/pushToUpdate. */
  setupDefault(options?: LiveActivitySetupOptions): Promise<void>;

  /** Start a live activity backed by the OneSignal default attributes type. */
  startDefault(
    activityId: string,
    attributes: Record<string, unknown>,
    content: Record<string, unknown>,
  ): Promise<void>;
}

/**
 * The public OneSignal Capacitor plugin API. This is the shape of the default `OneSignal` export.
 */
export interface OneSignalAPI {
  /** Debug helpers. */
  Debug: OneSignalDebugAPI;

  /** Current-user operations (aliases, tags, email/SMS, push subscription). */
  User: OneSignalUserAPI;

  /** Notification permission and click/foreground event handling. */
  Notifications: OneSignalNotificationsAPI;

  /** In-app message triggers and lifecycle events. */
  InAppMessages: OneSignalInAppMessagesAPI;

  /** Outcome reporting against the current session. */
  Session: OneSignalSessionAPI;

  /** Location permission and sharing. */
  Location: OneSignalLocationAPI;

  /** iOS live activity controls. */
  LiveActivities: OneSignalLiveActivitiesAPI;

  /** Initialize the SDK with your OneSignal app ID. Call during app startup. */
  initialize(appId: string): Promise<void>;

  /** Log in to OneSignal as the user identified by `externalId`, switching the user context. */
  login(externalId: string): Promise<void>;

  /** Log out the current user. The SDK will reference a new device-scoped user. */
  logout(): Promise<void>;

  /** Set whether user privacy consent is required before sending data to OneSignal. Call before `initialize`. */
  setConsentRequired(required: boolean): void;

  /** Indicate whether the user has granted privacy consent. */
  setConsentGiven(granted: boolean): void;
}
