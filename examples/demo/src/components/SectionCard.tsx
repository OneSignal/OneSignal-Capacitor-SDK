import { IonList, IonListHeader } from '@ionic/react';
import type { ReactNode } from 'react';

export default function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <IonListHeader style={{ '--color': '#e54b4d', fontWeight: 600, fontSize: 15 }}>
        {title}
      </IonListHeader>
      <IonList inset>{children}</IonList>
    </div>
  );
}
