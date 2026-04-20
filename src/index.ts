import { registerPlugin } from '@capacitor/core';

import type { OneSignalCapacitorPlugin } from './definitions';
import { OneSignalPlugin } from './OneSignalPlugin';

const OneSignalCapacitor = registerPlugin<OneSignalCapacitorPlugin>('OneSignalCapacitor');

const OneSignal = new OneSignalPlugin(OneSignalCapacitor);

export { LogLevel } from './DebugNamespace';
export { NotificationWillDisplayEvent } from './NotificationReceivedEvent';
export { OSNotificationPermission } from './NotificationsNamespace';
export { OSNotification } from './OSNotification';
export { OneSignalPlugin } from './OneSignalPlugin';

export type {
  PushSubscriptionChangedState,
  PushSubscriptionState,
} from './PushSubscriptionNamespace';

export type { NotificationClickEvent, NotificationClickResult } from './types/NotificationClicked';

export type {
  InAppMessageActionUrlType,
  InAppMessageClickEvent,
  InAppMessageClickResult,
  InAppMessageDidDismissEvent,
  InAppMessageDidDisplayEvent,
  InAppMessageWillDismissEvent,
  InAppMessageWillDisplayEvent,
  OSInAppMessage,
} from './types/InAppMessage';

export type { UserChangedState, UserState } from './UserNamespace';

export type { OneSignalCapacitorPlugin } from './definitions';

export default OneSignal;
