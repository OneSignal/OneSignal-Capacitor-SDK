import { describe, test, expect, beforeEach, vi } from 'vite-plus/test';

import { createMockPlugin } from '../mocks/capacitor';
import Debug, { LogLevel } from './DebugNamespace';

describe('Debug', () => {
  let mockPlugin: ReturnType<typeof createMockPlugin>;
  let debug: Debug;

  beforeEach(() => {
    mockPlugin = createMockPlugin();
    debug = new Debug(mockPlugin);
  });

  test('should instantiate Debug class', () => {
    expect(debug).toBeInstanceOf(Debug);
  });

  test.each([
    [LogLevel.None, 0],
    [LogLevel.Fatal, 1],
    [LogLevel.Error, 2],
    [LogLevel.Warn, 3],
    [LogLevel.Info, 4],
    [LogLevel.Debug, 5],
    [LogLevel.Verbose, 6],
  ])('should call plugin for setLogLevel with %s', (logLevel, logLevelValue) => {
    debug.setLogLevel(logLevel);

    expect(mockPlugin.setLogLevel).toHaveBeenCalledWith({
      logLevel: logLevelValue,
    });
  });

  test.each([
    [LogLevel.None, 0],
    [LogLevel.Fatal, 1],
    [LogLevel.Error, 2],
    [LogLevel.Warn, 3],
    [LogLevel.Info, 4],
    [LogLevel.Debug, 5],
    [LogLevel.Verbose, 6],
  ])('should call plugin for setAlertLevel with %s', (logLevel, logLevelValue) => {
    debug.setAlertLevel(logLevel);

    expect(mockPlugin.setAlertLevel).toHaveBeenCalledWith({
      logLevel: logLevelValue,
    });
  });

  test.each([-1, 7, 99, 2.5, '2', null, undefined, NaN])(
    'should not call plugin for invalid log level %s',
    (level) => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      debug.setLogLevel(level as unknown as LogLevel);
      debug.setAlertLevel(level as unknown as LogLevel);

      expect(consoleSpy).toHaveBeenCalledWith(
        'OneSignal: setLogLevel: level must be a LogLevel value',
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'OneSignal: setAlertLevel: level must be a LogLevel value',
      );
      expect(mockPlugin.setLogLevel).not.toHaveBeenCalled();
      expect(mockPlugin.setAlertLevel).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    },
  );
});
