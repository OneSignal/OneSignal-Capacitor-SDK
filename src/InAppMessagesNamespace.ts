import type { OneSignalInAppMessagesAPI } from './api';
import type { OneSignalCapacitorPlugin } from './definitions';
import { removeListener } from './helpers';
import type {
  InAppMessageClickEvent,
  InAppMessageDidDismissEvent,
  InAppMessageDidDisplayEvent,
  InAppMessageEventName,
  InAppMessageEventTypeMap,
  InAppMessageWillDismissEvent,
  InAppMessageWillDisplayEvent,
} from './types/InAppMessage';

export default class InAppMessages implements OneSignalInAppMessagesAPI {
  private _plugin: OneSignalCapacitorPlugin;
  private _inAppMessageClickListeners: ((action: InAppMessageClickEvent) => void)[] = [];
  private _willDisplayInAppMessageListeners: ((event: InAppMessageWillDisplayEvent) => void)[] = [];
  private _didDisplayInAppMessageListeners: ((event: InAppMessageDidDisplayEvent) => void)[] = [];
  private _willDismissInAppMessageListeners: ((event: InAppMessageWillDismissEvent) => void)[] = [];
  private _didDismissInAppMessageListeners: ((event: InAppMessageDidDismissEvent) => void)[] = [];

  constructor(plugin: OneSignalCapacitorPlugin) {
    this._plugin = plugin;
  }

  private _processFunctionList<T>(array: ((event: T) => void)[], param: T): void {
    for (let i = 0; i < array.length; i++) {
      array[i](param);
    }
  }

  /**
   * Add event listeners for In-App Message click and/or lifecycle events.
   * @param event
   * @param listener
   * @returns
   */
  addEventListener<K extends InAppMessageEventName>(
    event: K,
    listener: (event: InAppMessageEventTypeMap[K]) => void,
  ): void {
    if (event === 'click') {
      this._inAppMessageClickListeners.push(listener as (event: InAppMessageClickEvent) => void);
      void this._plugin.addListener('inAppMessageClick', (json: InAppMessageClickEvent) => {
        this._processFunctionList(this._inAppMessageClickListeners, json);
      });
    } else if (event === 'willDisplay') {
      this._willDisplayInAppMessageListeners.push(
        listener as (event: InAppMessageWillDisplayEvent) => void,
      );
      void this._plugin.addListener(
        'inAppMessageWillDisplay',
        (event: InAppMessageWillDisplayEvent) => {
          this._processFunctionList(this._willDisplayInAppMessageListeners, event);
        },
      );
    } else if (event === 'didDisplay') {
      this._didDisplayInAppMessageListeners.push(
        listener as (event: InAppMessageDidDisplayEvent) => void,
      );
      void this._plugin.addListener(
        'inAppMessageDidDisplay',
        (event: InAppMessageDidDisplayEvent) => {
          this._processFunctionList(this._didDisplayInAppMessageListeners, event);
        },
      );
    } else if (event === 'willDismiss') {
      this._willDismissInAppMessageListeners.push(
        listener as (event: InAppMessageWillDismissEvent) => void,
      );
      void this._plugin.addListener(
        'inAppMessageWillDismiss',
        (event: InAppMessageWillDismissEvent) => {
          this._processFunctionList(this._willDismissInAppMessageListeners, event);
        },
      );
    } else if (event === 'didDismiss') {
      this._didDismissInAppMessageListeners.push(
        listener as (event: InAppMessageDidDismissEvent) => void,
      );
      void this._plugin.addListener(
        'inAppMessageDidDismiss',
        (event: InAppMessageDidDismissEvent) => {
          this._processFunctionList(this._didDismissInAppMessageListeners, event);
        },
      );
    }
  }

  /**
   * Remove event listeners for In-App Message click and/or lifecycle events.
   * @param event
   * @param listener
   * @returns
   */
  removeEventListener<K extends InAppMessageEventName>(
    event: K,
    listener: (obj: InAppMessageEventTypeMap[K]) => void,
  ): void {
    if (event === 'click') {
      removeListener(this._inAppMessageClickListeners, listener);
    } else if (event === 'willDisplay') {
      removeListener(this._willDisplayInAppMessageListeners, listener);
    } else if (event === 'didDisplay') {
      removeListener(this._didDisplayInAppMessageListeners, listener);
    } else if (event === 'willDismiss') {
      removeListener(this._willDismissInAppMessageListeners, listener);
    } else if (event === 'didDismiss') {
      removeListener(this._didDismissInAppMessageListeners, listener);
    }
  }

  /**
   * Add a trigger for the current user. Triggers are currently explicitly used to determine whether a specific IAM should be displayed to the user.
   * @param  {string} key
   * @param  {string} value
   * @returns Promise<void>
   */
  addTrigger(key: string, value: string): Promise<void> {
    return this.addTriggers({ [key]: value });
  }

  /**
   * Add multiple triggers for the current user.
   * @param  {[key: string]: string} triggers
   * @returns Promise<void>
   */
  addTriggers(triggers: { [key: string]: string }): Promise<void> {
    Object.keys(triggers).forEach(function (key) {
      if (typeof triggers[key] !== 'string') {
        triggers[key] = JSON.stringify(triggers[key]);
      }
    });

    return this._plugin.addTriggers({ triggers });
  }

  /**
   * Remove the trigger with the provided key from the current user.
   * @param  {string} key
   * @returns Promise<void>
   */
  removeTrigger(key: string): Promise<void> {
    return this.removeTriggers([key]);
  }

  /**
   * Remove multiple triggers from the current user.
   * @param  {string[]} keys
   * @returns Promise<void>
   */
  removeTriggers(keys: string[]): Promise<void> {
    if (!Array.isArray(keys)) {
      console.error('OneSignal: removeTriggers: argument must be of type Array');
    }

    return this._plugin.removeTriggers({ keys });
  }

  /**
   * Clear all triggers from the current user.
   * @returns Promise<void>
   */
  clearTriggers(): Promise<void> {
    return this._plugin.clearTriggers();
  }

  /**
   * Set whether in-app messaging is currently paused.
   * @param  {boolean} pause
   * @returns void
   */
  setPaused(pause: boolean): void {
    void this._plugin.setPaused({ pause });
  }

  /**
   * Whether in-app messaging is currently paused.
   * @returns {Promise<boolean>}
   */
  async getPaused(): Promise<boolean> {
    const result = await this._plugin.isPaused();
    return result.paused;
  }
}
