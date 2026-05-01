import type { OneSignalLocationAPI } from './api';
import type { OneSignalCapacitorPlugin } from './definitions';

export default class Location implements OneSignalLocationAPI {
  private _plugin: OneSignalCapacitorPlugin;

  constructor(plugin: OneSignalCapacitorPlugin) {
    this._plugin = plugin;
  }

  /**
   * Prompts the user for location permissions to allow geotagging from the OneSignal dashboard.
   * @returns Promise<void>
   */
  requestPermission(): Promise<void> {
    return this._plugin.requestLocationPermission();
  }

  /**
   * Disable or enable location collection (defaults to enabled if your app has location permission).
   * @param  {boolean} shared
   * @returns void
   */
  setShared(shared: boolean): void {
    void this._plugin.setLocationShared({ shared });
  }

  /**
   * Whether location is currently shared with OneSignal.
   * @returns {Promise<boolean>}
   */
  async isShared(): Promise<boolean> {
    const result = await this._plugin.isLocationShared();
    return result.shared;
  }
}
