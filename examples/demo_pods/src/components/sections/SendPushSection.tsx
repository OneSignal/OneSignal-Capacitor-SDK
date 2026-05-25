import type { FC } from 'react';
import { useState } from 'react';

import ActionButton from '../ActionButton';
import CustomNotificationModal from '../modals/CustomNotificationModal';
import SectionCard from '../SectionCard';

interface SendPushSectionProps {
  onInfoTap: () => void;
  onSendSimple: () => void;
  onSendImage: () => void;
  onSendSound: () => void;
  onSendCustomNotification: (title: string, body: string) => Promise<void>;
  onClearAll: () => void;
}

const SendPushSection: FC<SendPushSectionProps> = ({
  onInfoTap,
  onSendSimple,
  onSendImage,
  onSendSound,
  onSendCustomNotification,
  onClearAll,
}) => {
  const [customOpen, setCustomOpen] = useState(false);

  const handleCustomSubmit = async (title: string, body: string) => {
    setCustomOpen(false);
    await onSendCustomNotification(title, body);
  };

  return (
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
      <ActionButton
        type="button"
        onClick={() => setCustomOpen(true)}
        data-testid="send_custom_button"
      >
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
      <CustomNotificationModal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onSubmit={handleCustomSubmit}
      />
    </SectionCard>
  );
};

export default SendPushSection;
