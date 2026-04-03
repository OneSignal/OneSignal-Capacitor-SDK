import type { FC } from 'react';
import { useState } from 'react';

import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

interface LiveActivitySectionProps {
  onEnter: (activityId: string, token: string) => void;
  onExit: (activityId: string) => void;
}

const LiveActivitySection: FC<LiveActivitySectionProps> = ({ onEnter, onExit }) => {
  const [activityId, setActivityId] = useState('');
  const [token, setToken] = useState('');

  return (
    <SectionCard title="LIVE ACTIVITIES (IOS)">
      <div className="card">
        <input
          className="outcome-input"
          value={activityId}
          onChange={(e) => setActivityId(e.target.value)}
          placeholder="Activity ID"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <input
          className="outcome-input"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Token"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          style={{ width: '100%', marginBottom: 0 }}
        />
      </div>
      <ActionButton
        type="button"
        onClick={() => {
          const id = activityId.trim();
          const t = token.trim();
          if (id && t) onEnter(id, t);
        }}
      >
        ENTER
      </ActionButton>
      <ActionButton
        variant="outline"
        type="button"
        onClick={() => {
          const id = activityId.trim();
          if (id) onExit(id);
        }}
      >
        EXIT
      </ActionButton>
    </SectionCard>
  );
};

export default LiveActivitySection;
