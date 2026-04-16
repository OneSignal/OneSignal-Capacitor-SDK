import { describe, test, expect, beforeEach } from 'vitest';

import { createMockPlugin } from '../mocks/capacitor';
import Location from './LocationNamespace';

describe('Location', () => {
  let mockPlugin: ReturnType<typeof createMockPlugin>;
  let location: Location;

  beforeEach(() => {
    mockPlugin = createMockPlugin();
    location = new Location(mockPlugin);
  });

  test('should instantiate Location class', () => {
    expect(location).toBeInstanceOf(Location);
  });

  describe('requestPermission', () => {
    test('should call plugin for requestPermission', async () => {
      await location.requestPermission();

      expect(mockPlugin.requestLocationPermission).toHaveBeenCalled();
    });
  });

  describe('setShared', () => {
    test.each([[true], [false]])('should call plugin for setShared with %s', (sharedValue) => {
      location.setShared(sharedValue);

      expect(mockPlugin.setLocationShared).toHaveBeenCalledWith({
        shared: sharedValue,
      });
    });
  });

  describe('isShared', () => {
    test('should return a Promise', () => {
      const promise = location.isShared();
      expect(promise).toBeInstanceOf(Promise);
    });

    test('should resolve Promise when plugin succeeds', async () => {
      mockPlugin.isLocationShared.mockResolvedValue({ shared: true });

      const result = await location.isShared();
      expect(result).toBe(true);
    });

    test('should reject Promise when plugin fails', async () => {
      const mockError = new Error('Location permission denied');
      mockPlugin.isLocationShared.mockRejectedValue(mockError);

      await expect(location.isShared()).rejects.toThrow(mockError.message);
    });
  });
});
