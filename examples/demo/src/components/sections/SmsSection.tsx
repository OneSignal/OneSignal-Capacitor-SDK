import type { FC } from 'react';

import ActionButton from '../ActionButton';
import { SingleList } from '../ListWidgets';
import SectionCard from '../SectionCard';

interface SmsSectionProps {
  smsNumbers: string[];
  loading?: boolean;
  onInfoTap: () => void;
  onAddSms: () => void;
  onRemoveSms: (sms: string) => void;
}

const SmsSection: FC<SmsSectionProps> = ({
  smsNumbers,
  loading = false,
  onInfoTap,
  onAddSms,
  onRemoveSms,
}) => (
  <SectionCard title="SMS" sectionKey="sms" onInfoTap={onInfoTap}>
    <SingleList
      items={smsNumbers}
      emptyText="No SMS added"
      onRemove={onRemoveSms}
      loading={loading}
      sectionKey="sms"
    />
    <ActionButton type="button" onClick={onAddSms} data-testid="add_sms_button">
      ADD SMS
    </ActionButton>
  </SectionCard>
);

export default SmsSection;
