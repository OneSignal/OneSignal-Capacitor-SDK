import { IonToggle } from '@ionic/react';
import type { FC } from 'react';

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  testId?: string;
}

const ToggleRow: FC<ToggleRowProps> = ({ label, description, checked, onToggle, testId }) => (
  <div className="card toggle-card">
    <div>
      <div className="label">{label}</div>
      {description ? <div className="sub">{description}</div> : null}
    </div>
    <IonToggle
      checked={checked}
      onIonChange={(event) => onToggle(event.detail.checked)}
      data-testid={testId}
    />
  </div>
);

export default ToggleRow;
