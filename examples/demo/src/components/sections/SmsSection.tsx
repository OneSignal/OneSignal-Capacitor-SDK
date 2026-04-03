import { IonButton, IonInput, IonItem } from '@ionic/react';
import OneSignal from 'onesignal-capacitor-plugin';
import { useRef } from 'react';

import SectionCard from '../SectionCard';

export default function SmsSection({ onLog }: { onLog: (msg: string) => void }) {
  const smsRef = useRef<HTMLIonInputElement>(null);

  return (
    <SectionCard title="SMS">
      <IonItem>
        <IonInput
          ref={smsRef}
          label="SMS Number"
          labelPlacement="stacked"
          placeholder="+1234567890"
          type="tel"
        />
      </IonItem>
      <IonItem>
        <IonButton
          onClick={() => {
            const sms = String(smsRef.current?.value ?? '').trim();
            if (!sms) return onLog('SMS number is required');
            OneSignal.User.addSms(sms);
            onLog(`Added SMS: ${sms}`);
          }}
        >
          Add
        </IonButton>
        <IonButton
          color="medium"
          onClick={() => {
            const sms = String(smsRef.current?.value ?? '').trim();
            if (!sms) return onLog('SMS number is required');
            OneSignal.User.removeSms(sms);
            onLog(`Removed SMS: ${sms}`);
          }}
        >
          Remove
        </IonButton>
      </IonItem>
    </SectionCard>
  );
}
