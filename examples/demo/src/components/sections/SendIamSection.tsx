import type { FC } from 'react';

import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

interface SendIamSectionProps {
  onInfoTap: () => void;
  onSendTopBanner: () => void;
  onSendBottomBanner: () => void;
  onSendCenterModal: () => void;
  onSendFullScreen: () => void;
}

const iamButtons: { label: string; key: string; type: string }[] = [
  { label: 'TOP BANNER', key: 'top', type: 'top_banner' },
  { label: 'BOTTOM BANNER', key: 'bottom', type: 'bottom_banner' },
  { label: 'CENTER MODAL', key: 'center', type: 'center_modal' },
  { label: 'FULL SCREEN', key: 'full', type: 'full_screen' },
];

const SendIamSection: FC<SendIamSectionProps> = ({
  onInfoTap,
  onSendTopBanner,
  onSendBottomBanner,
  onSendCenterModal,
  onSendFullScreen,
}) => {
  const handlers = [onSendTopBanner, onSendBottomBanner, onSendCenterModal, onSendFullScreen];

  return (
    <SectionCard title="SEND IN-APP MESSAGE" sectionKey="send_iam" onInfoTap={onInfoTap}>
      {iamButtons.map((btn, i) => (
        <ActionButton
          key={btn.key}
          type="button"
          onClick={handlers[i]}
          data-testid={`send_iam_${btn.type}_button`}
        >
          {btn.label}
        </ActionButton>
      ))}
    </SectionCard>
  );
};

export default SendIamSection;
