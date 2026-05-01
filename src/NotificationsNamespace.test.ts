import { describe, test, expect, vi, beforeEach } from 'vitest';

import { createMockPlugin } from '../mocks/capacitor';
import { mockNotification, mockNotificationClickEvent } from '../mocks/data';
import * as helpers from './helpers';
import { NotificationWillDisplayEvent } from './NotificationReceivedEvent';
import Notifications, { OSNotificationPermission } from './NotificationsNamespace';

describe('Notifications', () => {
  let mockPlugin: ReturnType<typeof createMockPlugin>;
  let notifications: Notifications;

  beforeEach(() => {
    mockPlugin = createMockPlugin();
    notifications = new Notifications(mockPlugin);
  });

  test('should instantiate Notifications class', () => {
    expect(notifications).toBeInstanceOf(Notifications);
  });

  describe('hasPermission', () => {
    test('should return a Promise', () => {
      mockPlugin.getPermission.mockResolvedValue({ permission: true });

      const promise = notifications.hasPermission();

      expect(promise).toBeInstanceOf(Promise);
      return promise;
    });

    test('should resolve with boolean value', async () => {
      mockPlugin.getPermission.mockResolvedValue({ permission: true });

      const result = await notifications.hasPermission();

      expect(result).toBe(true);
    });

    test('should reject Promise when plugin fails', async () => {
      const mockError = new Error('Permission check failed');
      mockPlugin.getPermission.mockRejectedValue(mockError);

      await expect(notifications.hasPermission()).rejects.toThrow(mockError.message);
    });
  });

  describe('permissionNative', () => {
    test('should return a Promise', () => {
      mockPlugin.permissionNative.mockResolvedValue({
        permission: OSNotificationPermission.Authorized,
      });

      const promise = notifications.permissionNative();

      expect(promise).toBeInstanceOf(Promise);
      return promise;
    });

    test('should resolve with OSNotificationPermission value', async () => {
      mockPlugin.permissionNative.mockResolvedValue({
        permission: OSNotificationPermission.Authorized,
      });

      const result = await notifications.permissionNative();

      expect(result).toBe(OSNotificationPermission.Authorized);
    });

    test('should reject Promise when plugin fails', async () => {
      const mockError = new Error('Permission check failed');
      mockPlugin.permissionNative.mockRejectedValue(mockError);

      await expect(notifications.permissionNative()).rejects.toThrow(mockError.message);
    });
  });

  describe('requestPermission', () => {
    test.each([[true], [false]])(
      'should call plugin for requestPermission with fallbackToSettings %s',
      async (fallback) => {
        mockPlugin.requestPermission.mockResolvedValue({ permission: true });

        await notifications.requestPermission(fallback);

        expect(mockPlugin.requestPermission).toHaveBeenCalledWith({
          fallbackToSettings: fallback,
        });
      },
    );

    test('should use default fallbackToSettings of false when not provided', async () => {
      mockPlugin.requestPermission.mockResolvedValue({ permission: true });

      await notifications.requestPermission();

      expect(mockPlugin.requestPermission).toHaveBeenCalledWith({
        fallbackToSettings: false,
      });
    });
  });

  describe('canRequestPermission', () => {
    test('should return a Promise', () => {
      mockPlugin.canRequestPermission.mockResolvedValue({ canRequest: true });

      const promise = notifications.canRequestPermission();

      expect(promise).toBeInstanceOf(Promise);
      return promise;
    });

    test('should resolve with boolean value', async () => {
      mockPlugin.canRequestPermission.mockResolvedValue({ canRequest: false });

      const result = await notifications.canRequestPermission();

      expect(result).toBe(false);
    });

    test('should reject Promise when plugin fails', async () => {
      const mockError = new Error('Permission check failed');
      mockPlugin.canRequestPermission.mockRejectedValue(mockError);

      await expect(notifications.canRequestPermission()).rejects.toThrow(mockError.message);
    });
  });

  describe('registerForProvisionalAuthorization', () => {
    test('should call plugin', () => {
      notifications.registerForProvisionalAuthorization();

      expect(mockPlugin.registerForProvisionalAuthorization).toHaveBeenCalled();
    });

    test('should call handler with result', async () => {
      mockPlugin.registerForProvisionalAuthorization.mockResolvedValue({
        accepted: true,
      });
      const handler = vi.fn();
      notifications.registerForProvisionalAuthorization(handler);

      await vi.waitFor(() => {
        expect(handler).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('addEventListener', () => {
    test('should call addListener for click event', () => {
      const mockListener = vi.fn();
      notifications.addEventListener('click', mockListener);

      expect(mockPlugin.addListener).toHaveBeenCalledWith(
        'notificationClick',
        expect.any(Function),
      );
    });

    test('should call all click listeners when event fires', () => {
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();
      notifications.addEventListener('click', mockListener1);
      notifications.addEventListener('click', mockListener2);

      const clickData = mockNotificationClickEvent();
      const callback = mockPlugin.addListener.mock.calls[0][1];
      callback(clickData);

      expect(mockListener1).toHaveBeenCalledWith(clickData);
      expect(mockListener2).toHaveBeenCalledWith(clickData);
    });

    test('should call addListener for foregroundWillDisplay event', () => {
      const mockListener = vi.fn();
      notifications.addEventListener('foregroundWillDisplay', mockListener);

      expect(mockPlugin.addListener).toHaveBeenCalledWith(
        'notificationForegroundWillDisplay',
        expect.any(Function),
      );
    });

    test('should call foregroundWillDisplay listeners and proceedWithWillDisplay', () => {
      const mockListener = vi.fn();
      notifications.addEventListener('foregroundWillDisplay', mockListener);

      const notificationData = mockNotification();
      const callback = mockPlugin.addListener.mock.calls[0][1];
      callback(notificationData);

      expect(mockListener).toHaveBeenCalledWith(expect.any(NotificationWillDisplayEvent));
      expect(mockPlugin.proceedWithWillDisplay).toHaveBeenCalledWith({
        notificationId: notificationData.notificationId,
      });
    });

    test('should call addListener for permissionChange event', () => {
      const mockListener = vi.fn();
      notifications.addEventListener('permissionChange', mockListener);

      expect(mockPlugin.addListener).toHaveBeenCalledWith('permissionChange', expect.any(Function));
    });

    test('should call all permissionChange listeners when event fires', () => {
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();
      notifications.addEventListener('permissionChange', mockListener1);
      notifications.addEventListener('permissionChange', mockListener2);

      const callback = mockPlugin.addListener.mock.calls[0][1];
      callback({ permission: true });

      expect(mockListener1).toHaveBeenCalledWith(true);
      expect(mockListener2).toHaveBeenCalledWith(true);
    });

    test('should not add listener for unknown event type', () => {
      const mockListener = vi.fn();
      // @ts-expect-error - testing unknown event type
      notifications.addEventListener('unknown', mockListener);

      expect(mockPlugin.addListener).not.toHaveBeenCalled();
    });

    test.each([['click'], ['foregroundWillDisplay'], ['permissionChange']] as const)(
      'should register the bridge %s listener only once across multiple subscriptions',
      (eventType) => {
        notifications.addEventListener(eventType, vi.fn());
        notifications.addEventListener(eventType, vi.fn());
        notifications.addEventListener(eventType, vi.fn());

        expect(mockPlugin.addListener).toHaveBeenCalledTimes(1);
      },
    );

    test('should call proceedWithWillDisplay only once per push regardless of subscriber count', () => {
      notifications.addEventListener('foregroundWillDisplay', vi.fn());
      notifications.addEventListener('foregroundWillDisplay', vi.fn());

      const callback = mockPlugin.addListener.mock.calls[0][1];
      callback(mockNotification());

      expect(mockPlugin.proceedWithWillDisplay).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeEventListener', () => {
    test.each([['click'], ['foregroundWillDisplay'], ['permissionChange']] as const)(
      'should remove %s event listener',
      (eventType) => {
        const mockListener = vi.fn();
        notifications.addEventListener(eventType, mockListener);
        notifications.removeEventListener(eventType, mockListener);

        const callback = mockPlugin.addListener.mock.calls[0][1];
        callback('some-data');
        expect(mockListener).not.toHaveBeenCalled();
      },
    );

    test('should not remove listener for unknown event type', () => {
      vi.spyOn(helpers, 'removeListener').mockImplementation(() => {});
      const mockListener = vi.fn();
      // @ts-expect-error - testing unknown event type
      notifications.removeEventListener('unknown', mockListener);

      expect(helpers.removeListener).not.toHaveBeenCalled();
    });
  });

  describe('clearAll', () => {
    test('should call plugin for clearAll', async () => {
      await notifications.clearAll();

      expect(mockPlugin.clearAllNotifications).toHaveBeenCalled();
    });
  });

  describe('removeNotification', () => {
    test('should call plugin for removeNotification', async () => {
      const notificationId = 123;
      await notifications.removeNotification(notificationId);

      expect(mockPlugin.removeNotification).toHaveBeenCalledWith({
        id: notificationId,
      });
    });
  });

  describe('removeGroupedNotifications', () => {
    test('should call plugin for removeGroupedNotifications', async () => {
      const groupId = 'test-group-id';
      await notifications.removeGroupedNotifications(groupId);

      expect(mockPlugin.removeGroupedNotifications).toHaveBeenCalledWith({
        id: groupId,
      });
    });
  });
});
