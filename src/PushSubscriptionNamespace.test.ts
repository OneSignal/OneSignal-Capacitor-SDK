import { describe, test, expect, vi, beforeEach } from 'vitest';

import { createMockPlugin } from '../mocks/capacitor';
import { PREV_SUB_ID, PREV_SUB_TOKEN, SUB_ID, SUB_TOKEN } from '../mocks/constants';
import PushSubscription, { type PushSubscriptionChangedState } from './PushSubscriptionNamespace';

const SUB_CHANGED_STATE: PushSubscriptionChangedState = {
  current: { id: SUB_ID, token: SUB_TOKEN, optedIn: true },
  previous: { id: PREV_SUB_ID, token: PREV_SUB_TOKEN, optedIn: false },
};

describe('PushSubscription', () => {
  let mockPlugin: ReturnType<typeof createMockPlugin>;
  let pushSubscription: PushSubscription;

  beforeEach(() => {
    mockPlugin = createMockPlugin();
    pushSubscription = new PushSubscription(mockPlugin);
  });

  test('should instantiate PushSubscription class', () => {
    expect(pushSubscription).toBeInstanceOf(PushSubscription);
  });

  describe('getIdAsync', () => {
    test('should return a Promise', () => {
      const promise = pushSubscription.getIdAsync();
      expect(promise).toBeInstanceOf(Promise);
    });

    test('should resolve with push subscription ID', async () => {
      const testId = 'test-subscription-id-456';
      mockPlugin.getPushSubscriptionId.mockResolvedValue({ id: testId });

      const result = await pushSubscription.getIdAsync();
      expect(result).toBe(testId);
    });

    test('should reject Promise when plugin fails', async () => {
      const mockError = new Error('Failed to get subscription ID');
      mockPlugin.getPushSubscriptionId.mockRejectedValue(mockError);

      await expect(pushSubscription.getIdAsync()).rejects.toThrow(mockError.message);
    });
  });

  describe('getTokenAsync', () => {
    test('should return a Promise', () => {
      const promise = pushSubscription.getTokenAsync();
      expect(promise).toBeInstanceOf(Promise);
    });

    test('should resolve with push token', async () => {
      const testToken = 'test-push-token-xyz';
      mockPlugin.getPushSubscriptionToken.mockResolvedValue({
        token: testToken,
      });

      const result = await pushSubscription.getTokenAsync();
      expect(result).toBe(testToken);
    });

    test('should reject Promise when plugin fails', async () => {
      const mockError = new Error('Failed to get push token');
      mockPlugin.getPushSubscriptionToken.mockRejectedValue(mockError);

      await expect(pushSubscription.getTokenAsync()).rejects.toThrow(mockError.message);
    });
  });

  describe('getOptedInAsync', () => {
    test('should return a Promise', () => {
      const promise = pushSubscription.getOptedInAsync();
      expect(promise).toBeInstanceOf(Promise);
    });

    test('should resolve with true when user is opted in', async () => {
      mockPlugin.getPushSubscriptionOptedIn.mockResolvedValue({
        optedIn: true,
      });

      const result = await pushSubscription.getOptedInAsync();
      expect(result).toBe(true);
    });

    test('should reject Promise when plugin fails', async () => {
      const mockError = new Error('Failed to get opted in status');
      mockPlugin.getPushSubscriptionOptedIn.mockRejectedValue(mockError);

      await expect(pushSubscription.getOptedInAsync()).rejects.toThrow(mockError.message);
    });
  });

  describe('addEventListener', () => {
    test('should call addListener', () => {
      const mockListener = vi.fn();
      pushSubscription.addEventListener('change', mockListener);

      expect(mockPlugin.addListener).toHaveBeenCalledWith(
        'pushSubscriptionChange',
        expect.any(Function),
      );
    });

    test('should call listener when subscription state changes', () => {
      const mockListener = vi.fn();
      const mockListener2 = vi.fn();
      pushSubscription.addEventListener('change', mockListener);
      pushSubscription.addEventListener('change', mockListener2);

      const callback = mockPlugin.addListener.mock.calls[0][1];
      callback(SUB_CHANGED_STATE);

      expect(mockListener).toHaveBeenCalledWith(SUB_CHANGED_STATE);
      expect(mockListener2).toHaveBeenCalledWith(SUB_CHANGED_STATE);
    });
  });

  describe('removeEventListener', () => {
    test('should remove listener from observer list', () => {
      const mockListener = vi.fn();
      pushSubscription.addEventListener('change', mockListener);
      pushSubscription.removeEventListener('change', mockListener);

      const callback = mockPlugin.addListener.mock.calls[0][1];
      callback(SUB_CHANGED_STATE);
      expect(mockListener).not.toHaveBeenCalled();
    });

    test('should only remove the specified listener', () => {
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();

      pushSubscription.addEventListener('change', mockListener1);
      pushSubscription.addEventListener('change', mockListener2);
      pushSubscription.removeEventListener('change', mockListener1);

      const callback = mockPlugin.addListener.mock.calls[0][1];
      callback(SUB_CHANGED_STATE);
      expect(mockListener1).not.toHaveBeenCalled();
      expect(mockListener2).toHaveBeenCalledWith(SUB_CHANGED_STATE);
    });
  });

  describe('optIn', () => {
    test('should call plugin', async () => {
      await pushSubscription.optIn();
      expect(mockPlugin.optInPushSubscription).toHaveBeenCalled();
    });
  });

  describe('optOut', () => {
    test('should call plugin', async () => {
      await pushSubscription.optOut();
      expect(mockPlugin.optOutPushSubscription).toHaveBeenCalled();
    });
  });
});
