import type { FC } from 'react';

import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

interface CustomEventsSectionProps {
  onInfoTap: () => void;
  onTrackEvent: () => void;
}

const CustomEventsSection: FC<CustomEventsSectionProps> = ({ onInfoTap, onTrackEvent }) => (
  <SectionCard title="CUSTOM EVENTS" sectionKey="custom_events" onInfoTap={onInfoTap}>
    <ActionButton type="button" onClick={onTrackEvent} data-testid="track_event_button">
      TRACK EVENT
    </ActionButton>
  </SectionCard>
);

export default CustomEventsSection;
