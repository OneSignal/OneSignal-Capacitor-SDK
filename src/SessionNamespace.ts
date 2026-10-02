import type { OneSignalSessionAPI } from './api';
import type { OneSignalCapacitorPlugin } from './definitions';
import { isMissing } from './helpers';

export default class Session implements OneSignalSessionAPI {
  private _plugin: OneSignalCapacitorPlugin;

  constructor(plugin: OneSignalCapacitorPlugin) {
    this._plugin = plugin;
  }

  /**
   * Add an outcome with the provided name, captured against the current session.
   * @param  {string} name
   * @returns Promise<void>
   */
  addOutcome(name: string): Promise<void> {
    if (isMissing(name, 'addOutcome: name')) return Promise.resolve();
    return this._plugin.addOutcome({ name });
  }

  /**
   * Add a unique outcome with the provided name, captured against the current session.
   * @param  {string} name
   * @returns Promise<void>
   */
  addUniqueOutcome(name: string): Promise<void> {
    if (isMissing(name, 'addUniqueOutcome: name')) return Promise.resolve();
    return this._plugin.addUniqueOutcome({ name });
  }

  /**
   * Add an outcome with the provided name and value, captured against the current session.
   * @param  {string} name
   * @param  {number} value
   * @returns Promise<void>
   */
  addOutcomeWithValue(name: string, value: number): Promise<void> {
    if (isMissing(name, 'addOutcomeWithValue: name')) return Promise.resolve();
    // The native bridge defaults a non-number value to 0; NaN and Infinity also arrive as null.
    if (!Number.isFinite(value)) {
      console.error('[OneSignal] addOutcomeWithValue: value must be a finite number');
      return Promise.resolve();
    }
    return this._plugin.addOutcomeWithValue({ name, value });
  }
}
