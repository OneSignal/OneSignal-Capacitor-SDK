import { IonButton, IonInput, IonItem } from '@ionic/react';
import OneSignal from 'onesignal-capacitor-plugin';
import { useRef } from 'react';

import SectionCard from '../SectionCard';

export default function AliasesSection({ onLog }: { onLog: (msg: string) => void }) {
  const labelRef = useRef<HTMLIonInputElement>(null);
  const idRef = useRef<HTMLIonInputElement>(null);

  return (
    <SectionCard title="Aliases">
      <IonItem>
        <IonInput
          ref={labelRef}
          label="Label"
          labelPlacement="stacked"
          placeholder="e.g. my_alias"
        />
      </IonItem>
      <IonItem>
        <IonInput ref={idRef} label="ID" labelPlacement="stacked" placeholder="e.g. 12345" />
      </IonItem>
      <IonItem>
        <IonButton
          onClick={() => {
            const label = String(labelRef.current?.value ?? '').trim();
            const id = String(idRef.current?.value ?? '').trim();
            if (!label || !id) return onLog('Label and ID are required');
            OneSignal.User.addAlias(label, id);
            onLog(`Added alias: ${label}=${id}`);
          }}
        >
          Add Alias
        </IonButton>
        <IonButton
          color="medium"
          onClick={() => {
            const label = String(labelRef.current?.value ?? '').trim();
            if (!label) return onLog('Label is required');
            OneSignal.User.removeAlias(label);
            onLog(`Removed alias: ${label}`);
          }}
        >
          Remove Alias
        </IonButton>
      </IonItem>
    </SectionCard>
  );
}
