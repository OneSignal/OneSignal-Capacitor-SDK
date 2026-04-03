import { IonButton, IonItem, IonLabel, IonToggle } from '@ionic/react';
import OneSignal from 'onesignal-capacitor-plugin';

import SectionCard from '../SectionCard';

export default function LocationSection({ onLog }: { onLog: (msg: string) => void }) {
  return (
    <SectionCard title="Location">
      <IonItem>
        <IonLabel>Location Shared</IonLabel>
        <IonToggle
          slot="end"
          onIonChange={(e) => {
            OneSignal.Location.setShared(e.detail.checked);
            onLog(`Location shared: ${e.detail.checked}`);
          }}
        />
      </IonItem>
      <IonItem>
        <IonButton
          onClick={() => {
            OneSignal.Location.requestPermission();
            onLog('Requested location permission');
          }}
        >
          Request Permission
        </IonButton>
      </IonItem>
    </SectionCard>
  );
}
