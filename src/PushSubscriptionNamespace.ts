import type { OneSignalPushSubscriptionAPI } from './api';
import type { OneSignalCapacitorPlugin } from './definitions';
import { removeListener } from './helpers';

export interface PushSubscriptionState {
  id?: string;
  token?: string;
  optedIn: boolean;
}

export interface PushSubscriptionChangedState {
  previous: PushSubscriptionState;
  current: PushSubscriptionState;
}

export default class PushSubscription implements OneSignalPushSubscriptionAPI {
  private _plugin: OneSignalCapacitorPlugin;

  private _subscriptionObserverList: ((event: PushSubscriptionChangedState) => void)[] = [];

  constructor(plugin: OneSignalCapacitorPlugin) {
    this._plugin = plugin;
  }

  private _processFunctionList(
    array: ((event: PushSubscriptionChangedState) => void)[],
    param: PushSubscriptionChangedState,
  ): void {
    for (let i = 0; i < array.length; i++) {
      array[i](param);
    }
  }

  /**
   * The readonly push subscription ID.
   * @returns {Promise<string | null>}
   */
  async getIdAsync(): Promise<string | null> {
    const result = await this._plugin.getPushSubscriptionId();
    return result.id;
  }

  /**
   * The readonly push token.
   * @returns {Promise<string | null>}
   */
  async getTokenAsync(): Promise<string | null> {
    const result = await this._plugin.getPushSubscriptionToken();
    return result.token;
  }

  /**
   * Gets a boolean value indicating whether the current user is opted in to push notifications.
   * This returns true when the app has notifications permission and optOut() is NOT called.
   * Note: Does not take into account the existence of the subscription ID and push token.
   * This boolean may return true but push notifications may still not be received by the user.
   * @returns {Promise<boolean>}
   */
  async getOptedInAsync(): Promise<boolean> {
    const result = await this._plugin.getPushSubscriptionOptedIn();
    return result.optedIn;
  }

  /**
   * Add a callback that fires when the OneSignal push subscription state changes.
   * @param  {(event: PushSubscriptionChangedState)=>void} listener
   * @returns void
   */
  addEventListener(_event: 'change', listener: (event: PushSubscriptionChangedState) => void) {
    this._subscriptionObserverList.push(listener);
    void this._plugin.addListener(
      'pushSubscriptionChange',
      (state: PushSubscriptionChangedState) => {
        this._processFunctionList(this._subscriptionObserverList, state);
      },
    );
  }

  /**
   * Remove a push subscription observer that has been previously added.
   * @param  {(event: PushSubscriptionChangedState)=>void} listener
   * @returns void
   */
  removeEventListener(_event: 'change', listener: (event: PushSubscriptionChangedState) => void) {
    removeListener(this._subscriptionObserverList, listener);
  }

  /**
   * Call this method to receive push notifications on the device or to resume receiving of push notifications after calling optOut. If needed, this method will prompt the user for push notifications permission.
   * @returns Promise<void>
   */
  optIn(): Promise<void> {
    return this._plugin.optInPushSubscription();
  }

  /**
   * If at any point you want the user to stop receiving push notifications on the current device (regardless of system-level permission status), you can call this method to opt out.
   * @returns Promise<void>
   */
  optOut(): Promise<void> {
    return this._plugin.optOutPushSubscription();
  }
}
