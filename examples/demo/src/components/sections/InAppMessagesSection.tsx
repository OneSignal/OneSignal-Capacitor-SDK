import { IonButton, IonInput, IonItem, IonLabel, IonToggle } from '@ionic/react';
import OneSignal from 'onesignal-capacitor-plugin';
import { useRef } from 'react';

import SectionCard from '../SectionCard';

export default function InAppMessagesSection({ onLog }: { onLog: (msg: string) => void }) {
  const triggerKeyRef = useRef<HTMLIonInputElement>(null);
  const triggerValueRef = useRef<HTMLIonInputElement>(null);

  return (
    <SectionCard title="In-App Messages">
      <IonItem>
        <IonLabel>Paused</IonLabel>
        <IonToggle
          slot="end"
          onIonChange={(e) => {
            OneSignal.InAppMessages.setPaused(e.detail.checked);
            onLog(`IAM paused: ${e.detail.checked}`);
          }}
        />
      </IonItem>
      <IonItem>
        <IonInput
          ref={triggerKeyRef}
          label="Trigger Key"
          labelPlacement="stacked"
          placeholder="key"
        />
      </IonItem>
      <IonItem>
        <IonInput
          ref={triggerValueRef}
          label="Trigger Value"
          labelPlacement="stacked"
          placeholder="value"
        />
      </IonItem>
      <IonItem>
        <IonButton
          onClick={() => {
            const key = String(triggerKeyRef.current?.value ?? '').trim();
            const value = String(triggerValueRef.current?.value ?? '').trim();
            if (!key) return onLog('Key is required');
            OneSignal.InAppMessages.addTrigger(key, value);
            onLog(`Added trigger: ${key}=${value}`);
          }}
        >
          Add
        </IonButton>
        <IonButton
          color="medium"
          onClick={() => {
            const key = String(triggerKeyRef.current?.value ?? '').trim();
            if (!key) return onLog('Key is required');
            OneSignal.InAppMessages.removeTrigger(key);
            onLog(`Removed trigger: ${key}`);
          }}
        >
          Remove
        </IonButton>
        <IonButton
          color="warning"
          onClick={() => {
            OneSignal.InAppMessages.clearTriggers();
            onLog('Cleared all triggers');
          }}
        >
          Clear All
        </IonButton>
      </IonItem>
    </SectionCard>
  );
}
