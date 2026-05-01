import type { OneSignalNotificationsAPI } from './api';
import type { OneSignalCapacitorPlugin } from './definitions';
import { removeListener } from './helpers';
import { NotificationWillDisplayEvent } from './NotificationReceivedEvent';
import type { OSNotification } from './OSNotification';
import type {
  NotificationClickEvent,
  NotificationEventName,
  NotificationEventTypeMap,
} from './types/NotificationClicked';

export const OSNotificationPermission = {
  NotDetermined: 0,
  Denied: 1,
  Authorized: 2,
  Provisional: 3,
  Ephemeral: 4,
} as const;

export type OSNotificationPermission =
  (typeof OSNotificationPermission)[keyof typeof OSNotificationPermission];

export default class Notifications implements OneSignalNotificationsAPI {
  private _plugin: OneSignalCapacitorPlugin;
  private _permissionObserverList: ((event: boolean) => void)[] = [];
  private _notificationClickedListeners: ((event: NotificationClickEvent) => void)[] = [];
  private _notificationWillDisplayListeners: ((event: NotificationWillDisplayEvent) => void)[] = [];
  private _hasRegisteredClickListener = false;
  private _hasRegisteredForegroundWillDisplayListener = false;
  private _hasRegisteredPermissionListener = false;

  constructor(plugin: OneSignalCapacitorPlugin) {
    this._plugin = plugin;
  }

  private _processFunctionList<T>(array: ((event: T) => void)[], param: T): void {
    for (let i = 0; i < array.length; i++) {
      array[i](param);
    }
  }

  /**
   * Whether this app has push notification permission. Returns true if the user has accepted permissions,
   * or if the app has ephemeral or provisional permission.
   */
  async hasPermission(): Promise<boolean> {
    const result = await this._plugin.getPermission();
    return result.permission;
  }

  /**
   * iOS Only.
   * Returns the native permission of the device.
   * @returns {Promise<OSNotificationPermission>}
   */
  async permissionNative(): Promise<OSNotificationPermission> {
    const result = await this._plugin.permissionNative();
    return result.permission;
  }

  /**
   * Prompt the user for permission to receive push notifications.
   * Use the fallbackToSettings parameter to prompt to open the settings app if a user has already declined push permissions.
   * @param  {boolean} fallbackToSettings
   * @returns {Promise<boolean>}
   */
  async requestPermission(fallbackToSettings?: boolean): Promise<boolean> {
    const fallback = fallbackToSettings ?? false;
    const result = await this._plugin.requestPermission({
      fallbackToSettings: fallback,
    });
    return result.permission;
  }

  /**
   * Whether attempting to request notification permission will show a prompt.
   * Returns true if the device has not been prompted for push notification permission already.
   * @returns {Promise<boolean>}
   */
  async canRequestPermission(): Promise<boolean> {
    const result = await this._plugin.canRequestPermission();
    return result.canRequest;
  }

  /**
   * iOS Only.
   * Instead of having to prompt the user for permission to send them push notifications,
   * your app can request provisional authorization.
   * @param  {(response: boolean)=>void} handler
   * @returns void
   */
  registerForProvisionalAuthorization(handler?: (response: boolean) => void): void {
    void this._plugin.registerForProvisionalAuthorization().then((result) => {
      handler?.(result.accepted);
    });
  }

  /**
   * Add listeners for notification events.
   * @param event
   * @param listener
   * @returns
   */
  addEventListener<K extends NotificationEventName>(
    event: K,
    listener: (event: NotificationEventTypeMap[K]) => void,
  ): void {
    if (event === 'click') {
      this._notificationClickedListeners.push(listener as (event: NotificationClickEvent) => void);
      if (!this._hasRegisteredClickListener) {
        this._hasRegisteredClickListener = true;
        void this._plugin.addListener('notificationClick', (json: NotificationClickEvent) => {
          this._processFunctionList(this._notificationClickedListeners, json);
        });
      }
    } else if (event === 'foregroundWillDisplay') {
      this._notificationWillDisplayListeners.push(
        listener as (event: NotificationWillDisplayEvent) => void,
      );
      if (!this._hasRegisteredForegroundWillDisplayListener) {
        this._hasRegisteredForegroundWillDisplayListener = true;
        void this._plugin.addListener(
          'notificationForegroundWillDisplay',
          (notification: OSNotification) => {
            this._notificationWillDisplayListeners.forEach((listener) => {
              listener(new NotificationWillDisplayEvent(notification));
            });
            void this._plugin.proceedWithWillDisplay({
              notificationId: notification.notificationId,
            });
          },
        );
      }
    } else if (event === 'permissionChange') {
      this._permissionObserverList.push(listener as (event: boolean) => void);
      if (!this._hasRegisteredPermissionListener) {
        this._hasRegisteredPermissionListener = true;
        void this._plugin.addListener('permissionChange', (state: { permission: boolean }) => {
          this._processFunctionList(this._permissionObserverList, state.permission);
        });
      }
    }
  }

  /**
   * Remove listeners for notification events.
   * @param event
   * @param listener
   * @returns
   */
  removeEventListener<K extends NotificationEventName>(
    event: K,
    listener: (obj: NotificationEventTypeMap[K]) => void,
  ): void {
    if (event === 'click') {
      removeListener(
        this._notificationClickedListeners,
        listener as (event: NotificationClickEvent) => void,
      );
    } else if (event === 'foregroundWillDisplay') {
      removeListener(
        this._notificationWillDisplayListeners,
        listener as (event: NotificationWillDisplayEvent) => void,
      );
    } else if (event === 'permissionChange') {
      removeListener(this._permissionObserverList, listener as (event: boolean) => void);
    }
  }

  /**
   * Removes all OneSignal notifications.
   * @returns Promise<void>
   */
  clearAll(): Promise<void> {
    return this._plugin.clearAllNotifications();
  }

  /**
   * Android only.
   * Cancels a single OneSignal notification based on its Android notification integer ID.
   * @param  {number} id - notification id to cancel
   * @returns Promise<void>
   */
  removeNotification(id: number): Promise<void> {
    return this._plugin.removeNotification({ id });
  }

  /**
   * Android only.
   * Cancels a group of OneSignal notifications with the provided group key.
   * @param  {string} id - notification group id to cancel
   * @returns Promise<void>
   */
  removeGroupedNotifications(id: string): Promise<void> {
    return this._plugin.removeGroupedNotifications({ id });
  }
}
