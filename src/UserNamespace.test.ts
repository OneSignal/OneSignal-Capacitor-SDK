import { describe, test, expect, vi, beforeEach } from 'vitest';

import { createMockPlugin } from '../mocks/capacitor';
import PushSubscription from './PushSubscriptionNamespace';
import User, { type UserChangedState } from './UserNamespace';

const USER_CHANGED_STATE: UserChangedState = {
  current: { onesignalId: 'test-onesignal-id', externalId: 'test-external-id' },
};

const LABEL = 'user_id';
const EMAIL = 'test@example.com';
const SMS_NUMBER = '+1234567890';
const ONESIGNAL_ID = 'test-onesignal-id';
const EXTERNAL_ID = 'test-external-id';

describe('User', () => {
  let mockPlugin: ReturnType<typeof createMockPlugin>;
  let user: User;

  beforeEach(() => {
    mockPlugin = createMockPlugin();
    user = new User(mockPlugin);
  });

  test('should instantiate User class', () => {
    expect(user).toBeInstanceOf(User);
  });

  test('should have pushSubscription property', () => {
    expect(user.pushSubscription).toBeInstanceOf(PushSubscription);
  });

  describe('setLanguage', () => {
    test('should call plugin with correct parameters', async () => {
      const language = 'en';
      await user.setLanguage(language);

      expect(mockPlugin.setLanguage).toHaveBeenCalledWith({ language });
    });
  });

  describe('addAlias', () => {
    test('should call plugin with correct parameters', async () => {
      const id = '12345';
      await user.addAlias(LABEL, id);

      expect(mockPlugin.addAliases).toHaveBeenCalledWith({
        aliases: { [LABEL]: id },
      });
    });
  });

  describe('addAliases', () => {
    test('should call plugin with correct parameters', async () => {
      const aliases = { [LABEL]: '12345', custom_id: 'abc-123' };
      await user.addAliases(aliases);

      expect(mockPlugin.addAliases).toHaveBeenCalledWith({ aliases });
    });

    test('should handle empty aliases object', async () => {
      const aliases = {};
      await user.addAliases(aliases);

      expect(mockPlugin.addAliases).toHaveBeenCalledWith({ aliases });
    });
  });

  describe('removeAlias', () => {
    test('should call plugin with correct parameters', async () => {
      await user.removeAlias(LABEL);

      expect(mockPlugin.removeAliases).toHaveBeenCalledWith({
        labels: [LABEL],
      });
    });
  });

  describe('removeAliases', () => {
    test('should call plugin with correct parameters', async () => {
      const labels = [LABEL, 'custom_id', 'external_id'];
      await user.removeAliases(labels);

      expect(mockPlugin.removeAliases).toHaveBeenCalledWith({ labels });
    });

    test('should handle empty array', async () => {
      const labels: string[] = [];
      await user.removeAliases(labels);

      expect(mockPlugin.removeAliases).toHaveBeenCalledWith({ labels });
    });
  });

  describe('addEmail', () => {
    test('should call plugin with correct parameters', async () => {
      await user.addEmail(EMAIL);

      expect(mockPlugin.addEmail).toHaveBeenCalledWith({ email: EMAIL });
    });
  });

  describe('removeEmail', () => {
    test('should call plugin with correct parameters', async () => {
      await user.removeEmail(EMAIL);

      expect(mockPlugin.removeEmail).toHaveBeenCalledWith({ email: EMAIL });
    });
  });

  describe('addSms', () => {
    test('should call plugin with correct parameters', async () => {
      await user.addSms(SMS_NUMBER);

      expect(mockPlugin.addSms).toHaveBeenCalledWith({
        smsNumber: SMS_NUMBER,
      });
    });
  });

  describe('removeSms', () => {
    test('should call plugin with correct parameters', async () => {
      await user.removeSms(SMS_NUMBER);

      expect(mockPlugin.removeSms).toHaveBeenCalledWith({
        smsNumber: SMS_NUMBER,
      });
    });
  });

  describe('addTag', () => {
    test('should call plugin with correct parameters', async () => {
      const key = 'level';
      const value = 'premium';
      await user.addTag(key, value);

      expect(mockPlugin.addTags).toHaveBeenCalledWith({
        tags: { [key]: value },
      });
    });
  });

  describe('addTags', () => {
    test('should call plugin with correct parameters', async () => {
      const tags = { level: 'premium', status: 'active' };
      await user.addTags(tags);

      expect(mockPlugin.addTags).toHaveBeenCalledWith({ tags });
    });

    test('should convert non-string values to JSON strings', async () => {
      const tags = { count: 42, active: true, data: { nested: 'value' } };
      await user.addTags(tags);

      expect(mockPlugin.addTags).toHaveBeenCalledWith({
        tags: { count: '42', active: 'true', data: '{"nested":"value"}' },
      });
    });
  });

  describe('removeTag', () => {
    test('should call plugin with correct parameters', async () => {
      const key = 'level';
      await user.removeTag(key);

      expect(mockPlugin.removeTags).toHaveBeenCalledWith({ keys: [key] });
    });
  });

  describe('removeTags', () => {
    test('should call plugin with correct parameters', async () => {
      const keys = ['level', 'status', 'premium'];
      await user.removeTags(keys);

      expect(mockPlugin.removeTags).toHaveBeenCalledWith({ keys });
    });

    test('should handle empty array', async () => {
      const keys: string[] = [];
      await user.removeTags(keys);

      expect(mockPlugin.removeTags).toHaveBeenCalledWith({ keys });
    });
  });

  describe('getTags', () => {
    test('should return a Promise', () => {
      const promise = user.getTags();
      expect(promise).toBeInstanceOf(Promise);
    });

    test('should resolve with tags object', async () => {
      const testTags = { level: 'premium', status: 'active', count: '5' };
      mockPlugin.getTags.mockResolvedValue({ tags: testTags });

      const result = await user.getTags();
      expect(result).toEqual(testTags);
    });

    test('should reject Promise when plugin fails', async () => {
      mockPlugin.getTags.mockRejectedValue(new Error('Failed to get tags'));

      await expect(user.getTags()).rejects.toThrow('Failed to get tags');
    });
  });

  describe('addEventListener', () => {
    test('should add listener and call addListener', () => {
      const mockListener = vi.fn();
      user.addEventListener('change', mockListener);

      expect(mockPlugin.addListener).toHaveBeenCalledWith('userStateChange', expect.any(Function));
    });

    test('should call all listeners when user state changes', () => {
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();
      const mockListener3 = vi.fn();

      user.addEventListener('change', mockListener1);
      user.addEventListener('change', mockListener2);
      user.addEventListener('change', mockListener3);

      const callback = mockPlugin.addListener.mock.calls[0][1];
      callback(USER_CHANGED_STATE);

      expect(mockListener1).toHaveBeenCalledWith(USER_CHANGED_STATE);
      expect(mockListener2).toHaveBeenCalledWith(USER_CHANGED_STATE);
      expect(mockListener3).toHaveBeenCalledWith(USER_CHANGED_STATE);
    });
  });

  describe('removeEventListener', () => {
    test('should remove listener from observer list', () => {
      const mockListener = vi.fn();

      user.addEventListener('change', mockListener);
      user.removeEventListener('change', mockListener);

      const callback = mockPlugin.addListener.mock.calls[0][1];
      callback(USER_CHANGED_STATE);
      expect(mockListener).not.toHaveBeenCalled();
    });

    test('should only remove the specified listener', () => {
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();

      user.addEventListener('change', mockListener1);
      user.addEventListener('change', mockListener2);
      user.removeEventListener('change', mockListener1);

      const callback = mockPlugin.addListener.mock.calls[0][1];
      callback(USER_CHANGED_STATE);
      expect(mockListener1).not.toHaveBeenCalled();
      expect(mockListener2).toHaveBeenCalledWith(USER_CHANGED_STATE);
    });
  });

  describe('getOnesignalId', () => {
    test('should return a Promise', () => {
      const promise = user.getOnesignalId();
      expect(promise).toBeInstanceOf(Promise);
    });

    test('should resolve with onesignal id', async () => {
      mockPlugin.getOnesignalId.mockResolvedValue({
        onesignalId: ONESIGNAL_ID,
      });

      const result = await user.getOnesignalId();
      expect(result).toBe(ONESIGNAL_ID);
    });

    test('should reject Promise when plugin fails', async () => {
      mockPlugin.getOnesignalId.mockRejectedValue(new Error('Failed to get onesignal id'));

      await expect(user.getOnesignalId()).rejects.toThrow('Failed to get onesignal id');
    });
  });

  describe('getExternalId', () => {
    test('should return a Promise', () => {
      const promise = user.getExternalId();
      expect(promise).toBeInstanceOf(Promise);
    });

    test('should resolve with external id', async () => {
      mockPlugin.getExternalId.mockResolvedValue({
        externalId: EXTERNAL_ID,
      });

      const result = await user.getExternalId();
      expect(result).toBe(EXTERNAL_ID);
    });

    test('should reject Promise when plugin fails', async () => {
      mockPlugin.getExternalId.mockRejectedValue(new Error('Failed to get external id'));

      await expect(user.getExternalId()).rejects.toThrow('Failed to get external id');
    });
  });

  describe('trackEvent', () => {
    test('should call plugin with only event name', async () => {
      const eventName = 'purchase';
      await user.trackEvent(eventName);

      expect(mockPlugin.trackEvent).toHaveBeenCalledWith({ name: eventName });
    });

    test('should call plugin with event name and properties', async () => {
      const eventName = 'purchase';
      const properties = { amount: 99.99, currency: 'USD' };
      await user.trackEvent(eventName, properties);

      expect(mockPlugin.trackEvent).toHaveBeenCalledWith({
        name: eventName,
        properties,
      });
    });

    test('should not call plugin when properties are not serializable', async () => {
      const eventName = 'purchase';
      const circularObj: Record<string, unknown> = { name: 'test' };
      circularObj.self = circularObj;
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await user.trackEvent(eventName, circularObj);

      expect(consoleSpy).toHaveBeenCalledWith('Properties must be a JSON-serializable object');
      expect(mockPlugin.trackEvent).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should not call plugin when properties is an array', async () => {
      const eventName = 'purchase';
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await user.trackEvent(eventName, ['item1', 'item2'] as unknown as object);

      expect(consoleSpy).toHaveBeenCalledWith('Properties must be a JSON-serializable object');
      expect(mockPlugin.trackEvent).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
