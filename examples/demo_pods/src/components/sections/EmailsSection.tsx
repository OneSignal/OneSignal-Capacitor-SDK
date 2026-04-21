import type { FC } from 'react';

import ActionButton from '../ActionButton';
import { SingleList } from '../ListWidgets';
import SectionCard from '../SectionCard';

interface EmailsSectionProps {
  emails: string[];
  loading?: boolean;
  onInfoTap: () => void;
  onAddEmail: () => void;
  onRemoveEmail: (email: string) => void;
}

const EmailsSection: FC<EmailsSectionProps> = ({
  emails,
  loading = false,
  onInfoTap,
  onAddEmail,
  onRemoveEmail,
}) => (
  <SectionCard title="EMAILS" sectionKey="emails" onInfoTap={onInfoTap}>
    <SingleList
      items={emails}
      emptyText="No emails added"
      onRemove={onRemoveEmail}
      loading={loading}
      sectionKey="emails"
    />
    <ActionButton type="button" onClick={onAddEmail} data-testid="add_email_button">
      ADD EMAIL
    </ActionButton>
  </SectionCard>
);

export default EmailsSection;
