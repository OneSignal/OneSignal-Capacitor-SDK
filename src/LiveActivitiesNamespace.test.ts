import { describe, test, expect, vi, beforeEach } from 'vitest';

import { createMockPlugin } from '../mocks/capacitor';
import { SUB_TOKEN } from '../mocks/constants';
import LiveActivities from './LiveActivitiesNamespace';
import type { LiveActivitySetupOptions } from './types/LiveActivities';

const ACTIVITY_ID = 'test-activity-id';
const ACTIVITY_TYPE = 'test-activity-type';

describe('LiveActivities', () => {
  let mockPlugin: ReturnType<typeof createMockPlugin>;
  let liveActivities: LiveActivities;

  beforeEach(() => {
    mockPlugin = createMockPlugin();
    liveActivities = new LiveActivities(mockPlugin);
  });

  test('should instantiate LiveActivities class', () => {
    expect(liveActivities).toBeInstanceOf(LiveActivities);
  });

  describe('enter', () => {
    test('should call plugin for enter with required parameters', () => {
      liveActivities.enter(ACTIVITY_ID, SUB_TOKEN);

      expect(mockPlugin.enterLiveActivity).toHaveBeenCalledWith({
        activityId: ACTIVITY_ID,
        token: SUB_TOKEN,
      });
    });

    test('should call onSuccess callback', async () => {
      const onSuccess = vi.fn();
      mockPlugin.enterLiveActivity.mockResolvedValue({ success: true });

      liveActivities.enter(ACTIVITY_ID, SUB_TOKEN, onSuccess);

      await vi.waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    test('should call onFailure callback on error', async () => {
      const onFailure = vi.fn();
      mockPlugin.enterLiveActivity.mockRejectedValue(new Error('Enter failed'));

      liveActivities.enter(ACTIVITY_ID, SUB_TOKEN, undefined, onFailure);

      await vi.waitFor(() => {
        expect(onFailure).toHaveBeenCalled();
      });
    });
  });

  describe('exit', () => {
    test('should call plugin for exit with required parameters', () => {
      liveActivities.exit(ACTIVITY_ID);

      expect(mockPlugin.exitLiveActivity).toHaveBeenCalledWith({
        activityId: ACTIVITY_ID,
      });
    });

    test('should call onSuccess callback', async () => {
      const onSuccess = vi.fn();
      mockPlugin.exitLiveActivity.mockResolvedValue({ success: true });

      liveActivities.exit(ACTIVITY_ID, onSuccess);

      await vi.waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    test('should call onFailure callback on error', async () => {
      const onFailure = vi.fn();
      mockPlugin.exitLiveActivity.mockRejectedValue(new Error('Exit failed'));

      liveActivities.exit(ACTIVITY_ID, undefined, onFailure);

      await vi.waitFor(() => {
        expect(onFailure).toHaveBeenCalled();
      });
    });
  });

  describe('setPushToStartToken', () => {
    test('should call plugin for setPushToStartToken', async () => {
      await liveActivities.setPushToStartToken(ACTIVITY_TYPE, SUB_TOKEN);

      expect(mockPlugin.setPushToStartToken).toHaveBeenCalledWith({
        activityType: ACTIVITY_TYPE,
        token: SUB_TOKEN,
      });
    });
  });

  describe('removePushToStartToken', () => {
    test('should call plugin for removePushToStartToken', async () => {
      await liveActivities.removePushToStartToken(ACTIVITY_TYPE);

      expect(mockPlugin.removePushToStartToken).toHaveBeenCalledWith({
        activityType: ACTIVITY_TYPE,
      });
    });
  });

  describe('setupDefault', () => {
    test('should call plugin for setupDefault without options', async () => {
      await liveActivities.setupDefault();

      expect(mockPlugin.setupDefaultLiveActivity).toHaveBeenCalledWith(undefined);
    });

    test('should call plugin for setupDefault with options', async () => {
      const options: LiveActivitySetupOptions = {
        enablePushToStart: true,
        enablePushToUpdate: false,
      };

      await liveActivities.setupDefault(options);

      expect(mockPlugin.setupDefaultLiveActivity).toHaveBeenCalledWith(options);
    });
  });

  describe('startDefault', () => {
    test('should call plugin for startDefault', async () => {
      const attributes = { key1: 'value1', key2: 'value2' };
      const content = { title: 'Test Title', message: 'Test Message' };

      await liveActivities.startDefault(ACTIVITY_ID, attributes, content);

      expect(mockPlugin.startDefaultLiveActivity).toHaveBeenCalledWith({
        activityId: ACTIVITY_ID,
        attributes,
        content,
      });
    });
  });
});
