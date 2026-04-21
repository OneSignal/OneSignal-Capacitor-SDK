import type { FC } from 'react';

import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';
import ToggleRow from '../ToggleRow';

interface LocationSectionProps {
  locationShared: boolean;
  onInfoTap: () => void;
  onToggleLocationShared: (checked: boolean) => void;
  onPromptLocation: () => void;
  onCheckLocationShared: () => void;
}

const LocationSection: FC<LocationSectionProps> = ({
  locationShared,
  onInfoTap,
  onToggleLocationShared,
  onPromptLocation,
  onCheckLocationShared,
}) => (
  <SectionCard title="LOCATION" sectionKey="location" onInfoTap={onInfoTap}>
    <ToggleRow
      label="Location Shared"
      description="Share device location with OneSignal"
      checked={locationShared}
      onToggle={onToggleLocationShared}
      testId="location_shared_toggle"
    />
    <ActionButton type="button" onClick={onPromptLocation} data-testid="prompt_location_button">
      PROMPT LOCATION
    </ActionButton>
    <ActionButton type="button" onClick={onCheckLocationShared} data-testid="check_location_button">
      CHECK LOCATION SHARED
    </ActionButton>
  </SectionCard>
);

export default LocationSection;
