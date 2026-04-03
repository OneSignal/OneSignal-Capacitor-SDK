import { IonApp, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import OneSignal, { LogLevel } from 'onesignal-capacitor-plugin';
import { useEffect, useRef, useState } from 'react';

import HomeScreen from './screens/HomeScreen';

const TAG = 'App';

export default function App() {
  const [logs, setLogs] = useState<string[]>([]);
  const initialized = useRef(false);

  function log(msg: string) {
    setLogs((prev) => [...prev, `[${TAG}] ${msg}`]);
    console.log(`[${TAG}] ${msg}`);
  }

  function initOneSignal(appId: string) {
    if (initialized.current) {
      log('Already initialized');
      return;
    }
    initialized.current = true;

    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.setConsentRequired(false);
    OneSignal.setConsentGiven(true);
    OneSignal.initialize(appId);

    OneSignal.LiveActivities.setupDefault({
      enablePushToStart: true,
      enablePushToUpdate: true,
    });

    OneSignal.Notifications.addEventListener('click', (e) => {
      log(`Notification click: ${e.notification.title ?? ''}`);
    });

    OneSignal.Notifications.addEventListener('foregroundWillDisplay', (e) => {
      log(`Foreground notification: ${e.getNotification().title ?? ''}`);
      e.getNotification().display();
    });

    OneSignal.Notifications.addEventListener('permissionChange', (granted) => {
      log(`Permission changed: ${granted}`);
    });

    OneSignal.InAppMessages.addEventListener('click', (e) => {
      log(`IAM click: ${e.result.actionId ?? 'unknown'}`);
    });

    OneSignal.User.addEventListener('change', (e) => {
      log(`User changed: onesignalId=${e.current.onesignalId ?? 'null'}`);
    });

    OneSignal.User.pushSubscription.addEventListener('change', (e) => {
      log(`Push sub changed: optedIn=${e.current.optedIn}`);
    });

    log(`Initialized with appId: ${appId}`);
  }

  useEffect(() => {
    return () => {
      initialized.current = false;
    };
  }, []);

  return (
    <IonApp>
      <IonHeader>
        <IonToolbar color="danger">
          <IonTitle>OneSignal Capacitor</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <HomeScreen logs={logs} onInit={initOneSignal} onLog={log} />
      </IonContent>
    </IonApp>
  );
}
