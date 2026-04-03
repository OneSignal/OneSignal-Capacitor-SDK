import { IonButton, IonInput, IonItem } from '@ionic/react';
import OneSignal from 'onesignal-capacitor-plugin';
import { useRef } from 'react';

import SectionCard from '../SectionCard';

export default function OutcomesSection({ onLog }: { onLog: (msg: string) => void }) {
  const nameRef = useRef<HTMLIonInputElement>(null);
  const valueRef = useRef<HTMLIonInputElement>(null);

  return (
    <SectionCard title="Outcomes">
      <IonItem>
        <IonInput ref={nameRef} label="Name" labelPlacement="stacked" placeholder="outcome_name" />
      </IonItem>
      <IonItem>
        <IonInput
          ref={valueRef}
          label="Value"
          labelPlacement="stacked"
          placeholder="1.5"
          type="number"
        />
      </IonItem>
      <IonItem>
        <IonButton
          onClick={() => {
            const name = String(nameRef.current?.value ?? '').trim();
            if (!name) return onLog('Name is required');
            OneSignal.Session.addOutcome(name);
            onLog(`Added outcome: ${name}`);
          }}
        >
          Outcome
        </IonButton>
        <IonButton
          onClick={() => {
            const name = String(nameRef.current?.value ?? '').trim();
            if (!name) return onLog('Name is required');
            OneSignal.Session.addUniqueOutcome(name);
            onLog(`Added unique outcome: ${name}`);
          }}
        >
          Unique
        </IonButton>
        <IonButton
          onClick={() => {
            const name = String(nameRef.current?.value ?? '').trim();
            const value = parseFloat(String(valueRef.current?.value ?? ''));
            if (!name) return onLog('Name is required');
            if (isNaN(value)) return onLog('Value must be a number');
            OneSignal.Session.addOutcomeWithValue(name, value);
            onLog(`Added outcome: ${name} = ${value}`);
          }}
        >
          With Value
        </IonButton>
      </IonItem>
    </SectionCard>
  );
}
