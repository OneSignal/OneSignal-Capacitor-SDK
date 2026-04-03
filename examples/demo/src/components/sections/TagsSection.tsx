import { IonButton, IonInput, IonItem, IonLabel, IonNote } from '@ionic/react';
import OneSignal from 'onesignal-capacitor-plugin';
import { useEffect, useRef, useState } from 'react';

import SectionCard from '../SectionCard';

export default function TagsSection({ onLog }: { onLog: (msg: string) => void }) {
  const keyRef = useRef<HTMLIonInputElement>(null);
  const valueRef = useRef<HTMLIonInputElement>(null);
  const [tags, setTags] = useState<Record<string, string>>({});

  const refreshTags = () => {
    void OneSignal.User.getTags().then(setTags);
  };

  useEffect(() => {
    refreshTags();
  }, []);

  return (
    <SectionCard title="Tags">
      <IonItem>
        <IonLabel>Current Tags</IonLabel>
        <IonNote slot="end">{JSON.stringify(tags)}</IonNote>
      </IonItem>
      <IonItem>
        <IonInput ref={keyRef} label="Key" labelPlacement="stacked" placeholder="tag_key" />
      </IonItem>
      <IonItem>
        <IonInput ref={valueRef} label="Value" labelPlacement="stacked" placeholder="tag_value" />
      </IonItem>
      <IonItem>
        <IonButton
          onClick={() => {
            const key = String(keyRef.current?.value ?? '').trim();
            const value = String(valueRef.current?.value ?? '').trim();
            if (!key) return onLog('Key is required');
            OneSignal.User.addTag(key, value);
            onLog(`Added tag: ${key}=${value}`);
            refreshTags();
          }}
        >
          Add Tag
        </IonButton>
        <IonButton
          color="medium"
          onClick={() => {
            const key = String(keyRef.current?.value ?? '').trim();
            if (!key) return onLog('Key is required');
            OneSignal.User.removeTag(key);
            onLog(`Removed tag: ${key}`);
            refreshTags();
          }}
        >
          Remove Tag
        </IonButton>
      </IonItem>
    </SectionCard>
  );
}
