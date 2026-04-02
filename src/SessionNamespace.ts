import type { OneSignalCapacitorPlugin } from './definitions';

export default class Session {
  private _plugin: OneSignalCapacitorPlugin;

  constructor(plugin: OneSignalCapacitorPlugin) {
    this._plugin = plugin;
  }

  /**
   * Add an outcome with the provided name, captured against the current session.
   * @param  {string} name
   * @returns void
   */
  addOutcome(name: string): void {
    void this._plugin.addOutcome({ name });
  }

  /**
   * Add a unique outcome with the provided name, captured against the current session.
   * @param  {string} name
   * @returns void
   */
  addUniqueOutcome(name: string): void {
    void this._plugin.addUniqueOutcome({ name });
  }

  /**
   * Add an outcome with the provided name and value, captured against the current session.
   * @param  {string} name
   * @param  {number} value
   * @returns void
   */
  addOutcomeWithValue(name: string, value: number): void {
    void this._plugin.addOutcomeWithValue({ name, value });
  }
}
