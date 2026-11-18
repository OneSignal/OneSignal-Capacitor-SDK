export type NotificationResponseDisposition = 'success' | 'transient-failure' | 'failure';

function hasRecognizedIndexingError(errors: unknown): boolean {
  if (Array.isArray(errors)) {
    return errors.some(
      (error) =>
        typeof error === 'string' &&
        (error.includes('not subscribed') || error.includes('invalid_player_ids')),
    );
  }

  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return false;
  const invalidPlayerIds = (errors as { invalid_player_ids?: unknown }).invalid_player_ids;
  return Array.isArray(invalidPlayerIds) && invalidPlayerIds.length > 0;
}

export function classifyNotificationResponse(data: unknown): NotificationResponseDisposition {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 'failure';

  const response = data as { id?: unknown; errors?: unknown; recipients?: unknown };
  if (typeof response.id !== 'string') return 'failure';

  if (response.errors !== undefined) {
    return hasRecognizedIndexingError(response.errors) ? 'transient-failure' : 'failure';
  }

  if (!response.id) return 'failure';

  if (response.recipients !== undefined) {
    if (
      typeof response.recipients !== 'number' ||
      !Number.isInteger(response.recipients) ||
      response.recipients < 0
    ) {
      return 'failure';
    }
    if (response.recipients === 0) return 'transient-failure';
  }

  return 'success';
}
