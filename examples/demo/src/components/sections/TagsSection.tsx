import type { FC } from 'react';

import ActionButton from '../ActionButton';
import type { PairItem } from '../ListWidgets';
import { PairList } from '../ListWidgets';
import SectionCard from '../SectionCard';

interface TagsSectionProps {
  tagItems: PairItem[];
  loading?: boolean;
  onInfoTap: () => void;
  onRemoveTag: (key: string) => void;
  onAddTag: () => void;
  onAddMultipleTags: () => void;
  onRemoveSelectedTags: () => void;
}

const TagsSection: FC<TagsSectionProps> = ({
  tagItems,
  loading = false,
  onInfoTap,
  onRemoveTag,
  onAddTag,
  onAddMultipleTags,
  onRemoveSelectedTags,
}) => (
  <SectionCard title="TAGS" sectionKey="tags" onInfoTap={onInfoTap}>
    <PairList
      items={tagItems}
      emptyText="No tags added"
      onRemove={onRemoveTag}
      loading={loading}
      sectionKey="tags"
    />
    <ActionButton type="button" onClick={onAddTag} data-testid="add_tag_button">
      ADD
    </ActionButton>
    <ActionButton type="button" onClick={onAddMultipleTags} data-testid="add_multiple_tags_button">
      ADD MULTIPLE
    </ActionButton>
    <ActionButton
      variant="outline"
      type="button"
      onClick={onRemoveSelectedTags}
      data-testid="remove_tags_button"
    >
      REMOVE SELECTED
    </ActionButton>
  </SectionCard>
);

export default TagsSection;
