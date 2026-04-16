import { describe, test, expect, beforeEach } from 'vitest';

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
});
