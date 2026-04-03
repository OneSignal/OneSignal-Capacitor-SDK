import { IonButton, IonItem, IonLabel, IonNote } from '@ionic/react';
import OneSignal from 'onesignal-capacitor-plugin';
import { useEffect, useState } from 'react';

import SectionCard from '../SectionCard';

export default function PushSection({ onLog }: { onLog: (msg: string) => void }) {
  const [subId, setSubId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [optedIn, setOptedIn] = useState(false);
  const [permission, setPermission] = useState(false);

  useEffect(() => {
    const refresh = () => {
      void OneSignal.User.pushSubscription.getIdAsync().then(setSubId);
      void OneSignal.User.pushSubscription.getTokenAsync().then(setToken);
      void OneSignal.User.pushSubscription.getOptedInAsync().then(setOptedIn);
      void OneSignal.Notifications.getPermissionAsync().then(setPermission);
    };
    refresh();
    OneSignal.User.pushSubscription.addEventListener('change', refresh);
    OneSignal.Notifications.addEventListener('permissionChange', refresh);
    return () => {
      OneSignal.User.pushSubscription.removeEventListener('change', refresh);
      OneSignal.Notifications.removeEventListener('permissionChange', refresh);
    };
  }, []);

  return (
    <SectionCard title="Push Subscription">
      <IonItem>
        <IonLabel>Subscription ID</IonLabel>
        <IonNote slot="end">{subId ?? 'null'}</IonNote>
      </IonItem>
      <IonItem>
        <IonLabel>Token</IonLabel>
        <IonNote slot="end">{token ? `${token.substring(0, 20)}...` : 'null'}</IonNote>
      </IonItem>
      <IonItem>
        <IonLabel>Opted In</IonLabel>
        <IonNote slot="end">{String(optedIn)}</IonNote>
      </IonItem>
      <IonItem>
        <IonLabel>Permission</IonLabel>
        <IonNote slot="end">{String(permission)}</IonNote>
      </IonItem>
      <IonItem>
        <IonButton
          onClick={async () => {
            const granted = await OneSignal.Notifications.requestPermission(false);
            onLog(`Permission result: ${granted}`);
          }}
        >
          Request Permission
        </IonButton>
      </IonItem>
      <IonItem>
        <IonButton
          onClick={() => {
            OneSignal.User.pushSubscription.optIn();
            onLog('Opted in');
          }}
        >
          Opt In
        </IonButton>
        <IonButton
          color="medium"
          onClick={() => {
            OneSignal.User.pushSubscription.optOut();
            onLog('Opted out');
          }}
        >
          Opt Out
        </IonButton>
      </IonItem>
    </SectionCard>
  );
}
