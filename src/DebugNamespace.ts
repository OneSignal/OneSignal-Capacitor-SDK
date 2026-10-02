import type { OneSignalDebugAPI } from './api';
import type { OneSignalCapacitorPlugin } from './definitions';

export const LogLevel = {
  None: 0,
  Fatal: 1,
  Error: 2,
  Warn: 3,
  Info: 4,
  Debug: 5,
  Verbose: 6,
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

// iOS force-unwraps the native enum, so an out-of-range level crashes the app.
function isValidLogLevel(level: unknown, api: string): boolean {
  if (Object.values(LogLevel).some((valid) => valid === level)) return true;
  console.error(`[OneSignal] ${api}: level must be a LogLevel value`);
  return false;
}

export default class Debug implements OneSignalDebugAPI {
  private _plugin: OneSignalCapacitorPlugin;

  constructor(plugin: OneSignalCapacitorPlugin) {
    this._plugin = plugin;
  }

  /**
   * Enable logging to help debug if you run into an issue setting up OneSignal.
   * @param  {LogLevel} logLevel - Sets the logging level to print to the Android LogCat log or Xcode log.
   * @returns void
   */
  setLogLevel(logLevel: LogLevel): void {
    if (!isValidLogLevel(logLevel, 'setLogLevel')) return;
    void this._plugin.setLogLevel({ logLevel });
  }

  /**
   * Enable logging to help debug if you run into an issue setting up OneSignal.
   * @param  {LogLevel} visualLogLevel - Sets the logging level to show as alert dialogs.
   * @returns void
   */
  setAlertLevel(visualLogLevel: LogLevel): void {
    if (!isValidLogLevel(visualLogLevel, 'setAlertLevel')) return;
    void this._plugin.setAlertLevel({ logLevel: visualLogLevel });
  }
}
