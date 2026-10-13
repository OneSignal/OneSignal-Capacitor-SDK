import { Capacitor } from '@capacitor/core';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vite-plus/test';

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

  test('should not initialize with an empty appId', async () => {
    await plugin.initialize('');

    expect(mockPlugin.initialize).not.toHaveBeenCalled();
  });

  test('should call plugin for login', async () => {
    const externalId = 'test-user-123';
    await plugin.login(externalId);

    expect(mockPlugin.login).toHaveBeenCalledWith({ externalId });
  });

  test('should not login with an empty externalId', async () => {
    await plugin.login('');

    expect(mockPlugin.login).not.toHaveBeenCalled();
  });

  test('should not login with a null externalId', async () => {
    await plugin.login(null as unknown as string);

    expect(mockPlugin.login).not.toHaveBeenCalled();
  });

  describe('loginWithProfile', () => {
    const SUCCESS = {
      success: true,
      data: { onesignalId: 'os-1', externalId: 'user-1' },
      error: null,
    };

    beforeEach(() => {
      vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('android');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('passes arguments to native and parses the result', async () => {
      mockPlugin.loginWithProfile.mockResolvedValue(SUCCESS);

      const result = await plugin.loginWithProfile(
        'user-1',
        { email: 'a@b.co', tags: { level: 3 as unknown as string } },
        'jwt',
      );

      expect(mockPlugin.loginWithProfile).toHaveBeenCalledWith({
        externalId: 'user-1',
        profile: { email: 'a@b.co', tags: { level: '3' } },
        jwtBearerToken: 'jwt',
      });
      expect(result).toEqual(SUCCESS);
    });

    test('omits an empty jwt', async () => {
      mockPlugin.loginWithProfile.mockResolvedValue(SUCCESS);

      await plugin.loginWithProfile('user-1', {}, '');

      expect(mockPlugin.loginWithProfile).toHaveBeenCalledWith({
        externalId: 'user-1',
        profile: {},
        jwtBearerToken: undefined,
      });
    });

    test('returns INVALID_ARGUMENT without calling native for an empty externalId', async () => {
      const result = await plugin.loginWithProfile('', {});

      expect(mockPlugin.loginWithProfile).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error?.[0]).toMatchObject({
        code: 'INVALID_ARGUMENT',
        source: 'CLIENT',
        message: 'loginWithProfile: externalId is required',
      });
    });

    test('returns an UNKNOWN failure when native rejects', async () => {
      mockPlugin.loginWithProfile.mockRejectedValue(new Error('bridge gone'));

      const result = await plugin.loginWithProfile('user-1', {});

      expect(result.error?.[0]).toMatchObject({ code: 'UNKNOWN', message: 'bridge gone' });
    });

    test('returns an UNKNOWN failure for a non-Error rejection', async () => {
      mockPlugin.loginWithProfile.mockRejectedValue('nope');

      const result = await plugin.loginWithProfile('user-1', {});

      expect(result.error?.[0]).toMatchObject({ code: 'UNKNOWN', message: 'nope' });
    });

    test('returns an UNKNOWN failure for a malformed native result', async () => {
      mockPlugin.loginWithProfile.mockResolvedValue({ success: 'yes' });

      const result = await plugin.loginWithProfile('user-1', {});

      expect(result.success).toBe(false);
      expect(result.error?.[0].code).toBe('UNKNOWN');
    });

    test('returns the Android-only failure envelope on iOS without calling native', async () => {
      vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('ios');

      const result = await plugin.loginWithProfile('user-1', { email: 'a@b.co' });

      expect(mockPlugin.loginWithProfile).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        data: null,
        error: [
          {
            code: 'UNKNOWN',
            source: 'CLIENT',
            backendCode: null,
            httpStatus: null,
            message: 'loginWithProfile is only supported on Android',
            meta: null,
          },
        ],
      });
    });
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
