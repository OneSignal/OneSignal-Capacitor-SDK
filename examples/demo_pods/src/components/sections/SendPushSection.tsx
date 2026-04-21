import type { FC } from 'react';

import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

interface SendPushSectionProps {
  onInfoTap: () => void;
  onSendSimple: () => void;
  onSendImage: () => void;
  onSendSound: () => void;
  onSendCustom: () => void;
  onClearAll: () => void;
}

const SendPushSection: FC<SendPushSectionProps> = ({
  onInfoTap,
  onSendSimple,
  onSendImage,
  onSendSound,
  onSendCustom,
  onClearAll,
}) => (
  <SectionCard title="SEND PUSH NOTIFICATION" sectionKey="send_push" onInfoTap={onInfoTap}>
    <ActionButton type="button" onClick={onSendSimple} data-testid="send_simple_button">
      SIMPLE
    </ActionButton>
    <ActionButton type="button" onClick={onSendImage} data-testid="send_image_button">
      WITH IMAGE
    </ActionButton>
    <ActionButton type="button" onClick={onSendSound} data-testid="send_sound_button">
      WITH SOUND
    </ActionButton>
    <ActionButton type="button" onClick={onSendCustom} data-testid="send_custom_button">
      CUSTOM
    </ActionButton>
    <ActionButton
      variant="outline"
      type="button"
      onClick={onClearAll}
      data-testid="clear_all_button"
    >
      CLEAR ALL
    </ActionButton>
  </SectionCard>
);

export default SendPushSection;
