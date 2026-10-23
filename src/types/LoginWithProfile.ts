export interface OneSignalUserProfile {
  email?: string;
  sms?: string;
  tags?: Record<string, string>;
  aliases?: Record<string, string>;
}

export type LoginErrorCode =
  | 'BACKEND_ERROR'
  | 'INVALID_ARGUMENT'
  | 'NOT_INITIALIZED'
  | 'STORAGE_LOCKED'
  | 'UNKNOWN';

export type LoginErrorSource = 'CLIENT' | 'BACKEND';

export interface LoginError {
  code: LoginErrorCode;
  source: LoginErrorSource;
  backendCode: string | null;
  httpStatus: number | null;
  message: string;
  meta: Record<string, unknown> | null;
}

export interface LoginData {
  onesignalId: string;
  externalId: string;
  emailSubscriptionId?: string;
  smsSubscriptionId?: string;
}

export interface LoginResult {
  success: boolean;
  data: LoginData | null;
  error: LoginError[] | null;
}
