import type { OneSignalLiveActivitiesAPI } from './api';
import type { OneSignalCapacitorPlugin } from './definitions';
import type { LiveActivitySetupOptions } from './types/LiveActivities';

export default class LiveActivities implements OneSignalLiveActivitiesAPI {
  private _plugin: OneSignalCapacitorPlugin;

  constructor(plugin: OneSignalCapacitorPlugin) {
    this._plugin = plugin;
  }

  /**
   * Enter a live activity
   * @param  {string} activityId
   * @param  {string} token
   * @param  {Function} onSuccess
   * @param  {Function} onFailure
   * @returns void
   */
  enter(
    activityId: string,
    token: string,
    onSuccess?: (data: unknown) => void,
    onFailure?: (data: unknown) => void,
  ): void {
    this._plugin
      .enterLiveActivity({ activityId, token })
      .then((result) => {
        onSuccess?.(result);
      })
      .catch((error: unknown) => {
        onFailure?.(error);
      });
  }

  /**
   * Exit a live activity
   * @param  {string} activityId
   * @param  {Function} onSuccess
   * @param  {Function} onFailure
   * @returns void
   * @deprecated Currently unsupported, avoid using this method.
   */
  exit(
    activityId: string,
    onSuccess?: (data: unknown) => void,
    onFailure?: (data: unknown) => void,
  ): void {
    this._plugin
      .exitLiveActivity({ activityId })
      .then((result) => {
        onSuccess?.(result);
      })
      .catch((error: unknown) => {
        onFailure?.(error);
      });
  }

  /**
   * Indicate this device is capable of receiving pushToStart live activities for the
   * `activityType`. Only applies to iOS.
   * @param {string} activityType
   * @param {string} token
   */
  setPushToStartToken(activityType: string, token: string): Promise<void> {
    return this._plugin.setPushToStartToken({ activityType, token });
  }

  /**
   * Indicate this device is no longer capable of receiving pushToStart live activities
   * for the `activityType`. Only applies to iOS.
   * @param {string} activityType
   */
  removePushToStartToken(activityType: string): Promise<void> {
    return this._plugin.removePushToStartToken({ activityType });
  }

  /**
   * Enable the OneSignalSDK to setup the default `DefaultLiveActivityAttributes` structure.
   * Only applies to iOS.
   * @param {LiveActivitySetupOptions} options
   */
  setupDefault(options?: LiveActivitySetupOptions): Promise<void> {
    return this._plugin.setupDefaultLiveActivity(options);
  }

  /**
   * Start a new LiveActivity that is modelled by the default `DefaultLiveActivityAttributes`
   * structure. Only applies to iOS.
   * @param {string} activityId
   * @param {object} attributes
   * @param {object} content
   */
  startDefault(
    activityId: string,
    attributes: Record<string, unknown>,
    content: Record<string, unknown>,
  ): Promise<void> {
    return this._plugin.startDefaultLiveActivity({
      activityId,
      attributes,
      content,
    });
  }
}
