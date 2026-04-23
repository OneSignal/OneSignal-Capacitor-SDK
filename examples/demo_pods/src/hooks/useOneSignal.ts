import OneSignal, {
  LogLevel,
  type InAppMessageClickEvent,
  type InAppMessageDidDismissEvent,
  type InAppMessageDidDisplayEvent,
  type InAppMessageWillDismissEvent,
  type InAppMessageWillDisplayEvent,
  type NotificationClickEvent,
  type NotificationWillDisplayEvent,
  type UserChangedState,
} from 'onesignal-capacitor-plugin';
import { useCallback, useEffect, useRef, useState } from 'react';

import { NotificationType } from '../models/NotificationType';
import LogManager from '../services/LogManager';
import OneSignalApiService, { API_KEY } from '../services/OneSignalApiService';
import PreferencesService from '../services/PreferencesService';

const TAG = 'useOneSignal';
const log = LogManager.getInstance();
const apiService = OneSignalApiService.getInstance();
const preferences = new PreferencesService();

async function postNotification(type: NotificationType): Promise<boolean> {
  const subscriptionId = await OneSignal.User.pushSubscription.getIdAsync();
  if (!subscriptionId) return false;
  return apiService.sendNotification(type, subscriptionId);
}

async function postCustomNotification(title: string, body: string): Promise<boolean> {
  const subscriptionId = await OneSignal.User.pushSubscription.getIdAsync();
  if (!subscriptionId) return false;
  return apiService.sendCustomNotification(title, body, subscriptionId);
}

function mergePairs<V>(prev: [string, V][], next: Record<string, V>): [string, V][] {
  const merged = new Map(prev);
  for (const [k, v] of Object.entries(next)) merged.set(k, v);
  return Array.from(merged.entries());
}

function mergeUnique<T>(prev: T[], next: T[]): T[] {
  return Array.from(new Set([...prev, ...next]));
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

  const requestSequenceRef = useRef(0);

  // Uses a request-sequence guard so stale results are dropped when a newer
  // fetch starts before this one finishes.
  const fetchUserDataFromApi = useCallback(async () => {
    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;
    setIsLoading(true);

    try {
      const onesignalId = await OneSignal.User.getOnesignalId();
      if (!onesignalId) return;

      const userData = await apiService.fetchUser(onesignalId);
      if (!userData) return;

      const externalId = await OneSignal.User.getExternalId();
      if (requestSequenceRef.current !== requestId) {
        return;
      }

      console.log('userData', userData);
      setAliasesList((prev) => mergePairs(prev, userData.aliases));
      setTagsList((prev) => mergePairs(prev, userData.tags));
      setEmailsList((prev) => mergeUnique(prev, userData.emails));
      setSmsNumbersList((prev) => mergeUnique(prev, userData.smsNumbers));
      setExternalUserId(externalId ?? userData.externalId);
    } finally {
      if (requestSequenceRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!API_KEY) {
      log.w(TAG, 'VITE_ONESIGNAL_API_KEY not set in .env — Live Activity update/end will not work');
    }
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
      const [id, optedIn] = await Promise.all([
        OneSignal.User.pushSubscription.getIdAsync(),
        OneSignal.User.pushSubscription.getOptedInAsync(),
      ]);
      setPushSubscriptionId(id ?? undefined);
      setIsPushEnabled(optedIn);
    };

    const permissionHandler = (granted: boolean) => {
      setHasNotificationPermission(granted);
    };

    const userChangeHandler = (event: UserChangedState) => {
      const nextOnesignalId = event.current.onesignalId ?? null;
      log.i(
        TAG,
        `User changed: onesignalId=${nextOnesignalId ?? 'null'}, externalId=${event.current.externalId ?? 'null'}`,
      );

      // Drive the post-login fetch from the event so it runs only once the
      // SDK has actually assigned a new onesignalId. On logout (null), skip;
      // logoutUser already clears local lists.
      if (nextOnesignalId === null) return;
      void fetchUserDataFromApi();
    };

    const load = async () => {
      const nextAppId = preferences.getAppId();
      const nextConsentRequired = preferences.getConsentRequired();
      const nextPrivacyConsentGiven = preferences.getConsentGiven();
      const nextIamPaused = preferences.getIamPaused();
      const nextLocationShared = preferences.getLocationShared();
      const storedExternalUserId = preferences.getExternalUserId() ?? undefined;

      apiService.setAppId(nextAppId);

      try {
        OneSignal.Debug.setLogLevel(LogLevel.Verbose);
        OneSignal.setConsentRequired(nextConsentRequired);
        OneSignal.setConsentGiven(nextPrivacyConsentGiven);
        OneSignal.initialize(nextAppId);

        OneSignal.LiveActivities.setupDefault({
          enablePushToStart: true,
          enablePushToUpdate: true,
        });

        OneSignal.InAppMessages.setPaused(nextIamPaused);
        OneSignal.Location.setShared(nextLocationShared);

        if (storedExternalUserId) {
          OneSignal.login(storedExternalUserId);
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

      if (cancelled) {
        return;
      }

      const externalId = await OneSignal.User.getExternalId();
      const [pushId, pushOptedIn, hasPerm] = await Promise.all([
        OneSignal.User.pushSubscription.getIdAsync(),
        OneSignal.User.pushSubscription.getOptedInAsync(),
        OneSignal.Notifications.hasPermission(),
      ]);

      if (cancelled) {
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

      const onesignalId = await OneSignal.User.getOnesignalId();
      if (cancelled) {
        return;
      }

      if (onesignalId) {
        await fetchUserDataFromApi();
      }

      if (!cancelled) {
        const granted = await OneSignal.Notifications.requestPermission(true);
        setHasNotificationPermission(granted);
      }
    };

    void load().catch((err) => {
      log.e(TAG, `Initial load error: ${String(err)}`);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
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
    setAliasesList([]);
    setEmailsList([]);
    setSmsNumbersList([]);
    setTagsList([]);
    setTriggersList([]);
    setExternalUserId(nextExternalUserId);
    setIsLoading(true);

    try {
      OneSignal.login(nextExternalUserId);
      preferences.setExternalUserId(nextExternalUserId);
      log.i(TAG, `Logged in as: ${nextExternalUserId}`);
      // The user 'change' listener runs fetchUserDataFromApi once the new
      // onesignalId is assigned; that call clears isLoading in its finally.
    } catch (err) {
      log.e(TAG, `Login error: ${String(err)}`);
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    OneSignal.logout();
    preferences.setExternalUserId(null);
    setExternalUserId(undefined);
    setAliasesList([]);
    setEmailsList([]);
    setSmsNumbersList([]);
    setTagsList([]);
    setTriggersList([]);
    log.i(TAG, 'Logged out');
  };

  const setConsentRequired = async (required: boolean) => {
    setConsentRequiredState(required);
    OneSignal.setConsentRequired(required);
    preferences.setConsentRequired(required);
  };

  const setConsentGiven = async (granted: boolean) => {
    setPrivacyConsentGivenState(granted);
    OneSignal.setConsentGiven(granted);
    preferences.setConsentGiven(granted);
  };

  // Memoized so HomeScreen's push-prompt useEffect dependency doesn't
  // re-fire on unrelated state changes in this provider.
  const promptPush = useCallback(async () => {
    const granted = await OneSignal.Notifications.requestPermission(true);
    setHasNotificationPermission(granted);
  }, []);

  const setPushEnabled = (enabled: boolean) => {
    if (enabled) {
      OneSignal.User.pushSubscription.optIn();
    } else {
      OneSignal.User.pushSubscription.optOut();
    }
    setIsPushEnabled(enabled);
    const msg = enabled ? 'Push enabled' : 'Push disabled';
    log.i(TAG, msg);
  };

  const sendNotification = async (type: NotificationType) => {
    const success = await postNotification(type);
    const msg = success ? `Notification sent: ${type}` : 'Failed to send notification';
    log.i(TAG, msg);
  };

  const sendCustomNotification = async (title: string, body: string) => {
    const success = await postCustomNotification(title, body);
    const msg = success ? `Notification sent: ${title}` : 'Failed to send notification';
    log.i(TAG, msg);
  };

  const clearAllNotifications = () => {
    OneSignal.Notifications.clearAll();
    log.i(TAG, 'All notifications cleared');
  };

  const setIamPaused = async (paused: boolean) => {
    setInAppMessagesPaused(paused);
    OneSignal.InAppMessages.setPaused(paused);
    preferences.setIamPaused(paused);
    const msg = paused ? 'In-app messages paused' : 'In-app messages resumed';
    log.i(TAG, msg);
  };

  const sendIamTrigger = (iamType: string) => {
    OneSignal.InAppMessages.addTrigger('iam_type', iamType);
    setTriggersList((prev) => mergePairs(prev, { iam_type: iamType }));
    const msg = `Sent In-App Message: ${iamType}`;
    log.i(TAG, msg);
  };

  const addAlias = (label: string, id: string) => {
    OneSignal.User.addAlias(label, id);
    setAliasesList((prev) => mergePairs(prev, { [label]: id }));
    log.i(TAG, `Alias added: ${label}`);
  };

  const addAliases = (pairs: Record<string, string>) => {
    OneSignal.User.addAliases(pairs);
    setAliasesList((prev) => mergePairs(prev, pairs));
    log.i(TAG, `${Object.keys(pairs).length} alias(es) added`);
  };

  const addEmail = (email: string) => {
    OneSignal.User.addEmail(email);
    setEmailsList((prev) => mergeUnique(prev, [email]));
    log.i(TAG, `Email added: ${email}`);
  };

  const removeEmail = (email: string) => {
    OneSignal.User.removeEmail(email);
    setEmailsList((prev) => {
      const idx = prev.indexOf(email);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
    log.i(TAG, `Email removed: ${email}`);
  };

  const addSms = (sms: string) => {
    OneSignal.User.addSms(sms);
    setSmsNumbersList((prev) => mergeUnique(prev, [sms]));
    log.i(TAG, `SMS added: ${sms}`);
  };

  const removeSms = (sms: string) => {
    OneSignal.User.removeSms(sms);
    setSmsNumbersList((prev) => {
      const idx = prev.indexOf(sms);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
    log.i(TAG, `SMS removed: ${sms}`);
  };

  const addTag = (key: string, value: string) => {
    OneSignal.User.addTag(key, value);
    setTagsList((prev) => mergePairs(prev, { [key]: value }));
    log.i(TAG, `Tag added: ${key}`);
  };

  const addTags = (pairs: Record<string, string>) => {
    OneSignal.User.addTags(pairs);
    setTagsList((prev) => mergePairs(prev, pairs));
    log.i(TAG, `${Object.keys(pairs).length} tag(s) added`);
  };

  const removeSelectedTags = (keys: string[]) => {
    OneSignal.User.removeTags(keys);
    const keySet = new Set(keys);
    setTagsList((prev) => prev.filter(([k]) => !keySet.has(k)));
    log.i(TAG, `${keys.length} tag(s) removed`);
  };

  const sendOutcome = (name: string) => {
    OneSignal.Session.addOutcome(name);
    log.i(TAG, `Outcome sent: ${name}`);
  };

  const sendUniqueOutcome = (name: string) => {
    OneSignal.Session.addUniqueOutcome(name);
    log.i(TAG, `Unique outcome sent: ${name}`);
  };

  const sendOutcomeWithValue = (name: string, value: number) => {
    OneSignal.Session.addOutcomeWithValue(name, value);
    log.i(TAG, `Outcome sent: ${name} = ${value}`);
  };

  const addTrigger = (key: string, value: string) => {
    OneSignal.InAppMessages.addTrigger(key, value);
    setTriggersList((prev) => mergePairs(prev, { [key]: value }));
    log.i(TAG, `Trigger added: ${key}`);
  };

  const addTriggers = (pairs: Record<string, string>) => {
    OneSignal.InAppMessages.addTriggers(pairs);
    setTriggersList((prev) => mergePairs(prev, pairs));
    log.i(TAG, `${Object.keys(pairs).length} trigger(s) added`);
  };

  const removeSelectedTriggers = (keys: string[]) => {
    OneSignal.InAppMessages.removeTriggers(keys);
    const keySet = new Set(keys);
    setTriggersList((prev) => prev.filter(([k]) => !keySet.has(k)));
    log.i(TAG, `${keys.length} trigger(s) removed`);
  };

  const clearTriggers = () => {
    OneSignal.InAppMessages.clearTriggers();
    setTriggersList([]);
    log.i(TAG, 'All triggers cleared');
  };

  const trackEvent = (name: string, properties?: Record<string, unknown>) => {
    OneSignal.User.trackEvent(name, properties);
    log.i(TAG, `Event tracked: ${name}`);
  };

  const setLocationShared = async (shared: boolean) => {
    setLocationSharedState(shared);
    OneSignal.Location.setShared(shared);
    preferences.setLocationShared(shared);
    const msg = shared ? 'Location sharing enabled' : 'Location sharing disabled';
    log.i(TAG, msg);
  };

  const requestLocationPermission = () => {
    OneSignal.Location.requestPermission();
  };

  const startDefaultLiveActivity = (
    activityId: string,
    attributes: Record<string, unknown>,
    content: Record<string, unknown>,
  ) => {
    OneSignal.LiveActivities.startDefault(activityId, attributes, content);
    log.i(TAG, `Started live activity: ${activityId}`);
  };

  const updateLiveActivity = async (
    activityId: string,
    eventUpdates: Record<string, unknown>,
  ): Promise<boolean> => {
    const success = await apiService.updateLiveActivity(activityId, 'update', eventUpdates);
    const msg = success ? `Updated live activity: ${activityId}` : 'Failed to update live activity';
    log.i(TAG, msg);
    return success;
  };

  const endLiveActivity = async (activityId: string): Promise<boolean> => {
    const success = await apiService.updateLiveActivity(activityId, 'end', {
      message: 'Ended Live Activity',
    });
    const msg = success ? `Ended live activity: ${activityId}` : 'Failed to end live activity';
    log.i(TAG, msg);
    return success;
  };

  const enterLiveActivity = (activityId: string, token: string) => {
    OneSignal.LiveActivities.enter(activityId, token);
    log.i(TAG, `Entered live activity: ${activityId}`);
  };

  const exitLiveActivity = (activityId: string) => {
    OneSignal.LiveActivities.exit(activityId);
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
