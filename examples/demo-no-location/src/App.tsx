import OneSignal, { LogLevel } from '@onesignal/capacitor-plugin';
import { useCallback, useEffect, useState } from 'react';

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID?.trim() || 'your-onesignal-app-id';

const isPlaceholder = (value: string): boolean => value.toLowerCase().startsWith('your-');

export default function App() {
  const [permission, setPermission] = useState<boolean | null>(null);
  const [pushSubscriptionId, setPushSubscriptionId] = useState<string | null>(null);
  const [locationShared, setLocationShared] = useState<boolean | null>(null);
  const [status, setStatus] = useState('Ready');

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
    setStatus('Requesting notification permission...');
    try {
      const granted = await OneSignal.Notifications.requestPermission(false);
      setPermission(granted);
      refreshPushState();
      setStatus(
        granted ? 'Notification permission granted.' : 'Notification permission not granted.',
      );
    } catch (error) {
      setStatus(`Permission request failed: ${String(error)}`);
    }
  }, [refreshPushState]);

  const checkLocationBridge = useCallback(async () => {
    setStatus('Checking location bridge...');
    try {
      const shared = await OneSignal.Location.isShared();
      setLocationShared(shared);
      setStatus(`Location bridge resolved safely: shared=${String(shared)}.`);
    } catch (error) {
      setStatus(`Location bridge rejected: ${String(error)}`);
    }
  }, []);

  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">OneSignal Capacitor</p>
        <h1>No-Location Demo</h1>
        <p>
          Builds with <code>ONESIGNAL_DISABLE_LOCATION=true</code> and avoids `OneSignal.Location`
          in normal app flow.
        </p>
      </header>

      <section className="card">
        <h2>Configuration</h2>
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
          Request Notification Permission
        </button>
      </section>

      <section className="card">
        <h2>Location Bridge</h2>
        <p>
          This optional check calls <code>OneSignal.Location.isShared()</code>. In a no-location
          Android build it should resolve <code>false</code>; iOS should also remain safe when the
          location product is omitted.
        </p>
        <button type="button" className="secondary" onClick={checkLocationBridge}>
          Check Location Bridge
        </button>
        <p className="result">
          Last location value: {locationShared == null ? 'Not checked' : String(locationShared)}
        </p>
      </section>

      <section className="card">
        <h2>Status</h2>
        <p>{status}</p>
      </section>
    </main>
  );
}
