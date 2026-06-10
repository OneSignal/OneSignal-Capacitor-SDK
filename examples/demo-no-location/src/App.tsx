import OneSignal, { LogLevel } from '@onesignal/capacitor-plugin';
import { useCallback, useEffect, useState } from 'react';

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID?.trim() || 'your-onesignal-app-id';

const isPlaceholder = (value: string): boolean => value.toLowerCase().startsWith('your-');

export default function App() {
  const [permission, setPermission] = useState<boolean | null>(null);
  const [pushSubscriptionId, setPushSubscriptionId] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

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
    setPermissionStatus('Requesting notification permission...');
    try {
      const granted = await OneSignal.Notifications.requestPermission(false);
      setPermission(granted);
      refreshPushState();
      setPermissionStatus(
        granted ? 'Notification permission granted.' : 'Notification permission not granted.',
      );
    } catch (error) {
      setPermissionStatus(`Permission request failed: ${String(error)}`);
    }
  }, [refreshPushState]);

  const testLocationPermissionRequest = useCallback(async () => {
    try {
      await OneSignal.Location.requestPermission();
    } catch (error) {
      console.error('OneSignal.Location.requestPermission failed:', error);
    }
  }, []);

  return (
    <main className="app">
      <header className="appbar">
        <div className="appbar-content">
          <h1>OneSignal</h1>
          <p>No-Location Demo</p>
        </div>
      </header>

      <div className="content">
        <section className="card">
          <h2>Configuration</h2>
          <p>
            This demo initializes OneSignal and requests notification permission only when you tap
            the button below. Native build flags exclude the location module.
          </p>
          <dl>
            <div>
              <dt>App ID</dt>
              <dd className={isPlaceholder(ONESIGNAL_APP_ID) ? 'warning' : undefined}>
                {ONESIGNAL_APP_ID}
              </dd>
            </div>
            <div>
              <dt>Location module</dt>
              <dd>Disabled at native dependency resolution</dd>
            </div>
          </dl>
        </section>

        <section className="card">
          <h2>Push</h2>
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
          <button type="button" onClick={requestPermission}>
            REQUEST PERMISSION
          </button>
          {permissionStatus && <p className="result">{permissionStatus}</p>}
        </section>

        <section className="card">
          <h2>Location Bridge</h2>
          <p>
            The location test call may not log a JavaScript error; check Android Logcat or Xcode
            logs for native diagnostics.
          </p>
          <button type="button" className="secondary" onClick={testLocationPermissionRequest}>
            TEST LOCATION REQUEST
          </button>
        </section>
      </div>
    </main>
  );
}
