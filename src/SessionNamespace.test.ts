import { describe, test, expect, beforeEach, vi } from 'vite-plus/test';

import { createMockPlugin } from '../mocks/capacitor';
import Session from './SessionNamespace';

describe('Session', () => {
  let mockPlugin: ReturnType<typeof createMockPlugin>;
  let session: Session;

  beforeEach(() => {
    mockPlugin = createMockPlugin();
    session = new Session(mockPlugin);
  });

  test('should instantiate Session class', () => {
    expect(session).toBeInstanceOf(Session);
  });

  describe('addOutcome', () => {
    test('should call plugin with correct parameters', async () => {
      const outcomeName = 'test_outcome';

      await session.addOutcome(outcomeName);

      expect(mockPlugin.addOutcome).toHaveBeenCalledWith({
        name: outcomeName,
      });
    });
  });

  describe('addUniqueOutcome', () => {
    test('should call plugin with correct parameters', async () => {
      const outcomeName = 'unique_test_outcome';

      await session.addUniqueOutcome(outcomeName);

      expect(mockPlugin.addUniqueOutcome).toHaveBeenCalledWith({
        name: outcomeName,
      });
    });
  });

  describe('addOutcomeWithValue', () => {
    test('should call plugin with correct parameters', async () => {
      const outcomeName = 'purchase_value';
      const outcomeValue = 99.99;

      await session.addOutcomeWithValue(outcomeName, outcomeValue);

      expect(mockPlugin.addOutcomeWithValue).toHaveBeenCalledWith({
        name: outcomeName,
        value: outcomeValue,
      });
    });
  });

  describe('addOutcomeWithValue value', () => {
    test.each([-5, 0, 0.5])('should allow value %s', async (value) => {
      await session.addOutcomeWithValue('purchase', value);

      expect(mockPlugin.addOutcomeWithValue).toHaveBeenCalledWith({ name: 'purchase', value });
    });

    test.each([NaN, Infinity, -Infinity, '5', null, undefined])(
      'should not call plugin for value %s',
      async (value) => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        await session.addOutcomeWithValue('purchase', value as unknown as number);

        expect(consoleSpy).toHaveBeenCalledWith(
          'OneSignal: addOutcomeWithValue: value must be a finite number',
        );
        expect(mockPlugin.addOutcomeWithValue).not.toHaveBeenCalled();

        consoleSpy.mockRestore();
      },
    );
  });

  describe('empty names', () => {
    test.each(['', null, undefined])('should not call plugin for name %s', async (name) => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const missing = name as unknown as string;

      await session.addOutcome(missing);
      await session.addUniqueOutcome(missing);
      await session.addOutcomeWithValue(missing, 1);

      expect(consoleSpy).toHaveBeenCalledWith('OneSignal: addOutcome: name is required');
      expect(consoleSpy).toHaveBeenCalledWith('OneSignal: addUniqueOutcome: name is required');
      expect(consoleSpy).toHaveBeenCalledWith('OneSignal: addOutcomeWithValue: name is required');
      expect(mockPlugin.addOutcome).not.toHaveBeenCalled();
      expect(mockPlugin.addUniqueOutcome).not.toHaveBeenCalled();
      expect(mockPlugin.addOutcomeWithValue).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
