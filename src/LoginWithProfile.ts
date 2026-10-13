import { hasMissingEntries, isMissing } from './helpers';
import type {
  LoginData,
  LoginError,
  LoginErrorCode,
  LoginResult,
  OneSignalUserProfile,
} from './types/LoginWithProfile';

const ERROR_CODES: readonly LoginErrorCode[] = [
  'BACKEND_ERROR',
  'INVALID_ARGUMENT',
  'NOT_INITIALIZED',
  'STORAGE_LOCKED',
  'UNKNOWN',
];

const MALFORMED_MESSAGE = 'loginWithProfile returned a malformed result';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function invalid(reason: string): string {
  console.error(`[OneSignal] loginWithProfile: ${reason}`);
  return reason;
}

/** Returns the reason the arguments are invalid, or null when they can be sent to native. */
export function validateLoginWithProfile(
  externalId: unknown,
  profile: unknown,
  jwtBearerToken: unknown,
): string | null {
  if (isMissing(externalId, 'loginWithProfile: externalId')) return 'externalId is required';
  if (!isRecord(profile)) return invalid('profile must be an object');
  for (const field of ['email', 'sms'] as const) {
    if (profile[field] != null && typeof profile[field] !== 'string') {
      return invalid(`${field} must be a string`);
    }
  }
  const { tags, aliases } = profile as Record<string, Record<string, unknown> | undefined>;
  if (tags != null && hasMissingEntries(tags, 'loginWithProfile: tags', true)) {
    return 'tags must be an object of non-empty keys';
  }
  if (aliases != null && hasMissingEntries(aliases, 'loginWithProfile: aliases')) {
    return 'aliases must be an object of non-empty strings';
  }
  if (jwtBearerToken != null && typeof jwtBearerToken !== 'string') {
    return invalid('jwtBearerToken must be a string');
  }
  return null;
}

/** Drops absent fields and stringifies non-string tag values, matching `User.addTags`. */
export function normalizeProfile(profile: OneSignalUserProfile): OneSignalUserProfile {
  const normalized: OneSignalUserProfile = {};
  if (profile.email != null) normalized.email = profile.email;
  if (profile.sms != null) normalized.sms = profile.sms;
  if (profile.tags != null) {
    normalized.tags = Object.fromEntries(
      Object.entries(profile.tags as Record<string, unknown>).map(([key, value]) => [
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      ]),
    );
  }
  if (profile.aliases != null) normalized.aliases = { ...profile.aliases };
  return normalized;
}

function clientError(message: string, code: LoginErrorCode): LoginError {
  return { code, source: 'CLIENT', backendCode: null, httpStatus: null, message, meta: null };
}

export function loginFailure(message: string, code: LoginErrorCode = 'UNKNOWN'): LoginResult {
  return { success: false, data: null, error: [clientError(message, code)] };
}

function parseError(raw: unknown): LoginError {
  if (!isRecord(raw)) return clientError(MALFORMED_MESSAGE, 'UNKNOWN');
  const code = ERROR_CODES.find((c) => c === raw.code) ?? 'UNKNOWN';
  return {
    code,
    source: raw.source === 'BACKEND' ? 'BACKEND' : 'CLIENT',
    backendCode: optionalString(raw.backendCode),
    httpStatus: typeof raw.httpStatus === 'number' ? raw.httpStatus : null,
    message: optionalString(raw.message) ?? MALFORMED_MESSAGE,
    meta: isRecord(raw.meta) ? raw.meta : null,
  };
}

function parseData(raw: unknown): LoginData | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.onesignalId !== 'string' || typeof raw.externalId !== 'string') return null;
  const data: LoginData = { onesignalId: raw.onesignalId, externalId: raw.externalId };
  if (typeof raw.emailSubscriptionId === 'string') {
    data.emailSubscriptionId = raw.emailSubscriptionId;
  }
  if (typeof raw.smsSubscriptionId === 'string') {
    data.smsSubscriptionId = raw.smsSubscriptionId;
  }
  return data;
}

/** Never throws: anything that is not a well-formed envelope becomes an UNKNOWN failure. */
export function parseLoginResult(raw: unknown): LoginResult {
  if (!isRecord(raw)) return loginFailure(MALFORMED_MESSAGE);

  if (raw.success === true) {
    const data = parseData(raw.data);
    return data ? { success: true, data, error: null } : loginFailure(MALFORMED_MESSAGE);
  }

  if (raw.success === false && Array.isArray(raw.error) && raw.error.length > 0) {
    return { success: false, data: null, error: raw.error.map(parseError) };
  }

  return loginFailure(MALFORMED_MESSAGE);
}
