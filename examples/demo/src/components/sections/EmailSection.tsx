import { IonButton, IonInput, IonItem } from '@ionic/react';
import OneSignal from 'onesignal-capacitor-plugin';
import { useRef } from 'react';

import SectionCard from '../SectionCard';

export default function EmailSection({ onLog }: { onLog: (msg: string) => void }) {
  const emailRef = useRef<HTMLIonInputElement>(null);

  return (
    <SectionCard title="Email">
      <IonItem>
        <IonInput
          ref={emailRef}
          label="Email"
          labelPlacement="stacked"
          placeholder="user@example.com"
          type="email"
        />
      </IonItem>
      <IonItem>
        <IonButton
          onClick={() => {
            const email = String(emailRef.current?.value ?? '').trim();
            if (!email) return onLog('Email is required');
            OneSignal.User.addEmail(email);
            onLog(`Added email: ${email}`);
          }}
        >
          Add
        </IonButton>
        <IonButton
          color="medium"
          onClick={() => {
            const email = String(emailRef.current?.value ?? '').trim();
            if (!email) return onLog('Email is required');
            OneSignal.User.removeEmail(email);
            onLog(`Removed email: ${email}`);
          }}
        >
          Remove
        </IonButton>
      </IonItem>
    </SectionCard>
  );
}
