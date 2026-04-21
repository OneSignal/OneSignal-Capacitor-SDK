import type { FC, ReactNode } from 'react';
import {
  MdCropSquare,
  MdFullscreen,
  MdOutlineVerticalAlignBottom,
  MdOutlineVerticalAlignTop,
} from 'react-icons/md';

import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

interface SendIamSectionProps {
  onInfoTap: () => void;
  onSendTopBanner: () => void;
  onSendBottomBanner: () => void;
  onSendCenterModal: () => void;
  onSendFullScreen: () => void;
}

const iamButtons: { label: string; icon: ReactNode; key: string; type: string }[] = [
  { label: 'TOP BANNER', icon: <MdOutlineVerticalAlignTop />, key: 'top', type: 'top_banner' },
  {
    label: 'BOTTOM BANNER',
    icon: <MdOutlineVerticalAlignBottom />,
    key: 'bottom',
    type: 'bottom_banner',
  },
  { label: 'CENTER MODAL', icon: <MdCropSquare />, key: 'center', type: 'center_modal' },
  { label: 'FULL SCREEN', icon: <MdFullscreen />, key: 'full', type: 'full_screen' },
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
          className="iam-btn"
          type="button"
          onClick={handlers[i]}
          data-testid={`send_iam_${btn.type}_button`}
        >
          <span className="action-btn-content">
            <span className="action-btn-icon" aria-hidden>
              {btn.icon}
            </span>
            <span>{btn.label}</span>
          </span>
        </ActionButton>
      ))}
    </SectionCard>
  );
};

export default SendIamSection;
