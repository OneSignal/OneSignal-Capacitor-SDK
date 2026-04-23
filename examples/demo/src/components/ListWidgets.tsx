import { IonSpinner } from '@ionic/react';
import { type FC, useState } from 'react';
import { MdClose } from 'react-icons/md';

const COLLAPSE_THRESHOLD = 5;

export type PairItem = {
  key: string;
  value: string;
};

interface EmptyStateProps {
  text: string;
  testId?: string;
}

interface LoadingStateProps {
  testId?: string;
}

interface PairListProps {
  items: PairItem[];
  onRemove?: (key: string) => void;
  emptyText?: string;
  loading?: boolean;
  sectionKey?: string;
}

interface SingleListProps {
  items: string[];
  emptyText: string;
  onRemove?: (value: string) => void;
  loading?: boolean;
  sectionKey?: string;
}

export const EmptyState: FC<EmptyStateProps> = ({ text, testId }) => (
  <p className="empty" data-testid={testId}>
    {text}
  </p>
);

export const LoadingState: FC<LoadingStateProps> = ({ testId }) => (
  <div className="list-loading" data-testid={testId}>
    <IonSpinner name="crescent" />
  </div>
);

export const PairList: FC<PairListProps> = ({
  items,
  onRemove,
  emptyText = 'No items',
  loading = false,
  sectionKey,
}) => {
  if (items.length === 0) {
    return (
      <div className="card list-card">
        {loading ? (
          <LoadingState testId={sectionKey ? `${sectionKey}_loading` : undefined} />
        ) : (
          <EmptyState text={emptyText} testId={sectionKey ? `${sectionKey}_empty` : undefined} />
        )}
      </div>
    );
  }

  return (
    <div className="card list-card">
      {items.map((item) => (
        <div key={item.key} className="list-item two-line">
          <div>
            <span
              className="list-key"
              data-testid={sectionKey ? `${sectionKey}_pair_key_${item.key}` : undefined}
            >
              {item.key}
            </span>
            <span data-testid={sectionKey ? `${sectionKey}_pair_value_${item.key}` : undefined}>
              {item.value}
            </span>
          </div>
          {onRemove ? (
            <button
              type="button"
              className="delete-btn"
              onClick={() => onRemove(item.key)}
              data-testid={sectionKey ? `${sectionKey}_remove_${item.key}` : undefined}
            >
              <MdClose />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export const SingleList: FC<SingleListProps> = ({
  items,
  emptyText,
  onRemove,
  loading = false,
  sectionKey,
}) => {
  const [expanded, setExpanded] = useState(false);
  const showAll = expanded || items.length <= COLLAPSE_THRESHOLD;
  const displayItems = showAll ? items : items.slice(0, COLLAPSE_THRESHOLD);
  const hiddenCount = items.length - COLLAPSE_THRESHOLD;

  if (items.length === 0) {
    return (
      <div className="card list-card">
        {loading ? (
          <LoadingState testId={sectionKey ? `${sectionKey}_loading` : undefined} />
        ) : (
          <EmptyState text={emptyText} testId={sectionKey ? `${sectionKey}_empty` : undefined} />
        )}
      </div>
    );
  }

  return (
    <div className="card list-card">
      {displayItems.map((item) => (
        <div key={item} className="list-item">
          <span data-testid={sectionKey ? `${sectionKey}_value_${item}` : undefined}>{item}</span>
          {onRemove ? (
            <button
              type="button"
              className="delete-btn"
              onClick={() => onRemove(item)}
              data-testid={sectionKey ? `${sectionKey}_remove_${item}` : undefined}
            >
              <MdClose />
            </button>
          ) : null}
        </div>
      ))}
      {!showAll && hiddenCount > 0 && (
        <button type="button" className="more-link" onClick={() => setExpanded(true)}>
          {hiddenCount} more
        </button>
      )}
    </div>
  );
};
