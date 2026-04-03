import { IonButton, IonInput, IonItem } from '@ionic/react';
import OneSignal from 'onesignal-capacitor-plugin';
import { useRef } from 'react';

import SectionCard from '../SectionCard';

export default function LiveActivitySection({ onLog }: { onLog: (msg: string) => void }) {
  const activityIdRef = useRef<HTMLIonInputElement>(null);
  const tokenRef = useRef<HTMLIonInputElement>(null);

  return (
    <SectionCard title="Live Activities (iOS only)">
      <IonItem>
        <IonInput
          ref={activityIdRef}
          label="Activity ID"
          labelPlacement="stacked"
          placeholder="activity-id"
        />
      </IonItem>
      <IonItem>
        <IonInput ref={tokenRef} label="Token" labelPlacement="stacked" placeholder="token" />
      </IonItem>
      <IonItem>
        <IonButton
          onClick={() => {
            const id = String(activityIdRef.current?.value ?? '').trim();
            const token = String(tokenRef.current?.value ?? '').trim();
            if (!id || !token) return onLog('Activity ID and token are required');
            OneSignal.LiveActivities.enter(id, token);
            onLog(`Entered live activity: ${id}`);
          }}
        >
          Enter
        </IonButton>
        <IonButton
          color="medium"
          onClick={() => {
            const id = String(activityIdRef.current?.value ?? '').trim();
            if (!id) return onLog('Activity ID is required');
            OneSignal.LiveActivities.exit(id);
            onLog(`Exited live activity: ${id}`);
          }}
        >
          Exit
        </IonButton>
      </IonItem>
    </SectionCard>
  );
}
