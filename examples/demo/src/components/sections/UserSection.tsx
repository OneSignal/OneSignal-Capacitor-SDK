import { IonButton, IonInput, IonItem, IonLabel, IonNote } from '@ionic/react';
import OneSignal from 'onesignal-capacitor-plugin';
import { useEffect, useRef, useState } from 'react';

import SectionCard from '../SectionCard';

export default function UserSection({ onLog }: { onLog: (msg: string) => void }) {
  const externalIdRef = useRef<HTMLIonInputElement>(null);
  const [onesignalId, setOnesignalId] = useState<string | null>(null);
  const [externalId, setExternalId] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      void OneSignal.User.getOnesignalId().then(setOnesignalId);
      void OneSignal.User.getExternalId().then(setExternalId);
    };
    refresh();
    OneSignal.User.addEventListener('change', refresh);
    return () => OneSignal.User.removeEventListener('change', refresh);
  }, []);

  return (
    <SectionCard title="User">
      <IonItem>
        <IonLabel>OneSignal ID</IonLabel>
        <IonNote slot="end">{onesignalId ?? 'null'}</IonNote>
      </IonItem>
      <IonItem>
        <IonLabel>External ID</IonLabel>
        <IonNote slot="end">{externalId ?? 'null'}</IonNote>
      </IonItem>
      <IonItem>
        <IonInput
          ref={externalIdRef}
          label="External ID"
          labelPlacement="stacked"
          placeholder="Enter external ID"
        />
      </IonItem>
      <IonItem>
        <IonButton
          onClick={() => {
            const val = String(externalIdRef.current?.value ?? '').trim();
            if (!val) return onLog('External ID is required');
            OneSignal.login(val);
            onLog(`Login: ${val}`);
          }}
        >
          Login
        </IonButton>
        <IonButton
          color="medium"
          onClick={() => {
            OneSignal.logout();
            onLog('Logout');
          }}
        >
          Logout
        </IonButton>
      </IonItem>
    </SectionCard>
  );
}
