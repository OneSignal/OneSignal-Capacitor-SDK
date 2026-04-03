import type { FC } from 'react';
import { useState } from 'react';

import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

const ORDER_STATUSES = [
  { status: 'preparing', message: 'Your order is being prepared', estimatedTime: '15 min' },
  { status: 'on_the_way', message: 'Driver is heading your way', estimatedTime: '10 min' },
  { status: 'delivered', message: 'Order delivered!', estimatedTime: '' },
];

interface LiveActivitySectionProps {
  onStart: (
    activityId: string,
    attributes: Record<string, unknown>,
    content: Record<string, unknown>,
  ) => void;
  onUpdate: (activityId: string, eventUpdates: Record<string, unknown>) => void | Promise<void>;
  onEnd: (activityId: string) => void | Promise<void>;
  onInfoTap?: () => void;
}

const LiveActivitySection: FC<LiveActivitySectionProps> = ({
  onStart,
  onUpdate,
  onEnd,
  onInfoTap,
}) => {
  const [activityId, setActivityId] = useState('order-1');
  const [orderNumber, setOrderNumber] = useState('ORD-1234');
  const [statusIndex, setStatusIndex] = useState(0);
  const [updating, setUpdating] = useState(false);

  const handleStart = () => {
    setStatusIndex(0);
    const first = ORDER_STATUSES[0];
    onStart(
      activityId,
      { orderNumber },
      {
        status: first.status,
        message: first.message,
        estimatedTime: first.estimatedTime,
      },
    );
  };

  const handleUpdate = async () => {
    const nextIndex = (statusIndex + 1) % ORDER_STATUSES.length;
    const next = ORDER_STATUSES[nextIndex];
    setUpdating(true);
    try {
      await onUpdate(activityId, {
        data: {
          status: next.status,
          message: next.message,
          estimatedTime: next.estimatedTime,
        },
      });
      setStatusIndex(nextIndex);
    } finally {
      setUpdating(false);
    }
  };

  const nextStatus = ORDER_STATUSES[(statusIndex + 1) % ORDER_STATUSES.length];

  return (
    <SectionCard title="LIVE ACTIVITIES" onInfoTap={onInfoTap}>
      <div className="card kv-card">
        <div className="kv-row">
          <span>Activity ID</span>
          <input
            value={activityId}
            onChange={(e) => setActivityId(e.target.value)}
            placeholder="Activity ID"
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            className="la-inline-input"
          />
        </div>
        <div className="divider" />
        <div className="kv-row">
          <span>Order #</span>
          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Order #"
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            className="la-inline-input"
          />
        </div>
      </div>
      <ActionButton type="button" disabled={!activityId.trim()} onClick={handleStart}>
        START LIVE ACTIVITY
      </ActionButton>
      <ActionButton type="button" disabled={!activityId.trim() || updating} onClick={handleUpdate}>
        {`UPDATE → ${nextStatus.status.replace('_', ' ').toUpperCase()}`}
      </ActionButton>
      <ActionButton
        variant="outline"
        type="button"
        disabled={!activityId.trim()}
        onClick={() => onEnd(activityId)}
      >
        END LIVE ACTIVITY
      </ActionButton>
    </SectionCard>
  );
};

export default LiveActivitySection;
