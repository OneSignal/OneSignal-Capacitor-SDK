import { describe, expect, test } from 'vite-plus/test';

import { normalizeProfile, parseLoginResult, validateLoginWithProfile } from './LoginWithProfile';

const MALFORMED = {
  success: false,
  data: null,
  error: [
    {
      code: 'UNKNOWN',
      source: 'CLIENT',
      backendCode: null,
      httpStatus: null,
      message: 'loginWithProfile returned a malformed result',
      meta: null,
    },
  ],
};

describe('parseLoginResult', () => {
  test('parses a success envelope', () => {
    expect(
      parseLoginResult({
        success: true,
        data: {
          onesignalId: 'os-1',
          externalId: 'user-1',
          emailSubscriptionId: 'email-1',
          smsSubscriptionId: 'sms-1',
        },
        error: null,
      }),
    ).toEqual({
      success: true,
      data: {
        onesignalId: 'os-1',
        externalId: 'user-1',
        emailSubscriptionId: 'email-1',
        smsSubscriptionId: 'sms-1',
      },
      error: null,
    });
  });

  test('omits absent subscription ids', () => {
    const result = parseLoginResult({
      success: true,
      data: { onesignalId: 'os-1', externalId: 'user-1', emailSubscriptionId: null },
    });
    expect(result.data).toEqual({ onesignalId: 'os-1', externalId: 'user-1' });
  });

  test('parses a backend failure envelope', () => {
    expect(
      parseLoginResult({
        success: false,
        data: null,
        error: [
          {
            code: 'BACKEND_ERROR',
            source: 'BACKEND',
            backendCode: 'user-001',
            httpStatus: 409,
            message: 'conflict',
            meta: { field: 'email' },
          },
        ],
      }),
    ).toEqual({
      success: false,
      data: null,
      error: [
        {
          code: 'BACKEND_ERROR',
          source: 'BACKEND',
          backendCode: 'user-001',
          httpStatus: 409,
          message: 'conflict',
          meta: { field: 'email' },
        },
      ],
    });
  });

  test('coerces malformed error entries without dropping them', () => {
    const result = parseLoginResult({
      success: false,
      error: [{ code: 'NEW_CODE', source: 'ELSEWHERE', httpStatus: '500', meta: [] }, 'oops'],
    });
    expect(result.error).toEqual([
      {
        code: 'UNKNOWN',
        source: 'CLIENT',
        backendCode: null,
        httpStatus: null,
        message: 'loginWithProfile returned a malformed result',
        meta: null,
      },
      MALFORMED.error[0],
    ]);
  });

  test.each([
    ['undefined', undefined],
    ['null', null],
    ['a string', 'success'],
    ['an array', []],
    ['missing success', { data: null }],
    ['non-boolean success', { success: 'true', data: { onesignalId: 'a', externalId: 'b' } }],
    ['success without data', { success: true, data: null }],
    ['success with partial data', { success: true, data: { onesignalId: 'os-1' } }],
    ['failure without errors', { success: false, error: null }],
    ['failure with empty errors', { success: false, error: [] }],
  ])('treats %s as an UNKNOWN failure', (_label, raw) => {
    expect(parseLoginResult(raw)).toEqual(MALFORMED);
  });
});

describe('validateLoginWithProfile', () => {
  test('accepts a full profile', () => {
    expect(
      validateLoginWithProfile(
        'user-1',
        { email: 'a@b.co', sms: '+15555550100', tags: { a: '1' }, aliases: { crm: 'x' } },
        'jwt',
      ),
    ).toBeNull();
  });

  test('accepts an empty profile without jwt', () => {
    expect(validateLoginWithProfile('user-1', {}, undefined)).toBeNull();
  });

  test.each([
    ['empty externalId', '', {}, undefined, 'externalId is required'],
    ['null externalId', null, {}, undefined, 'externalId is required'],
    ['null profile', 'u', null, undefined, 'profile must be an object'],
    ['array profile', 'u', [], undefined, 'profile must be an object'],
    ['non-string email', 'u', { email: 1 }, undefined, 'email must be a string'],
    ['non-string sms', 'u', { sms: {} }, undefined, 'sms must be a string'],
    ['array tags', 'u', { tags: ['a'] }, undefined, 'tags must be an object of non-empty keys'],
    [
      'empty alias id',
      'u',
      { aliases: { crm: '' } },
      undefined,
      'aliases must be an object of non-empty strings',
    ],
    ['non-string jwt', 'u', {}, 42, 'jwtBearerToken must be a string'],
  ])('rejects %s', (_label, externalId, profile, jwt, reason) => {
    expect(validateLoginWithProfile(externalId, profile, jwt)).toBe(reason);
  });
});

describe('normalizeProfile', () => {
  test('drops absent fields and stringifies tag values', () => {
    expect(
      normalizeProfile({
        email: 'a@b.co',
        tags: { level: 3 as unknown as string, name: 'x' },
        aliases: { crm: 'id' },
      }),
    ).toEqual({ email: 'a@b.co', tags: { level: '3', name: 'x' }, aliases: { crm: 'id' } });
  });

  test('returns an empty object for an empty profile', () => {
    expect(normalizeProfile({})).toEqual({});
  });
});
