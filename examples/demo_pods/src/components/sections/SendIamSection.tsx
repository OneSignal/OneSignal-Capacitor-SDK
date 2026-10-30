import type { FC } from 'react';

import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

interface SendIamSectionProps {
  onInfoTap: () => void;
  onSendIam: (iamType: string) => void;
}

const iamButtons: { label: string; type: string }[] = [
  { label: 'TOP', type: 'top_banner' },
  { label: 'BOTTOM', type: 'bottom_banner' },
  { label: 'CENTER', type: 'center_modal' },
  { label: 'HTML', type: 'html' },
  { label: 'FULL', type: 'full_screen' },
  { label: 'FULL BLEED', type: 'full_bleed' },
  { label: 'CAROUSEL', type: 'carousel' },
  { label: 'CAROUSEL BLEED', type: 'carousel_bleed' },
];

const SendIamSection: FC<SendIamSectionProps> = ({ onInfoTap, onSendIam }) => (
  <SectionCard title="SEND IN-APP MESSAGE" sectionKey="send_iam" onInfoTap={onInfoTap}>
    <div className="iam-grid">
      {iamButtons.map((btn) => (
        <ActionButton
          key={btn.type}
          type="button"
          onClick={() => onSendIam(btn.type)}
          data-testid={`send_iam_${btn.type}_button`}
        >
          {btn.label}
        </ActionButton>
      ))}
    </div>
  </SectionCard>
);

export default SendIamSection;
