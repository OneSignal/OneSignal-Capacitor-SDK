import type { Plugin } from '@capacitor/core';

import type { LogLevel } from './DebugNamespace';
import type { OSNotificationPermission } from './NotificationsNamespace';

export interface OneSignalCapacitorPlugin extends Plugin {
  // Core

  /** Initialize the OneSignal SDK with your app ID. Call during app startup. */
  initialize(options: { appId: string }): Promise<void>;

  /** Log in to OneSignal as the user identified by `externalId`, switching the user context. */
  login(options: { externalId: string }): Promise<void>;

  /** Log out the current user. The SDK will reference a new device-scoped user. */
  logout(): Promise<void>;

  /** Set whether user privacy consent is required before sending data to OneSignal. Call before `initialize`. */
  setConsentRequired(options: { required: boolean }): Promise<void>;

  /** Indicate whether the user has granted privacy consent. */
  setConsentGiven(options: { granted: boolean }): Promise<void>;

  // Debug

  /** Set the log level printed to LogCat (Android) or Xcode console (iOS). */
  setLogLevel(options: { logLevel: LogLevel }): Promise<void>;

  /** Set the log level shown to the user as alert dialogs. */
  setAlertLevel(options: { logLevel: LogLevel }): Promise<void>;

  // User

  /** Explicitly set a 2-character language code for the current user. */
  setLanguage(options: { language: string }): Promise<void>;

  /** Add or overwrite aliases for the current user. */
  addAliases(options: { aliases: Record<string, string> }): Promise<void>;

  /** Remove aliases (by label) from the current user. */
  removeAliases(options: { labels: string[] }): Promise<void>;

  /** Add a new email subscription to the current user. */
  addEmail(options: { email: string }): Promise<void>;

  /** Remove an email subscription from the current user. */
  removeEmail(options: { email: string }): Promise<void>;

  /** Add a new SMS subscription to the current user. */
  addSms(options: { smsNumber: string }): Promise<void>;

  /** Remove an SMS subscription from the current user. */
  removeSms(options: { smsNumber: string }): Promise<void>;

  /** Add or overwrite tags on the current user (used for targeting and personalization). */
  addTags(options: { tags: Record<string, string> }): Promise<void>;

  /** Remove tags by key from the current user. */
  removeTags(options: { keys: string[] }): Promise<void>;

  /** Get the local tags for the current user. */
  getTags(): Promise<{ tags: Record<string, string> }>;

  /** Get the OneSignal-assigned ID for the current user, or null if not yet available. */
  getOnesignalId(): Promise<{ onesignalId: string | null }>;

  /** Get the external ID set via `login`, or null if the user is anonymous. */
  getExternalId(): Promise<{ externalId: string | null }>;

  /** Track a custom event with an optional set of JSON-serializable properties. */
  trackEvent(options: { name: string; properties?: Record<string, unknown> }): Promise<void>;

  // Push Subscription

  /** Get the current device's push subscription ID, or null if not yet assigned. */
  getPushSubscriptionId(): Promise<{ id: string | null }>;

  /** Get the current device's push token, or null if not yet available. */
  getPushSubscriptionToken(): Promise<{ token: string | null }>;

  /** Whether the current user is opted in to push notifications. */
  getPushSubscriptionOptedIn(): Promise<{ optedIn: boolean }>;

  /** Opt in to push notifications. Prompts for permission if needed. */
  optInPushSubscription(): Promise<void>;

  /** Opt out of push notifications on this device. */
  optOutPushSubscription(): Promise<void>;

  // Notifications

  /** Whether the app currently has notification permission (including provisional/ephemeral). */
  getPermission(): Promise<{ permission: boolean }>;

  /** iOS only. The native notification permission status. */
  permissionNative(): Promise<{ permission: OSNotificationPermission }>;

  /** Prompt the user for notification permission. Optionally fall back to system settings. */
  requestPermission(options: { fallbackToSettings: boolean }): Promise<{ permission: boolean }>;

  /** Whether requesting notification permission would still show a prompt. */
  canRequestPermission(): Promise<{ canRequest: boolean }>;

  /** iOS only. Request provisional authorization for quiet notifications without prompting. */
  registerForProvisionalAuthorization(): Promise<{ accepted: boolean }>;

  /** Remove all OneSignal notifications from the notification center. */
  clearAllNotifications(): Promise<void>;

  /** Android only. Cancel a single notification by its Android notification ID. */
  removeNotification(options: { id: number }): Promise<void>;

  /** Android only. Cancel a group of notifications by group key. */
  removeGroupedNotifications(options: { id: string }): Promise<void>;

  /** Internal. Cancel display of a notification while inside the foreground willDisplay handler. */
  preventDefault(options: { notificationId: string; discard: boolean }): Promise<void>;

  /** Internal. Continue display flow for a notification handled in foreground willDisplay. */
  proceedWithWillDisplay(options: { notificationId: string }): Promise<void>;

  /** Internal. Display a previously prevented notification. */
  displayNotification(options: { notificationId: string }): Promise<void>;

  // In-App Messages

  /** Add or overwrite triggers for the current user. Triggers determine when an IAM is shown. */
  addTriggers(options: { triggers: Record<string, string> }): Promise<void>;

  /** Remove triggers by key from the current user. */
  removeTriggers(options: { keys: string[] }): Promise<void>;

  /** Clear all triggers from the current user. */
  clearTriggers(): Promise<void>;

  /** Pause or resume the display of in-app messages. */
  setPaused(options: { pause: boolean }): Promise<void>;

  /** Whether in-app messaging is currently paused. */
  isPaused(): Promise<{ paused: boolean }>;

  // Session / Outcomes

  /** Record an outcome with the given name against the current session. */
  addOutcome(options: { name: string }): Promise<void>;

  /** Record a unique outcome with the given name against the current session. */
  addUniqueOutcome(options: { name: string }): Promise<void>;

  /** Record an outcome with the given name and value against the current session. */
  addOutcomeWithValue(options: { name: string; value: number }): Promise<void>;

  // Location

  /** Prompt the user for location permission to enable geotagging. */
  requestLocationPermission(): Promise<void>;

  /** Enable or disable sharing the device location with OneSignal. */
  setLocationShared(options: { shared: boolean }): Promise<void>;

  /** Whether the device location is currently shared with OneSignal. */
  isLocationShared(): Promise<{ shared: boolean }>;

  // Live Activities

  /** iOS only. Associate a live activity ID with a push token so OneSignal can target it. */
  enterLiveActivity(options: { activityId: string; token: string }): Promise<void>;

  /** iOS only. Disassociate a live activity ID. Currently unsupported on the native side. */
  exitLiveActivity(options: { activityId: string }): Promise<void>;

  /** iOS only. Register a pushToStart token for the given live activity attributes type. */
  setPushToStartToken(options: { activityType: string; token: string }): Promise<void>;

  /** iOS only. Remove a previously registered pushToStart token for the given attributes type. */
  removePushToStartToken(options: { activityType: string }): Promise<void>;

  /** iOS only. Set up the OneSignal default live activity, optionally enabling pushToStart/pushToUpdate. */
  setupDefaultLiveActivity(options?: {
    enablePushToStart: boolean;
    enablePushToUpdate: boolean;
  }): Promise<void>;

  /** iOS only. Start a live activity backed by the OneSignal default attributes type. */
  startDefaultLiveActivity(options: {
    activityId: string;
    attributes: Record<string, unknown>;
    content: Record<string, unknown>;
  }): Promise<void>;
}
