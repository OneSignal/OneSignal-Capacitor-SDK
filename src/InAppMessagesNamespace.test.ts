import { describe, test, expect, vi, beforeEach } from 'vitest';

import { createMockPlugin } from '../mocks/capacitor';
import * as helpers from './helpers';
import InAppMessages from './InAppMessagesNamespace';
import type {
  InAppMessageClickEvent,
  InAppMessageDidDismissEvent,
  InAppMessageDidDisplayEvent,
  InAppMessageWillDisplayEvent,
} from './types/InAppMessage';

describe('InAppMessages', () => {
  let mockPlugin: ReturnType<typeof createMockPlugin>;
  let inAppMessages: InAppMessages;

  beforeEach(() => {
    mockPlugin = createMockPlugin();
    inAppMessages = new InAppMessages(mockPlugin);
  });

  test('should instantiate InAppMessages class', () => {
    expect(inAppMessages).toBeInstanceOf(InAppMessages);
  });

  describe('addEventListener', () => {
    const messageData = {
      click: {
        message: { messageId: 'test' },
        result: { closingMessage: true, actionId: 'test' },
      } satisfies InAppMessageClickEvent,
      willDisplay: {
        message: { messageId: 'test' },
      } satisfies InAppMessageWillDisplayEvent,
      didDisplay: {
        message: { messageId: 'test' },
      } satisfies InAppMessageDidDisplayEvent,
      willDismiss: {
        message: { messageId: 'test' },
      } satisfies InAppMessageDidDismissEvent,
      didDismiss: {
        message: { messageId: 'test' },
      } satisfies InAppMessageDidDismissEvent,
    };

    test.each([
      ['click', 'inAppMessageClick', messageData.click],
      ['willDisplay', 'inAppMessageWillDisplay', messageData.willDisplay],
      ['didDisplay', 'inAppMessageDidDisplay', messageData.didDisplay],
      ['willDismiss', 'inAppMessageWillDismiss', messageData.willDismiss],
      ['didDismiss', 'inAppMessageDidDismiss', messageData.didDismiss],
    ] as const)('should call addListener for %s event', (eventType, listenerName, data) => {
      const mockListener = vi.fn();
      inAppMessages.addEventListener(eventType, mockListener);

      expect(mockPlugin.addListener).toHaveBeenCalledWith(listenerName, expect.any(Function));

      const callback = mockPlugin.addListener.mock.calls[0][1];
      callback(data);
      expect(mockListener).toHaveBeenCalledWith(data);
    });

    test('should not add listener for unknown event type', () => {
      const mockListener = vi.fn();
      // @ts-expect-error - testing unknown event type
      inAppMessages.addEventListener('unknown', mockListener);

      expect(mockPlugin.addListener).not.toHaveBeenCalled();
    });
  });

  describe('removeEventListener', () => {
    test.each([
      ['click'],
      ['willDisplay'],
      ['didDisplay'],
      ['willDismiss'],
      ['didDismiss'],
    ] as const)('should remove %s event listener', (eventType) => {
      const mockListener = vi.fn();
      inAppMessages.addEventListener(eventType, mockListener);
      inAppMessages.removeEventListener(eventType, mockListener);

      expect(mockPlugin.addListener).toHaveBeenCalledTimes(1);

      const callback = mockPlugin.addListener.mock.calls[0][1];
      callback('some-data');
      expect(mockListener).not.toHaveBeenCalled();
    });

    test('should not remove listener for unknown event type', () => {
      vi.spyOn(helpers, 'removeListener').mockImplementation(() => {});
      const mockListener = vi.fn();

      // @ts-expect-error - testing unknown event type
      inAppMessages.removeEventListener('unknown', mockListener);
      expect(helpers.removeListener).not.toHaveBeenCalled();
    });
  });

  describe('addTrigger', () => {
    test('should call plugin for addTrigger', async () => {
      await inAppMessages.addTrigger('key', 'value');

      expect(mockPlugin.addTriggers).toHaveBeenCalledWith({
        triggers: { key: 'value' },
      });
    });
  });

  describe('addTriggers', () => {
    test('should call plugin for addTriggers with string values', async () => {
      const triggers = { key1: 'value1', key2: 'value2' };
      await inAppMessages.addTriggers(triggers);

      expect(mockPlugin.addTriggers).toHaveBeenCalledWith({ triggers });
    });

    test('should convert non-string values to JSON strings', async () => {
      const triggers = { key1: 'value1', key2: 123, key3: true };

      // @ts-expect-error - testing non-string values
      await inAppMessages.addTriggers(triggers);

      expect(mockPlugin.addTriggers).toHaveBeenCalledWith({
        triggers: { key1: 'value1', key2: '123', key3: 'true' },
      });
    });
  });

  describe('removeTrigger', () => {
    test('should call plugin for removeTrigger', async () => {
      await inAppMessages.removeTrigger('key');

      expect(mockPlugin.removeTriggers).toHaveBeenCalledWith({
        keys: ['key'],
      });
    });
  });

  describe('removeTriggers', () => {
    test('should call plugin for removeTriggers with valid array', async () => {
      const keys = ['key1', 'key2'];
      await inAppMessages.removeTriggers(keys);

      expect(mockPlugin.removeTriggers).toHaveBeenCalledWith({ keys });
    });

    test('should handle non-array input gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await inAppMessages.removeTriggers('not-an-array' as any);

      expect(consoleSpy).toHaveBeenCalledWith(
        'OneSignal: removeTriggers: argument must be of type Array',
      );

      consoleSpy.mockRestore();
    });
  });

  describe('clearTriggers', () => {
    test('should call plugin for clearTriggers', async () => {
      await inAppMessages.clearTriggers();

      expect(mockPlugin.clearTriggers).toHaveBeenCalled();
    });
  });

  describe('setPaused', () => {
    test.each([[true], [false]])('should call plugin for setPaused with %s', (pauseValue) => {
      inAppMessages.setPaused(pauseValue);

      expect(mockPlugin.setPaused).toHaveBeenCalledWith({
        pause: pauseValue,
      });
    });
  });

  describe('getPaused', () => {
    test('should return a Promise', () => {
      const promise = inAppMessages.getPaused();
      expect(promise).toBeInstanceOf(Promise);
    });

    test('should resolve Promise when plugin succeeds', async () => {
      mockPlugin.isPaused.mockResolvedValue({ paused: true });

      const result = await inAppMessages.getPaused();
      expect(result).toBe(true);
    });

    test('should reject Promise when plugin fails', async () => {
      const mockError = new Error('Test error');
      mockPlugin.isPaused.mockRejectedValue(mockError);

      await expect(inAppMessages.getPaused()).rejects.toThrow('Test error');
    });
  });
});
