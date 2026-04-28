import type { FC } from 'react';

import ActionButton from '../ActionButton';
import type { PairItem } from '../ListWidgets';
import { PairList } from '../ListWidgets';
import SectionCard from '../SectionCard';

interface TriggersSectionProps {
  triggerItems: PairItem[];
  onInfoTap: () => void;
  onRemoveTrigger: (key: string) => void;
  onAddTrigger: () => void;
  onAddMultipleTriggers: () => void;
  onRemoveSelectedTriggers: () => void;
  onClearTriggers: () => void;
}

const TriggersSection: FC<TriggersSectionProps> = ({
  triggerItems,
  onInfoTap,
  onRemoveTrigger,
  onAddTrigger,
  onAddMultipleTriggers,
  onRemoveSelectedTriggers,
  onClearTriggers,
}) => (
  <SectionCard title="TRIGGERS" sectionKey="triggers" onInfoTap={onInfoTap}>
    <PairList
      items={triggerItems}
      emptyText="No triggers added"
      onRemove={onRemoveTrigger}
      sectionKey="triggers"
    />
    <ActionButton type="button" onClick={onAddTrigger} data-testid="add_trigger_button">
      ADD
    </ActionButton>
    <ActionButton
      type="button"
      onClick={onAddMultipleTriggers}
      data-testid="add_multiple_triggers_button"
    >
      ADD MULTIPLE
    </ActionButton>
    {triggerItems.length ? (
      <ActionButton
        variant="outline"
        type="button"
        onClick={onRemoveSelectedTriggers}
        data-testid="remove_triggers_button"
      >
        REMOVE SELECTED
      </ActionButton>
    ) : null}
    {triggerItems.length ? (
      <ActionButton
        variant="outline"
        type="button"
        onClick={onClearTriggers}
        data-testid="clear_triggers_button"
      >
        CLEAR ALL
      </ActionButton>
    ) : null}
  </SectionCard>
);

export default TriggersSection;
