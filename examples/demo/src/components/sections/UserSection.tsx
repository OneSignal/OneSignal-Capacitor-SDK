import type { FC } from 'react';

import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

interface UserSectionProps {
  externalUserId: string | undefined;
  onLogin: () => void;
  onLogout: () => void;
}

const UserSection: FC<UserSectionProps> = ({ externalUserId, onLogin, onLogout }) => {
  const isLoggedIn = Boolean(externalUserId);

  return (
    <SectionCard title="USER" sectionKey="user">
      <div className="card kv-card">
        <div className="kv-row">
          <span>Status</span>
          <span className={isLoggedIn ? 'text-success' : undefined} data-testid="user_status_value">
            {isLoggedIn ? 'Logged In' : 'Anonymous'}
          </span>
        </div>
        <div className="divider" />
        <div className="kv-row">
          <span>External ID</span>
          <span className="id-value" data-testid="user_external_id_value">
            {externalUserId ?? '–'}
          </span>
        </div>
      </div>
      <ActionButton type="button" onClick={onLogin} data-testid="login_user_button">
        {isLoggedIn ? 'SWITCH USER' : 'LOGIN USER'}
      </ActionButton>
      {isLoggedIn ? (
        <ActionButton
          variant="outline"
          type="button"
          onClick={onLogout}
          data-testid="logout_user_button"
        >
          LOGOUT USER
        </ActionButton>
      ) : null}
    </SectionCard>
  );
};

export default UserSection;
