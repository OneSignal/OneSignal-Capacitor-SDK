import { Capacitor } from '@capacitor/core';
import OneSignal, {
  LogLevel,
  type InAppMessageClickEvent,
  type InAppMessageDidDismissEvent,
  type InAppMessageDidDisplayEvent,
  type InAppMessageWillDismissEvent,
  type InAppMessageWillDisplayEvent,
  type NotificationClickEvent,
  type NotificationWillDisplayEvent,
} from 'onesignal-capacitor-plugin';
import { useCallback, useEffect, useRef, useState } from 'react';

import { NotificationType } from '../models/NotificationType';
import OneSignalRepository from '../repositories/OneSignalRepository';
import LogManager from '../services/LogManager';
import OneSignalApiService, { API_KEY } from '../services/OneSignalApiService';
import PreferencesService from '../services/PreferencesService';

const TAG = 'useOneSignal';
const log = LogManager.getInstance();
const apiService = OneSignalApiService.getInstance();
const repository = new OneSignalRepository(apiService);
const preferences = new PreferencesService();

function toPairs(pairs: Record<string, string>): [string, string][] {
  return Object.entries(pairs).map(([key, value]) => [key, value]);
}

export type UseOneSignalReturn = {
  appId: string;
  consentRequired: boolean;
  privacyConsentGiven: boolean;
  externalUserId: string | undefined;
  pushSubscriptionId: string | undefined;
  isPushEnabled: boolean;
  hasNotificationPermission: boolean;
  inAppMessagesPaused: boolean;
  locationShared: boolean;
  aliasesList: [string, string][];
  emailsList: string[];
  smsNumbersList: string[];
  tagsList: [string, string][];
  triggersList: [string, string][];
  isLoading: boolean;
  loginUser: (externalUserId: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  setConsentRequired: (required: boolean) => Promise<void>;
  setConsentGiven: (granted: boolean) => Promise<void>;
  promptPush: () => Promise<void>;
  setPushEnabled: (enabled: boolean) => void;
  sendNotification: (type: NotificationType) => Promise<void>;
  sendCustomNotification: (title: string, body: string) => Promise<void>;
  clearAllNotifications: () => void;
  setIamPaused: (paused: boolean) => Promise<void>;
  sendIamTrigger: (iamType: string) => void;
  addAlias: (label: string, id: string) => void;
  addAliases: (pairs: Record<string, string>) => void;
  addEmail: (email: string) => void;
  removeEmail: (email: string) => void;
  addSms: (sms: string) => void;
  removeSms: (sms: string) => void;
  addTag: (key: string, value: string) => void;
  addTags: (pairs: Record<string, string>) => void;
  removeSelectedTags: (keys: string[]) => void;
  sendOutcome: (name: string) => void;
  sendUniqueOutcome: (name: string) => void;
  sendOutcomeWithValue: (name: string, value: number) => void;
  addTrigger: (key: string, value: string) => void;
  addTriggers: (pairs: Record<string, string>) => void;
  removeSelectedTriggers: (keys: string[]) => void;
  clearTriggers: () => void;
  trackEvent: (name: string, properties?: Record<string, unknown>) => void;
  setLocationShared: (shared: boolean) => Promise<void>;
  requestLocationPermission: () => void;
  startDefaultLiveActivity: (
    activityId: string,
    attributes: Record<string, unknown>,
    content: Record<string, unknown>,
  ) => void;
  updateLiveActivity: (
    activityId: string,
    eventUpdates: Record<string, unknown>,
  ) => Promise<boolean>;
  endLiveActivity: (activityId: string) => Promise<boolean>;
  enterLiveActivity: (activityId: string, token: string) => void;
  exitLiveActivity: (activityId: string) => void;
};

export function useOneSignal(): UseOneSignalReturn {
  const [appId, setAppId] = useState(() => preferences.getAppId());
  const [consentRequired, setConsentRequiredState] = useState(false);
  const [privacyConsentGiven, setPrivacyConsentGivenState] = useState(false);
  const [externalUserId, setExternalUserId] = useState<string | undefined>(undefined);
  const [pushSubscriptionId, setPushSubscriptionId] = useState<string | undefined>(undefined);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [inAppMessagesPaused, setInAppMessagesPaused] = useState(false);
  const [locationShared, setLocationSharedState] = useState(false);
  const [aliasesList, setAliasesList] = useState<[string, string][]>([]);
  const [emailsList, setEmailsList] = useState<string[]>([]);
  const [smsNumbersList, setSmsNumbersList] = useState<string[]>([]);
  const [tagsList, setTagsList] = useState<[string, string][]>([]);
  const [triggersList, setTriggersList] = useState<[string, string][]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const mountedRef = useRef(true);
  const requestSequenceRef = useRef(0);

  const fetchUserDataFromApi = useCallback(async () => {
    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;

    const onesignalId = await repository.getOnesignalId();
    if (!onesignalId) {
      if (mountedRef.current && requestSequenceRef.current === requestId) {
        setIsLoading(false);
      }
      return;
    }

    const userData = await repository.fetchUser(onesignalId);
    if (!userData) {
      if (mountedRef.current && requestSequenceRef.current === requestId) {
        setIsLoading(false);
      }
      return;
    }

    const externalId = await repository.getExternalId();
    if (!mountedRef.current || requestSequenceRef.current !== requestId) {
      return;
    }

    setAliasesList(Object.entries(userData.aliases));
    setTagsList(Object.entries(userData.tags));
    setEmailsList(userData.emails);
    setSmsNumbersList(userData.smsNumbers);
    setExternalUserId(externalId ?? userData.externalId);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (!API_KEY) {
      log.w(TAG, 'VITE_ONESIGNAL_API_KEY not set in .env — Live Activity update/end will not work');
    }
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const handleIamWillDisplay = (e: InAppMessageWillDisplayEvent) => {
      log.i(TAG, `IAM willDisplay: ${e.message.messageId}`);
    };

    const handleIamDidDisplay = (e: InAppMessageDidDisplayEvent) => {
      log.i(TAG, `IAM didDisplay: ${e.message.messageId}`);
    };

    const handleIamWillDismiss = (e: InAppMessageWillDismissEvent) => {
      log.i(TAG, `IAM willDismiss: ${e.message.messageId}`);
    };

    const handleIamDidDismiss = (e: InAppMessageDidDismissEvent) => {
      log.i(TAG, `IAM didDismiss: ${e.message.messageId}`);
    };

    const handleIamClick = (e: InAppMessageClickEvent) => {
      log.i(TAG, `IAM click: ${e.result.actionId ?? 'unknown'}`);
    };

    const handleNotificationClick = (e: NotificationClickEvent) => {
      log.i(TAG, `Notification click: ${e.notification.title ?? ''}`);
    };

    const handleForegroundWillDisplay = (e: NotificationWillDisplayEvent) => {
      log.i(TAG, `Notification foregroundWillDisplay: ${e.getNotification().title ?? ''}`);

      // If you want to test preventDefault, you can uncomment the following line:
      // e.preventDefault(); // prevent the notification from displaying immediately
      // setTimeout(() => {
      //   e.getNotification().display(); // display the notification after 5 seconds (overrides the preventDefault)
      // }, 5000);
    };

    const pushSubHandler = async () => {
      if (!mountedRef.current) {
        return;
      }
      const [id, optedIn] = await Promise.all([
        repository.getPushSubscriptionId(),
        repository.isPushOptedIn(),
      ]);
      if (!mountedRef.current) {
        return;
      }
      setPushSubscriptionId(id ?? undefined);
      setIsPushEnabled(optedIn);
    };

    const permissionHandler = async () => {
      if (!mountedRef.current) {
        return;
      }
      setHasNotificationPermission(await repository.hasPermission());
    };

    const userChangeHandler = async () => {
      log.i(TAG, 'User changed, fetching user data...');
      if (!mountedRef.current) {
        return;
      }
      setIsLoading(true);
      await fetchUserDataFromApi();
    };

    const load = async () => {
      const nextAppId = preferences.getAppId();
      const nextConsentRequired = preferences.getConsentRequired();
      const nextPrivacyConsentGiven = preferences.getConsentGiven();
      const nextIamPaused = preferences.getIamPaused();
      const nextLocationShared = preferences.getLocationShared();
      const storedExternalUserId = preferences.getExternalUserId() ?? undefined;

      apiService.setAppId(nextAppId);

      if (Capacitor.isNativePlatform()) {
        try {
          OneSignal.Debug.setLogLevel(LogLevel.Verbose);
          OneSignal.setConsentRequired(nextConsentRequired);
          OneSignal.setConsentGiven(nextPrivacyConsentGiven);
          OneSignal.initialize(nextAppId);

          repository.setupDefaultLiveActivities();

          OneSignal.InAppMessages.setPaused(nextIamPaused);
          OneSignal.Location.setShared(nextLocationShared);

          if (storedExternalUserId) {
            repository.loginUser(storedExternalUserId);
          }

          OneSignal.InAppMessages.addEventListener('willDisplay', handleIamWillDisplay);
          OneSignal.InAppMessages.addEventListener('didDisplay', handleIamDidDisplay);
          OneSignal.InAppMessages.addEventListener('willDismiss', handleIamWillDismiss);
          OneSignal.InAppMessages.addEventListener('didDismiss', handleIamDidDismiss);
          OneSignal.InAppMessages.addEventListener('click', handleIamClick);
          OneSignal.Notifications.addEventListener('click', handleNotificationClick);
          OneSignal.Notifications.addEventListener('permissionChange', permissionHandler);
          OneSignal.Notifications.addEventListener(
            'foregroundWillDisplay',
            handleForegroundWillDisplay,
          );

          OneSignal.User.pushSubscription.addEventListener('change', pushSubHandler);
          OneSignal.User.addEventListener('change', userChangeHandler);

          log.i(TAG, `OneSignal initialized with app ID: ${nextAppId}`);
        } catch (err) {
          log.e(TAG, `Init error: ${String(err)}`);
        }
      }

      if (cancelled) {
        return;
      }

      const externalId = await repository.getExternalId();
      const [pushId, pushOptedIn, hasPerm] = await Promise.all([
        repository.getPushSubscriptionId(),
        repository.isPushOptedIn(),
        repository.hasPermission(),
      ]);

      if (cancelled || !mountedRef.current) {
        return;
      }

      setAppId(nextAppId);
      setConsentRequiredState(nextConsentRequired);
      setPrivacyConsentGivenState(nextPrivacyConsentGiven);
      setInAppMessagesPaused(nextIamPaused);
      setLocationSharedState(nextLocationShared);
      setExternalUserId(externalId ?? storedExternalUserId);
      setPushSubscriptionId(pushId ?? undefined);
      setIsPushEnabled(pushOptedIn);
      setHasNotificationPermission(hasPerm);

      const onesignalId = await repository.getOnesignalId();
      if (cancelled || !mountedRef.current) {
        return;
      }

      if (onesignalId) {
        setIsLoading(true);
        await fetchUserDataFromApi();
      }

      if (Capacitor.isNativePlatform() && !cancelled && mountedRef.current) {
        const granted = await repository.requestPermission(true);
        if (mountedRef.current) {
          setHasNotificationPermission(granted);
        }
      }
    };

    void load().catch((err) => {
      log.e(TAG, `Initial load error: ${String(err)}`);
      if (mountedRef.current) {
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
      if (!Capacitor.isNativePlatform()) {
        return;
      }
      OneSignal.InAppMessages.removeEventListener('willDisplay', handleIamWillDisplay);
      OneSignal.InAppMessages.removeEventListener('didDisplay', handleIamDidDisplay);
      OneSignal.InAppMessages.removeEventListener('willDismiss', handleIamWillDismiss);
      OneSignal.InAppMessages.removeEventListener('didDismiss', handleIamDidDismiss);
      OneSignal.InAppMessages.removeEventListener('click', handleIamClick);
      OneSignal.Notifications.removeEventListener('click', handleNotificationClick);
      OneSignal.Notifications.removeEventListener('permissionChange', permissionHandler);
      OneSignal.Notifications.removeEventListener(
        'foregroundWillDisplay',
        handleForegroundWillDisplay,
      );
      OneSignal.User.pushSubscription.removeEventListener('change', pushSubHandler);
      OneSignal.User.removeEventListener('change', userChangeHandler);
    };
  }, [fetchUserDataFromApi]);

  const loginUser = async (nextExternalUserId: string) => {
    setIsLoading(true);
    try {
      repository.loginUser(nextExternalUserId);
      preferences.setExternalUserId(nextExternalUserId);
      if (mountedRef.current) {
        setAliasesList([]);
        setEmailsList([]);
        setSmsNumbersList([]);
        setTagsList([]);
        setTriggersList([]);
      }
      log.i(TAG, `Logged in as: ${nextExternalUserId}`);
      await fetchUserDataFromApi();
    } catch (err) {
      log.e(TAG, `Login error: ${String(err)}`);
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const logoutUser = async () => {
    setIsLoading(true);
    repository.logoutUser();
    preferences.setExternalUserId(null);
    if (mountedRef.current) {
      setExternalUserId(undefined);
      setAliasesList([]);
      setEmailsList([]);
      setSmsNumbersList([]);
      setTagsList([]);
      setTriggersList([]);
      setIsLoading(false);
    }
    log.i(TAG, 'Logged out');
  };

  const setConsentRequired = async (required: boolean) => {
    if (mountedRef.current) {
      setConsentRequiredState(required);
    }
    repository.setConsentRequired(required);
    preferences.setConsentRequired(required);
  };

  const setConsentGiven = async (granted: boolean) => {
    if (mountedRef.current) {
      setPrivacyConsentGivenState(granted);
    }
    repository.setConsentGiven(granted);
    preferences.setConsentGiven(granted);
  };

  const promptPush = async () => {
    const granted = await repository.requestPermission(true);
    if (mountedRef.current) {
      setHasNotificationPermission(granted);
    }
  };

  const setPushEnabled = (enabled: boolean) => {
    if (enabled) {
      repository.optInPush();
    } else {
      repository.optOutPush();
    }
    setIsPushEnabled(enabled);
    const msg = enabled ? 'Push enabled' : 'Push disabled';
    log.i(TAG, msg);
  };

  const sendNotification = async (type: NotificationType) => {
    const success = await repository.sendNotification(type);
    const msg = success ? `Notification sent: ${type}` : 'Failed to send notification';
    log.i(TAG, msg);
  };

  const sendCustomNotification = async (title: string, body: string) => {
    const success = await repository.sendCustomNotification(title, body);
    const msg = success ? `Notification sent: ${title}` : 'Failed to send notification';
    log.i(TAG, msg);
  };

  const clearAllNotifications = () => {
    repository.clearAllNotifications();
    log.i(TAG, 'All notifications cleared');
  };

  const setIamPaused = async (paused: boolean) => {
    setInAppMessagesPaused(paused);
    repository.setPaused(paused);
    preferences.setIamPaused(paused);
    const msg = paused ? 'In-app messages paused' : 'In-app messages resumed';
    log.i(TAG, msg);
  };

  const sendIamTrigger = (iamType: string) => {
    repository.addTrigger('iam_type', iamType);
    setTriggersList((prev) => {
      const filtered = prev.filter(([key]) => key !== 'iam_type');
      return [...filtered, ['iam_type', iamType] as [string, string]];
    });
    const msg = `Sent In-App Message: ${iamType}`;
    log.i(TAG, msg);
  };

  const addAlias = (label: string, id: string) => {
    repository.addAlias(label, id);
    setAliasesList((prev) => [...prev, [label, id]]);
    log.i(TAG, `Alias added: ${label}`);
  };

  const addAliases = (pairs: Record<string, string>) => {
    repository.addAliases(pairs);
    const newEntries = toPairs(pairs);
    setAliasesList((prev) => [...prev, ...newEntries]);
    log.i(TAG, `${newEntries.length} alias(es) added`);
  };

  const addEmail = (email: string) => {
    repository.addEmail(email);
    setEmailsList((prev) => [...prev, email]);
    log.i(TAG, `Email added: ${email}`);
  };

  const removeEmail = (email: string) => {
    repository.removeEmail(email);
    setEmailsList((prev) => {
      const idx = prev.indexOf(email);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
    log.i(TAG, `Email removed: ${email}`);
  };

  const addSms = (sms: string) => {
    repository.addSms(sms);
    setSmsNumbersList((prev) => [...prev, sms]);
    log.i(TAG, `SMS added: ${sms}`);
  };

  const removeSms = (sms: string) => {
    repository.removeSms(sms);
    setSmsNumbersList((prev) => {
      const idx = prev.indexOf(sms);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
    log.i(TAG, `SMS removed: ${sms}`);
  };

  const addTag = (key: string, value: string) => {
    repository.addTag(key, value);
    setTagsList((prev) => {
      const filtered = prev.filter(([k]) => k !== key);
      return [...filtered, [key, value]];
    });
    log.i(TAG, `Tag added: ${key}`);
  };

  const addTags = (pairs: Record<string, string>) => {
    repository.addTags(pairs);
    const newEntries = toPairs(pairs);
    setTagsList((prev) => {
      const keys = new Set(newEntries.map(([k]) => k));
      return [...prev.filter(([k]) => !keys.has(k)), ...newEntries];
    });
    log.i(TAG, `${newEntries.length} tag(s) added`);
  };

  const removeSelectedTags = (keys: string[]) => {
    repository.removeTags(keys);
    const keySet = new Set(keys);
    setTagsList((prev) => prev.filter(([k]) => !keySet.has(k)));
    log.i(TAG, `${keys.length} tag(s) removed`);
  };

  const sendOutcome = (name: string) => {
    repository.sendOutcome(name);
    log.i(TAG, `Outcome sent: ${name}`);
  };

  const sendUniqueOutcome = (name: string) => {
    repository.sendUniqueOutcome(name);
    log.i(TAG, `Unique outcome sent: ${name}`);
  };

  const sendOutcomeWithValue = (name: string, value: number) => {
    repository.sendOutcomeWithValue(name, value);
    log.i(TAG, `Outcome sent: ${name} = ${value}`);
  };

  const addTrigger = (key: string, value: string) => {
    repository.addTrigger(key, value);
    setTriggersList((prev) => {
      const filtered = prev.filter(([k]) => k !== key);
      return [...filtered, [key, value]];
    });
    log.i(TAG, `Trigger added: ${key}`);
  };

  const addTriggers = (pairs: Record<string, string>) => {
    repository.addTriggers(pairs);
    const newEntries = toPairs(pairs);
    setTriggersList((prev) => {
      const keys = new Set(newEntries.map(([k]) => k));
      return [...prev.filter(([k]) => !keys.has(k)), ...newEntries];
    });
    log.i(TAG, `${newEntries.length} trigger(s) added`);
  };

  const removeSelectedTriggers = (keys: string[]) => {
    repository.removeTriggers(keys);
    const keySet = new Set(keys);
    setTriggersList((prev) => prev.filter(([k]) => !keySet.has(k)));
    log.i(TAG, `${keys.length} trigger(s) removed`);
  };

  const clearTriggers = () => {
    repository.clearTriggers();
    setTriggersList([]);
    log.i(TAG, 'All triggers cleared');
  };

  const trackEvent = (name: string, properties?: Record<string, unknown>) => {
    repository.trackEvent(name, properties);
    log.i(TAG, `Event tracked: ${name}`);
  };

  const setLocationShared = async (shared: boolean) => {
    setLocationSharedState(shared);
    repository.setLocationShared(shared);
    preferences.setLocationShared(shared);
    const msg = shared ? 'Location sharing enabled' : 'Location sharing disabled';
    log.i(TAG, msg);
  };

  const requestLocationPermission = () => {
    repository.requestLocationPermission();
  };

  const startDefaultLiveActivity = (
    activityId: string,
    attributes: Record<string, unknown>,
    content: Record<string, unknown>,
  ) => {
    repository.startDefaultLiveActivity(activityId, attributes, content);
    log.i(TAG, `Started live activity: ${activityId}`);
  };

  const updateLiveActivity = async (
    activityId: string,
    eventUpdates: Record<string, unknown>,
  ): Promise<boolean> => {
    const success = await repository.updateLiveActivity(activityId, 'update', eventUpdates);
    const msg = success ? `Updated live activity: ${activityId}` : 'Failed to update live activity';
    log.i(TAG, msg);
    return success;
  };

  const endLiveActivity = async (activityId: string): Promise<boolean> => {
    const success = await repository.updateLiveActivity(activityId, 'end', {
      message: 'Ended Live Activity',
    });
    const msg = success ? `Ended live activity: ${activityId}` : 'Failed to end live activity';
    log.i(TAG, msg);
    return success;
  };

  const enterLiveActivity = (activityId: string, token: string) => {
    repository.enterLiveActivity(activityId, token);
    log.i(TAG, `Entered live activity: ${activityId}`);
  };

  const exitLiveActivity = (activityId: string) => {
    repository.exitLiveActivity(activityId);
    log.i(TAG, `Exited live activity: ${activityId}`);
  };

  return {
    appId,
    consentRequired,
    privacyConsentGiven,
    externalUserId,
    pushSubscriptionId,
    isPushEnabled,
    hasNotificationPermission,
    inAppMessagesPaused,
    locationShared,
    aliasesList,
    emailsList,
    smsNumbersList,
    tagsList,
    triggersList,
    isLoading,
    loginUser,
    logoutUser,
    setConsentRequired,
    setConsentGiven,
    promptPush,
    setPushEnabled,
    sendNotification,
    sendCustomNotification,
    clearAllNotifications,
    setIamPaused,
    sendIamTrigger,
    addAlias,
    addAliases,
    addEmail,
    removeEmail,
    addSms,
    removeSms,
    addTag,
    addTags,
    removeSelectedTags,
    sendOutcome,
    sendUniqueOutcome,
    sendOutcomeWithValue,
    addTrigger,
    addTriggers,
    removeSelectedTriggers,
    clearTriggers,
    trackEvent,
    setLocationShared,
    requestLocationPermission,
    startDefaultLiveActivity,
    updateLiveActivity,
    endLiveActivity,
    enterLiveActivity,
    exitLiveActivity,
  };
}
