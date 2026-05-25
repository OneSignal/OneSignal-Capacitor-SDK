import type { FC } from 'react';

import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';
import { useSnackbar } from '../ToastProvider';
import ToggleRow from '../ToggleRow';

interface LocationSectionProps {
  locationShared: boolean;
  onInfoTap: () => void;
  onToggleLocationShared: (checked: boolean) => void;
  onPromptLocation: () => void;
  onCheckLocationShared: () => Promise<boolean>;
}

const LocationSection: FC<LocationSectionProps> = ({
  locationShared,
  onInfoTap,
  onToggleLocationShared,
  onPromptLocation,
  onCheckLocationShared,
}) => {
  const showSnackbar = useSnackbar();

  const handleCheckLocation = async (): Promise<void> => {
    const shared = await onCheckLocationShared();
    showSnackbar(`Location shared: ${shared}`);
  };

  return (
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
      <ActionButton
        type="button"
        onClick={() => void handleCheckLocation()}
        data-testid="check_location_button"
      >
        CHECK LOCATION SHARED
      </ActionButton>
    </SectionCard>
  );
};

export default LocationSection;
