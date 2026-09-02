import { CapacitorHttp } from '@capacitor/core';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { NotificationType } from '../models/NotificationType';
import OneSignalApiService from './OneSignalApiService';

vi.mock('@capacitor/core', () => ({
  CapacitorHttp: {
    post: vi.fn(),
  },
}));

describe('OneSignalApiService notification grouping', () => {
  const post = vi.mocked(CapacitorHttp.post);
  const service = OneSignalApiService.getInstance();

  beforeEach(() => {
    service.setAppId('app-id');
    post.mockResolvedValue({
      data: { id: 'notification-id', recipients: 1 },
      headers: {},
      status: 200,
      url: 'https://onesignal.com/api/v1/notifications',
    });
  });

  it('uses the same Android group for repeated and custom notifications', async () => {
    await service.sendNotification(NotificationType.Simple, 'subscription-id');
    await service.sendNotification(NotificationType.WithImage, 'subscription-id');
    await service.sendCustomNotification('Custom title', 'Custom body', 'subscription-id');

    expect(post).toHaveBeenCalledTimes(3);
    for (const [request] of post.mock.calls) {
      expect(request.data).toMatchObject({ android_group: 'demo-group' });
    }
  });
});
