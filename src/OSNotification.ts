import type { OneSignalCapacitorPlugin } from './definitions';

export type ReceivedEvent = Omit<OSNotification, 'display' | 'rawPayload'> & {
  rawPayload: string | object;
};

let _pluginRef: OneSignalCapacitorPlugin | undefined;

export function _setOSNotificationPlugin(plugin: OneSignalCapacitorPlugin): void {
  _pluginRef = plugin;
}

export class OSNotification {
  body: string;
  sound?: string;
  title?: string;
  launchURL?: string;
  rawPayload: object;
  actionButtons?: object[];
  additionalData: object;
  notificationId: string;
  // android only
  groupKey?: string;
  groupMessage?: string;
  groupedNotifications?: object[];
  ledColor?: string;
  priority?: number;
  smallIcon?: string;
  largeIcon?: string;
  bigPicture?: string;
  collapseId?: string;
  fromProjectNumber?: string;
  smallIconAccentColor?: string;
  lockScreenVisibility?: string;
  androidNotificationId?: number;
  // ios only
  badge?: string;
  badgeIncrement?: string;
  category?: string;
  threadId?: string;
  subtitle?: string;
  templateId?: string;
  templateName?: string;
  attachments?: object;
  mutableContent?: boolean;
  contentAvailable?: string;
  relevanceScore?: number;
  interruptionLevel?: string;

  constructor(receivedEvent: ReceivedEvent) {
    this.notificationId = receivedEvent.notificationId;
    this.body = receivedEvent.body;
    this.title = receivedEvent.title;
    this.additionalData = receivedEvent.additionalData;

    if (typeof receivedEvent.rawPayload === 'string') {
      this.rawPayload = JSON.parse(receivedEvent.rawPayload);
    } else {
      this.rawPayload = receivedEvent.rawPayload;
    }

    this.launchURL = receivedEvent.launchURL;
    this.sound = receivedEvent.sound;

    if (receivedEvent.actionButtons) {
      this.actionButtons = receivedEvent.actionButtons;
    }

    // Android
    if (receivedEvent.groupKey) {
      this.groupKey = receivedEvent.groupKey;
    }
    if (receivedEvent.ledColor) {
      this.ledColor = receivedEvent.ledColor;
    }
    if (typeof receivedEvent.priority !== 'undefined') {
      this.priority = receivedEvent.priority;
    }
    if (receivedEvent.smallIcon) {
      this.smallIcon = receivedEvent.smallIcon;
    }
    if (receivedEvent.largeIcon) {
      this.largeIcon = receivedEvent.largeIcon;
    }
    if (receivedEvent.bigPicture) {
      this.bigPicture = receivedEvent.bigPicture;
    }
    if (receivedEvent.collapseId) {
      this.collapseId = receivedEvent.collapseId;
    }
    if (receivedEvent.groupMessage) {
      this.groupMessage = receivedEvent.groupMessage;
    }
    if (receivedEvent.fromProjectNumber) {
      this.fromProjectNumber = receivedEvent.fromProjectNumber;
    }
    if (receivedEvent.smallIconAccentColor) {
      this.smallIconAccentColor = receivedEvent.smallIconAccentColor;
    }
    if (receivedEvent.lockScreenVisibility) {
      this.lockScreenVisibility = receivedEvent.lockScreenVisibility;
    }
    if (receivedEvent.androidNotificationId) {
      this.androidNotificationId = receivedEvent.androidNotificationId;
    }
    if (receivedEvent.groupedNotifications && receivedEvent.groupedNotifications.length) {
      this.groupedNotifications = receivedEvent.groupedNotifications;
    }

    // iOS
    if (receivedEvent.badge) {
      this.badge = receivedEvent.badge;
    }
    if (receivedEvent.category) {
      this.category = receivedEvent.category;
    }
    if (receivedEvent.threadId) {
      this.threadId = receivedEvent.threadId;
    }
    if (receivedEvent.subtitle) {
      this.subtitle = receivedEvent.subtitle;
    }
    if (receivedEvent.templateId) {
      this.templateId = receivedEvent.templateId;
    }
    if (receivedEvent.attachments) {
      this.attachments = receivedEvent.attachments;
    }
    if (receivedEvent.templateName) {
      this.templateName = receivedEvent.templateName;
    }
    if (receivedEvent.mutableContent) {
      this.mutableContent = receivedEvent.mutableContent;
    }
    if (receivedEvent.badgeIncrement) {
      this.badgeIncrement = receivedEvent.badgeIncrement;
    }
    if (receivedEvent.contentAvailable) {
      this.contentAvailable = receivedEvent.contentAvailable;
    }
    if (receivedEvent.relevanceScore) {
      this.relevanceScore = receivedEvent.relevanceScore;
    }
    if (receivedEvent.interruptionLevel) {
      this.interruptionLevel = receivedEvent.interruptionLevel;
    }
  }

  /**
   * Display the notification.
   * @returns void
   */
  display(): void {
    if (_pluginRef) {
      void _pluginRef.displayNotification({
        notificationId: this.notificationId,
      });
    }
  }
}
