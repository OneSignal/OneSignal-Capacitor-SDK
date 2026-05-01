import type { Plugin } from '@capacitor/core';

import type { LogLevel } from './DebugNamespace';
import type { OSNotificationPermission } from './NotificationsNamespace';

export interface OneSignalCapacitorPlugin extends Plugin {
  // Core
  initialize(options: { appId: string }): Promise<void>;
  login(options: { externalId: string }): Promise<void>;
  logout(): Promise<void>;
  setConsentRequired(options: { required: boolean }): Promise<void>;
  setConsentGiven(options: { granted: boolean }): Promise<void>;

  // Debug
  setLogLevel(options: { logLevel: LogLevel }): Promise<void>;
  setAlertLevel(options: { logLevel: LogLevel }): Promise<void>;

  // User
  setLanguage(options: { language: string }): Promise<void>;
  addAliases(options: { aliases: Record<string, string> }): Promise<void>;
  removeAliases(options: { labels: string[] }): Promise<void>;
  addEmail(options: { email: string }): Promise<void>;
  removeEmail(options: { email: string }): Promise<void>;
  addSms(options: { smsNumber: string }): Promise<void>;
  removeSms(options: { smsNumber: string }): Promise<void>;
  addTags(options: { tags: Record<string, string> }): Promise<void>;
  removeTags(options: { keys: string[] }): Promise<void>;
  getTags(): Promise<{ tags: Record<string, string> }>;
  getOnesignalId(): Promise<{ onesignalId: string | null }>;
  getExternalId(): Promise<{ externalId: string | null }>;
  trackEvent(options: { name: string; properties?: Record<string, unknown> }): Promise<void>;

  // Push Subscription
  getPushSubscriptionId(): Promise<{ id: string | null }>;
  getPushSubscriptionToken(): Promise<{ token: string | null }>;
  getPushSubscriptionOptedIn(): Promise<{ optedIn: boolean }>;
  optInPushSubscription(): Promise<void>;
  optOutPushSubscription(): Promise<void>;

  // Notifications
  getPermission(): Promise<{ permission: boolean }>;
  permissionNative(): Promise<{ permission: OSNotificationPermission }>;
  requestPermission(options: { fallbackToSettings: boolean }): Promise<{ permission: boolean }>;
  canRequestPermission(): Promise<{ canRequest: boolean }>;
  registerForProvisionalAuthorization(): Promise<{ accepted: boolean }>;
  clearAllNotifications(): Promise<void>;
  removeNotification(options: { id: number }): Promise<void>;
  removeGroupedNotifications(options: { id: string }): Promise<void>;
  preventDefault(options: { notificationId: string; discard: boolean }): Promise<void>;
  proceedWithWillDisplay(options: { notificationId: string }): Promise<void>;
  displayNotification(options: { notificationId: string }): Promise<void>;

  // In-App Messages
  addTriggers(options: { triggers: Record<string, string> }): Promise<void>;
  removeTriggers(options: { keys: string[] }): Promise<void>;
  clearTriggers(): Promise<void>;
  setPaused(options: { pause: boolean }): Promise<void>;
  isPaused(): Promise<{ paused: boolean }>;

  // Session / Outcomes
  addOutcome(options: { name: string }): Promise<void>;
  addUniqueOutcome(options: { name: string }): Promise<void>;
  addOutcomeWithValue(options: { name: string; value: number }): Promise<void>;

  // Location
  requestLocationPermission(): Promise<void>;
  setLocationShared(options: { shared: boolean }): Promise<void>;
  isLocationShared(): Promise<{ shared: boolean }>;

  // Live Activities
  enterLiveActivity(options: { activityId: string; token: string }): Promise<void>;
  exitLiveActivity(options: { activityId: string }): Promise<void>;
  setPushToStartToken(options: { activityType: string; token: string }): Promise<void>;
  removePushToStartToken(options: { activityType: string }): Promise<void>;
  setupDefaultLiveActivity(options?: {
    enablePushToStart: boolean;
    enablePushToUpdate: boolean;
  }): Promise<void>;
  startDefaultLiveActivity(options: {
    activityId: string;
    attributes: Record<string, unknown>;
    content: Record<string, unknown>;
  }): Promise<void>;
}
