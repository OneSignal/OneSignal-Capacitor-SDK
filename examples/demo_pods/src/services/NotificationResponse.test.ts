import { describe, expect, it } from 'vitest';

import { classifyNotificationResponse } from './NotificationResponse';

describe('classifyNotificationResponse', () => {
  it.each([
    ['malformed JSON', '{"id":'],
    ['null', null],
    ['a primitive', 42],
    ['an array', [{ id: 'notification-id' }]],
  ])('rejects %s', (_name, body) => {
    expect(classifyNotificationResponse(body)).toBe('failure');
  });

  it('accepts a valid success object', () => {
    expect(classifyNotificationResponse({ id: 'notification-id', recipients: 1 })).toBe('success');
  });

  it.each([
    { id: 'notification-id', recipients: 0 },
    { id: '', errors: ['All included players are not subscribed'] },
    { id: 'notification-id', errors: { invalid_player_ids: ['subscription-id'] } },
  ])('recognizes a transient subscription-indexing failure', (body) => {
    expect(classifyNotificationResponse(body)).toBe('transient-failure');
  });

  it.each([
    {},
    { id: '' },
    { id: 'notification-id', errors: ['Permission denied'] },
    { id: 'notification-id', errors: {} },
    { id: 'notification-id', recipients: '1' },
    { id: 'notification-id', recipients: 1.5 },
    { id: 'notification-id', recipients: -1 },
  ])('rejects ambiguous object responses without retrying', (body) => {
    expect(classifyNotificationResponse(body)).toBe('failure');
  });
});
