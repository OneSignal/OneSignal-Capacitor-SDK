import { IonButton, IonInput, IonItem, IonLabel, IonToggle } from '@ionic/react';
import OneSignal from 'onesignal-capacitor-plugin';
import { useRef } from 'react';

import SectionCard from '../SectionCard';

export default function AppSection({
  onInit,
  onLog,
}: {
  onInit: (appId: string) => void;
  onLog: (msg: string) => void;
}) {
  const appIdRef = useRef<HTMLIonInputElement>(null);

  return (
    <SectionCard title="App">
      <IonItem>
        <IonInput
          ref={appIdRef}
          label="App ID"
          labelPlacement="stacked"
          placeholder="YOUR_ONESIGNAL_APP_ID"
        />
      </IonItem>
      <IonItem>
        <IonButton
          expand="block"
          onClick={() => {
            const val = String(appIdRef.current?.value ?? '').trim();
            if (!val) return onLog('App ID is required');
            onInit(val);
          }}
        >
          Initialize
        </IonButton>
      </IonItem>
      <IonItem>
        <IonLabel>Consent Required</IonLabel>
        <IonToggle
          slot="end"
          onIonChange={(e) => {
            OneSignal.setConsentRequired(e.detail.checked);
            onLog(`Consent required: ${e.detail.checked}`);
          }}
        />
      </IonItem>
      <IonItem>
        <IonLabel>Privacy Consent</IonLabel>
        <IonToggle
          slot="end"
          checked
          onIonChange={(e) => {
            OneSignal.setConsentGiven(e.detail.checked);
            onLog(`Privacy consent: ${e.detail.checked}`);
          }}
        />
      </IonItem>
    </SectionCard>
  );
}
