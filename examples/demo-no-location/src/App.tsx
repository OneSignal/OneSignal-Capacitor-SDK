import OneSignal, { LogLevel } from '@onesignal/capacitor-plugin';
import { useCallback, useEffect, useState } from 'react';

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID?.trim() || 'your-onesignal-app-id';

const isPlaceholder = (value: string): boolean => value.toLowerCase().startsWith('your-');

export default function App() {
  const [permission, setPermission] = useState<boolean | null>(null);
  const [pushSubscriptionId, setPushSubscriptionId] = useState<string | null>(null);
  const [requestingPermission, setRequestingPermission] = useState(false);
  const [sending, setSending] = useState(false);

  const refreshPushState = useCallback(() => {
    void OneSignal.Notifications.hasPermission()
      .then(setPermission)
      .catch(() => setPermission(null));

    void OneSignal.User.pushSubscription
      .getIdAsync()
      .then(setPushSubscriptionId)
      .catch(() => setPushSubscriptionId(null));
  }, []);

  useEffect(() => {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    void OneSignal.initialize(ONESIGNAL_APP_ID);
    refreshPushState();
  }, [refreshPushState]);

  const requestPermission = useCallback(async () => {
    setRequestingPermission(true);
    try {
      const granted = await OneSignal.Notifications.requestPermission(false);
      setPermission(granted);
      refreshPushState();
    } catch (error) {
      window.alert(`Permission Request Failed\n\n${String(error)}`);
    } finally {
      setRequestingPermission(false);
    }
  }, [refreshPushState]);

  const testLocationPermissionRequest = useCallback(async () => {
    try {
      await OneSignal.Location.requestPermission();
    } catch (error) {
      console.error('OneSignal.Location.requestPermission failed:', error);
    }
  }, []);

  const sendTestNotification = useCallback(async () => {
    if (isPlaceholder(ONESIGNAL_APP_ID)) {
      window.alert(
        'Configure OneSignal\n\nSet VITE_ONESIGNAL_APP_ID in .env before sending a test push.',
      );
      return;
    }

    if (!permission) {
      window.alert(
        'Notifications Disabled\n\nRequest notification permission before sending a test push.',
      );
      return;
    }

    if (!pushSubscriptionId) {
      window.alert('No Push Subscription\n\nAllow notifications, then wait for a push ID.');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.onesignal.v1+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          include_subscription_ids: [pushSubscriptionId],
          headings: { en: 'OneSignal No-Location Demo' },
          contents: { en: 'This test push was sent without linking the location module.' },
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        window.alert(`Send Failed\n\n${message}`);
        return;
      }

      const data: unknown = await response.json();
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        window.alert('Send Failed\n\nInvalid notification response.');
      }
    } catch (error) {
      window.alert(`Send Failed\n\n${String(error)}`);
    } finally {
      setSending(false);
    }
  }, [permission, pushSubscriptionId]);

  return (
    <main className="app">
      <header className="appbar">
        <div className="appbar-content">
          <h1>OneSignal</h1>
          <p>No-Location Demo</p>
        </div>
      </header>

      <div className="content">
        <section className="section">
          <h2>App</h2>
          <div className="card">
            <dl>
              <div>
                <dt>App ID</dt>
                <dd className={isPlaceholder(ONESIGNAL_APP_ID) ? 'warning' : undefined}>
                  {ONESIGNAL_APP_ID}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="section">
          <h2>Push</h2>
          <div className="card">
            <dl>
              <div>
                <dt>Permission</dt>
                <dd>{permission == null ? 'Unknown' : permission ? 'Granted' : 'Not granted'}</dd>
              </div>
              <div>
                <dt>Push ID</dt>
                <dd>{pushSubscriptionId || '-'}</dd>
              </div>
            </dl>
            <button type="button" onClick={requestPermission} disabled={requestingPermission}>
              REQUEST PERMISSION
            </button>
            <div className="button-spacer" />
            <button type="button" onClick={sendTestNotification} disabled={sending}>
              SEND TEST NOTIFICATION
            </button>
          </div>
        </section>

        <section className="section">
          <h2>Location Module</h2>
          <div className="card">
            <p>
              This demo initializes OneSignal and requests notification permission only when you tap
              the button above. Native build flags exclude the location module. The location test
              call may not log a JavaScript error; check Android Logcat or Xcode logs for native
              diagnostics.
            </p>
            <div className="location-button-wrap">
              <button type="button" className="secondary" onClick={testLocationPermissionRequest}>
                TEST LOCATION REQUEST
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
