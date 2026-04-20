import type { NotificationWillDisplayEvent } from '../NotificationReceivedEvent';
import type { OSNotification } from '../OSNotification';

export type NotificationEventName = 'click' | 'foregroundWillDisplay' | 'permissionChange';

export type NotificationEventTypeMap = {
  click: NotificationClickEvent;
  foregroundWillDisplay: NotificationWillDisplayEvent;
  permissionChange: boolean;
};

export interface NotificationClickEvent {
  result: NotificationClickResult;
  notification: OSNotification;
}

export interface NotificationClickResult {
  actionId?: string;
  url?: string;
}
