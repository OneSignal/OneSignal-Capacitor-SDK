import { IonButton, IonItem } from '@ionic/react';
import OneSignal from 'onesignal-capacitor-plugin';

import SectionCard from '../SectionCard';

export default function NotificationsSection({ onLog }: { onLog: (msg: string) => void }) {
  return (
    <SectionCard title="Notifications">
      <IonItem>
        <IonButton
          onClick={() => {
            OneSignal.Notifications.clearAll();
            onLog('Cleared all notifications');
          }}
        >
          Clear All
        </IonButton>
      </IonItem>
    </SectionCard>
  );
}
