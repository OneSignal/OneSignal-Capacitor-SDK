import { describe, test, expect, beforeEach } from 'vitest';

import { createMockPlugin } from '../mocks/capacitor';
import { mockNotification } from '../mocks/data';
import {
  NotificationWillDisplayEvent,
  _setNotificationEventPlugin,
} from './NotificationReceivedEvent';
import { OSNotification } from './OSNotification';

describe('NotificationWillDisplayEvent', () => {
  let notificationData = mockNotification();
  let notificationEvent: NotificationWillDisplayEvent;

  beforeEach(() => {
    const mockPlugin = createMockPlugin();
    _setNotificationEventPlugin(mockPlugin);
    notificationEvent = new NotificationWillDisplayEvent(notificationData);
  });

  test('should instantiate NotificationWillDisplayEvent class', () => {
    expect(notificationEvent).toBeInstanceOf(NotificationWillDisplayEvent);
  });

  test('should create OSNotification instance in constructor', () => {
    const notification = notificationEvent.getNotification();

    expect(notification).toBeInstanceOf(OSNotification);
    expect(notification.notificationId).toBe(notificationData.notificationId);
    expect(notification.body).toBe(notificationData.body);
    expect(notification.title).toBe(notificationData.title);
  });

  describe('preventDefault', () => {
    test('should call plugin for preventDefault with default (false)', () => {
      const mockPlugin = createMockPlugin();
      _setNotificationEventPlugin(mockPlugin);
      const event = new NotificationWillDisplayEvent(notificationData);

      event.preventDefault();

      expect(mockPlugin.preventDefault).toHaveBeenCalledWith({
        notificationId: notificationData.notificationId,
        discard: false,
      });
    });

    test('should call plugin for preventDefault with discard true', () => {
      const mockPlugin = createMockPlugin();
      _setNotificationEventPlugin(mockPlugin);
      const event = new NotificationWillDisplayEvent(notificationData);

      event.preventDefault(true);

      expect(mockPlugin.preventDefault).toHaveBeenCalledWith({
        notificationId: notificationData.notificationId,
        discard: true,
      });
    });
  });

  describe('getNotification', () => {
    test('should return the OSNotification instance', () => {
      const notification1 = notificationEvent.getNotification();
      const notification2 = notificationEvent.getNotification();

      expect(notification1).toBeInstanceOf(OSNotification);
      expect(notification1.notificationId).toBe(notificationData.notificationId);

      expect(notification1).toBe(notification2);
    });
  });
});
