import type { FC } from 'react';

import ActionButton from '../ActionButton';
import type { PairItem } from '../ListWidgets';
import { PairList } from '../ListWidgets';
import SectionCard from '../SectionCard';

interface AliasesSectionProps {
  aliasItems: PairItem[];
  loading?: boolean;
  onInfoTap: () => void;
  onAddAlias: () => void;
  onAddMultipleAliases: () => void;
}

const AliasesSection: FC<AliasesSectionProps> = ({
  aliasItems,
  loading = false,
  onInfoTap,
  onAddAlias,
  onAddMultipleAliases,
}) => (
  <SectionCard title="ALIASES" sectionKey="aliases" onInfoTap={onInfoTap}>
    <PairList
      items={aliasItems}
      emptyText="No Aliases Added"
      loading={loading}
      sectionKey="aliases"
    />
    <ActionButton type="button" onClick={onAddAlias} data-testid="add_alias_button">
      ADD
    </ActionButton>
    <ActionButton
      type="button"
      onClick={onAddMultipleAliases}
      data-testid="add_multiple_aliases_button"
    >
      ADD MULTIPLE
    </ActionButton>
  </SectionCard>
);

export default AliasesSection;
