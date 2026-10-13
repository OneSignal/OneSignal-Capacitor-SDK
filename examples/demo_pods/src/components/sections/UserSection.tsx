import { Capacitor } from '@capacitor/core';
import type { OneSignalUserProfile } from '@onesignal/capacitor-plugin';
import type { FC } from 'react';
import { useState } from 'react';

import ActionButton from '../ActionButton';
import LoginWithProfileModal from '../modals/LoginWithProfileModal';
import SingleInputModal from '../modals/SingleInputModal';
import SectionCard from '../SectionCard';

interface UserSectionProps {
  externalUserId: string | undefined;
  onLogin: (externalUserId: string) => Promise<void>;
  onLoginWithProfile: (
    externalUserId: string,
    profile: OneSignalUserProfile,
    jwt?: string,
  ) => Promise<void>;
  onLogout: () => Promise<void>;
}

const UserSection: FC<UserSectionProps> = ({
  externalUserId,
  onLogin,
  onLoginWithProfile,
  onLogout,
}) => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginWithProfileOpen, setLoginWithProfileOpen] = useState(false);
  const isLoggedIn = Boolean(externalUserId);

  const handleLogin = async (value: string) => {
    setLoginOpen(false);
    await onLogin(value);
  };

  const handleLoginWithProfile = async (
    value: string,
    profile: OneSignalUserProfile,
    jwt?: string,
  ) => {
    setLoginWithProfileOpen(false);
    await onLoginWithProfile(value, profile, jwt);
  };

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
            {externalUserId ?? '—'}
          </span>
        </div>
      </div>
      <ActionButton
        type="button"
        onClick={() => setLoginOpen(true)}
        data-testid="login_user_button"
      >
        {isLoggedIn ? 'SWITCH USER' : 'LOGIN USER'}
      </ActionButton>
      {Capacitor.getPlatform() === 'android' ? (
        <ActionButton
          variant="outline"
          type="button"
          onClick={() => setLoginWithProfileOpen(true)}
          data-testid="composite_login_button"
        >
          LOGIN WITH PROFILE
        </ActionButton>
      ) : null}
      {isLoggedIn ? (
        <ActionButton
          variant="outline"
          type="button"
          onClick={() => void onLogout()}
          data-testid="logout_user_button"
        >
          LOGOUT USER
        </ActionButton>
      ) : null}
      <SingleInputModal
        open={loginOpen}
        title="Login User"
        placeholder="External User Id"
        confirmLabel="Login"
        inputTestId="login_user_id_input"
        onClose={() => setLoginOpen(false)}
        onSubmit={handleLogin}
      />
      <LoginWithProfileModal
        open={loginWithProfileOpen}
        onClose={() => setLoginWithProfileOpen(false)}
        onSubmit={(value, profile, jwt) => void handleLoginWithProfile(value, profile, jwt)}
      />
    </SectionCard>
  );
};

export default UserSection;
