import { IonButton, IonInput, IonItem } from '@ionic/react';
import OneSignal from 'onesignal-capacitor-plugin';
import { useRef } from 'react';

import SectionCard from '../SectionCard';

export default function TrackEventSection({ onLog }: { onLog: (msg: string) => void }) {
  const nameRef = useRef<HTMLIonInputElement>(null);

  return (
    <SectionCard title="Track Event">
      <IonItem>
        <IonInput
          ref={nameRef}
          label="Event Name"
          labelPlacement="stacked"
          placeholder="my_event"
        />
      </IonItem>
      <IonItem>
        <IonButton
          onClick={() => {
            const name = String(nameRef.current?.value ?? '').trim();
            if (!name) return onLog('Event name is required');
            OneSignal.User.trackEvent(name);
            onLog(`Tracked event: ${name}`);
          }}
        >
          Track
        </IonButton>
      </IonItem>
    </SectionCard>
  );
}
