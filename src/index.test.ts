import { describe, test, expect, beforeEach } from 'vitest';

import { createMockPlugin } from '../mocks/capacitor';
import { APP_ID } from '../mocks/constants';
import { OneSignalPlugin } from './OneSignalPlugin';

describe('OneSignalPlugin', () => {
  let mockPlugin: ReturnType<typeof createMockPlugin>;
  let plugin: OneSignalPlugin;

  beforeEach(() => {
    mockPlugin = createMockPlugin();
    plugin = new OneSignalPlugin(mockPlugin);
  });

  test('should instantiate OneSignalPlugin', () => {
    expect(plugin).toBeInstanceOf(OneSignalPlugin);
  });

  test('should have all required namespaces', () => {
    expect(plugin.User).toBeDefined();
    expect(plugin.Debug).toBeDefined();
    expect(plugin.Session).toBeDefined();
    expect(plugin.Location).toBeDefined();
    expect(plugin.InAppMessages).toBeDefined();
    expect(plugin.Notifications).toBeDefined();
    expect(plugin.LiveActivities).toBeDefined();
  });

  test('should initialize with appId', async () => {
    await plugin.initialize(APP_ID);

    expect(mockPlugin.initialize).toHaveBeenCalledWith({ appId: APP_ID });
  });

  test('should call plugin for login', async () => {
    const externalId = 'test-user-123';
    await plugin.login(externalId);

    expect(mockPlugin.login).toHaveBeenCalledWith({ externalId });
  });

  test('should call plugin for logout', async () => {
    await plugin.logout();

    expect(mockPlugin.logout).toHaveBeenCalled();
  });

  test('should call plugin for setConsentRequired', () => {
    plugin.setConsentRequired(true);

    expect(mockPlugin.setConsentRequired).toHaveBeenCalledWith({
      required: true,
    });
  });

  test('should call plugin for setConsentGiven', () => {
    plugin.setConsentGiven(true);

    expect(mockPlugin.setConsentGiven).toHaveBeenCalledWith({ granted: true });
  });
});
