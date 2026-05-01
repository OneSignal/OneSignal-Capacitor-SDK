import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import oneSignalLogo from '../assets/onesignal_logo.svg';
import ActionButton from '../components/ActionButton';
import CustomNotificationModal from '../components/modals/CustomNotificationModal';
import MultiPairInputModal from '../components/modals/MultiPairInputModal';
import MultiSelectRemoveModal from '../components/modals/MultiSelectRemoveModal';
import OutcomeModal from '../components/modals/OutcomeModal';
import PairInputModal from '../components/modals/PairInputModal';
import SingleInputModal from '../components/modals/SingleInputModal';
import TooltipModal from '../components/modals/TooltipModal';
import TrackEventModal from '../components/modals/TrackEventModal';
import AliasesSection from '../components/sections/AliasesSection';
import AppSection from '../components/sections/AppSection';
import CustomEventsSection from '../components/sections/CustomEventsSection';
import EmailsSection from '../components/sections/EmailsSection';
import InAppSection from '../components/sections/InAppSection';
import LiveActivitySection from '../components/sections/LiveActivitySection';
import LocationSection from '../components/sections/LocationSection';
import OutcomesSection from '../components/sections/OutcomesSection';
import PushSection from '../components/sections/PushSection';
import SendIamSection from '../components/sections/SendIamSection';
import SendPushSection from '../components/sections/SendPushSection';
import SmsSection from '../components/sections/SmsSection';
import TagsSection from '../components/sections/TagsSection';
import TriggersSection from '../components/sections/TriggersSection';
import UserSection from '../components/sections/UserSection';
import { useOneSignal } from '../hooks/useOneSignal';
import { NotificationType } from '../models/NotificationType';
import { API_KEY } from '../services/OneSignalApiService';
import type { TooltipData } from '../services/TooltipHelper';
import TooltipHelper from '../services/TooltipHelper';

import './HomeScreen.css';

type DialogState =
  | { type: 'none' }
  | { type: 'login' }
  | { type: 'addAlias' }
  | { type: 'addMultipleAliases' }
  | { type: 'addTrigger' }
  | { type: 'addMultipleTriggers' }
  | { type: 'addEmail' }
  | { type: 'addSms' }
  | { type: 'addTag' }
  | { type: 'addMultipleTags' }
  | { type: 'removeSelectedTags' }
  | { type: 'removeSelectedTriggers' }
  | { type: 'sendOutcome' }
  | { type: 'trackEvent' }
  | { type: 'customNotification' };

const HomeScreen: React.FC = () => {
  const os = useOneSignal();

  const history = useHistory();
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' });
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<TooltipData | null>(null);

  const aliasItems = useMemo(
    () =>
      os.aliasesList
        .filter(([label]) => label !== 'external_id' && label !== 'onesignal_id')
        .map(([label, id]) => ({ key: label, value: id })),
    [os.aliasesList],
  );
  const tagItems = useMemo(
    () => os.tagsList.map(([key, value]) => ({ key, value })),
    [os.tagsList],
  );
  const triggerItems = useMemo(
    () => os.triggersList.map(([key, value]) => ({ key, value })),
    [os.triggersList],
  );

  const showToast = (message: string) => {
    setToastOpen(false);
    setTimeout(() => {
      setToastMessage(message);
      setToastOpen(true);
    }, 0);
  };

  const closeDialog = () => {
    setDialog({ type: 'none' });
  };

  useEffect(() => {
    void TooltipHelper.getInstance().init();
  }, []);

  useEffect(() => {
    if (!os.isReady) return;
    // Hide the splash before prompting so the Android 13+ permission
    // dialog never races the splash screen.
    void (async () => {
      try {
        await SplashScreen.hide();
      } catch {
        // Ignore: web/non-native platforms don't have a splash to hide.
      }
      await os.promptPush();
    })();
  }, [os.isReady, os.promptPush]);

  const showTooltipModal = (key: string): void => {
    const tooltip = TooltipHelper.getInstance().getTooltip(key);
    if (tooltip) {
      setActiveTooltip(tooltip);
      setTooltipVisible(true);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="demo-app">
          <header className="brand-header">
            <div className="brand-title">
              <img className="brand-logo" src={oneSignalLogo} alt="OneSignal" />
              <span className="brand-subtitle">Capacitor</span>
            </div>
          </header>

          <main className="content" data-testid="main_scroll_view">
            <AppSection
              appId={os.appId}
              consentRequired={os.consentRequired}
              privacyConsentGiven={os.privacyConsentGiven}
              onToggleConsent={(checked) => void os.setConsentRequired(checked)}
              onTogglePrivacyConsent={(checked) => void os.setConsentGiven(checked)}
            />

            <UserSection
              externalUserId={os.externalUserId}
              onLogin={() => setDialog({ type: 'login' })}
              onLogout={async () => {
                await os.logoutUser();
                showToast('User logged out');
              }}
            />

            <PushSection
              pushSubscriptionId={os.pushSubscriptionId ?? null}
              isPushEnabled={os.isPushEnabled}
              hasNotificationPermission={os.hasNotificationPermission}
              onTogglePush={(checked) => os.setPushEnabled(checked)}
              onPromptPush={() => void os.promptPush()}
              onInfoTap={() => showTooltipModal('push')}
            />

            <SendPushSection
              onInfoTap={() => showTooltipModal('sendPushNotification')}
              onSendSimple={() => void os.sendNotification(NotificationType.Simple)}
              onSendImage={() => void os.sendNotification(NotificationType.WithImage)}
              onSendSound={() => void os.sendNotification(NotificationType.WithSound)}
              onSendCustom={() => setDialog({ type: 'customNotification' })}
              onClearAll={() => os.clearAllNotifications()}
            />

            <InAppSection
              inAppMessagesPaused={os.inAppMessagesPaused}
              onInfoTap={() => showTooltipModal('inAppMessaging')}
              onTogglePaused={(checked) => void os.setIamPaused(checked)}
            />

            <SendIamSection
              onInfoTap={() => showTooltipModal('sendInAppMessage')}
              onSendTopBanner={() => os.sendIamTrigger('top_banner')}
              onSendBottomBanner={() => os.sendIamTrigger('bottom_banner')}
              onSendCenterModal={() => os.sendIamTrigger('center_modal')}
              onSendFullScreen={() => os.sendIamTrigger('full_screen')}
            />

            <AliasesSection
              aliasItems={aliasItems}
              loading={os.isLoading}
              onInfoTap={() => showTooltipModal('aliases')}
              onAddAlias={() => setDialog({ type: 'addAlias' })}
              onAddMultipleAliases={() => setDialog({ type: 'addMultipleAliases' })}
            />

            <EmailsSection
              emails={os.emailsList}
              loading={os.isLoading}
              onInfoTap={() => showTooltipModal('emails')}
              onAddEmail={() => setDialog({ type: 'addEmail' })}
              onRemoveEmail={(email) => os.removeEmail(email)}
            />

            <SmsSection
              smsNumbers={os.smsNumbersList}
              loading={os.isLoading}
              onInfoTap={() => showTooltipModal('sms')}
              onAddSms={() => setDialog({ type: 'addSms' })}
              onRemoveSms={(sms) => os.removeSms(sms)}
            />

            <TagsSection
              tagItems={tagItems}
              loading={os.isLoading}
              onInfoTap={() => showTooltipModal('tags')}
              onRemoveTag={(key) => os.removeSelectedTags([key])}
              onAddTag={() => setDialog({ type: 'addTag' })}
              onAddMultipleTags={() => setDialog({ type: 'addMultipleTags' })}
              onRemoveSelectedTags={() => setDialog({ type: 'removeSelectedTags' })}
            />

            <OutcomesSection
              onInfoTap={() => showTooltipModal('outcomes')}
              onSendOutcome={() => setDialog({ type: 'sendOutcome' })}
            />

            <TriggersSection
              triggerItems={triggerItems}
              onInfoTap={() => showTooltipModal('triggers')}
              onRemoveTrigger={(key) => os.removeSelectedTriggers([key])}
              onAddTrigger={() => setDialog({ type: 'addTrigger' })}
              onAddMultipleTriggers={() => setDialog({ type: 'addMultipleTriggers' })}
              onRemoveSelectedTriggers={() => setDialog({ type: 'removeSelectedTriggers' })}
              onClearTriggers={() => os.clearTriggers()}
            />

            <CustomEventsSection
              onInfoTap={() => showTooltipModal('customEvents')}
              onTrackEvent={() => setDialog({ type: 'trackEvent' })}
            />

            <LocationSection
              locationShared={os.locationShared}
              onInfoTap={() => showTooltipModal('location')}
              onToggleLocationShared={(checked) => void os.setLocationShared(checked)}
              onPromptLocation={() => os.requestLocationPermission()}
              onCheckLocationShared={async () => {
                const shared = await os.checkLocationShared();
                showToast(`Location shared: ${shared}`);
              }}
            />

            {Capacitor.getPlatform() === 'ios' && (
              <LiveActivitySection
                onStart={(activityId, attributes, content) =>
                  os.startDefaultLiveActivity(activityId, attributes, content)
                }
                onUpdate={(activityId, eventUpdates) =>
                  void os.updateLiveActivity(activityId, eventUpdates)
                }
                onEnd={(activityId) => void os.endLiveActivity(activityId)}
                hasApiKey={!!API_KEY}
                onInfoTap={() => showTooltipModal('liveActivities')}
              />
            )}

            <section className="section">
              <ActionButton
                type="button"
                onClick={() => history.push('/secondary')}
                data-testid="next_screen_button"
              >
                NEXT SCREEN
              </ActionButton>
            </section>
          </main>
        </div>

        <SingleInputModal
          open={dialog.type === 'login'}
          title="Login User"
          placeholder="External User Id"
          confirmLabel="Login"
          inputTestId="login_user_id_input"
          onClose={closeDialog}
          onSubmit={async (value) => {
            closeDialog();
            await os.loginUser(value);
            showToast(`Logged in as ${value}`);
          }}
        />

        <PairInputModal
          open={dialog.type === 'addAlias'}
          title="Add Alias"
          keyPlaceholder="Label"
          valuePlaceholder="ID"
          confirmLabel="Add"
          keyTestID="alias_label_input"
          valueTestID="alias_id_input"
          onClose={closeDialog}
          onSubmit={(label, id) => {
            os.addAlias(label, id);
            closeDialog();
          }}
        />

        <SingleInputModal
          open={dialog.type === 'addEmail'}
          title="Add Email"
          placeholder="Email Address"
          confirmLabel="Add"
          inputTestId="email_input"
          onClose={closeDialog}
          onSubmit={(value) => {
            os.addEmail(value);
            closeDialog();
          }}
        />

        <SingleInputModal
          open={dialog.type === 'addSms'}
          title="Add SMS"
          placeholder="Phone Number"
          confirmLabel="Add"
          inputTestId="sms_input"
          onClose={closeDialog}
          onSubmit={(value) => {
            os.addSms(value);
            closeDialog();
          }}
        />

        <PairInputModal
          open={dialog.type === 'addTag'}
          title="Add Tag"
          keyPlaceholder="Key"
          valuePlaceholder="Value"
          confirmLabel="Add"
          keyTestID="tag_key_input"
          valueTestID="tag_value_input"
          onClose={closeDialog}
          onSubmit={(key, value) => {
            os.addTag(key, value);
            closeDialog();
          }}
        />

        <PairInputModal
          open={dialog.type === 'addTrigger'}
          title="Add Trigger"
          keyPlaceholder="Key"
          valuePlaceholder="Value"
          confirmLabel="Add"
          keyTestID="trigger_key_input"
          valueTestID="trigger_value_input"
          onClose={closeDialog}
          onSubmit={(key, value) => {
            os.addTrigger(key, value);
            closeDialog();
          }}
        />

        <MultiPairInputModal
          open={dialog.type === 'addMultipleAliases'}
          title="Add Multiple Aliases"
          keyPlaceholder="Label"
          valuePlaceholder="ID"
          onClose={closeDialog}
          onSubmit={(pairs) => {
            os.addAliases(pairs);
            closeDialog();
          }}
        />

        <MultiPairInputModal
          open={dialog.type === 'addMultipleTriggers'}
          title="Add Multiple Triggers"
          keyPlaceholder="Key"
          valuePlaceholder="Value"
          onClose={closeDialog}
          onSubmit={(pairs) => {
            os.addTriggers(pairs);
            closeDialog();
          }}
        />

        <MultiPairInputModal
          open={dialog.type === 'addMultipleTags'}
          title="Add Multiple Tags"
          keyPlaceholder="Key"
          valuePlaceholder="Value"
          onClose={closeDialog}
          onSubmit={(pairs) => {
            os.addTags(pairs);
            closeDialog();
          }}
        />

        <MultiSelectRemoveModal
          open={dialog.type === 'removeSelectedTags'}
          title="Remove Tags"
          items={os.tagsList}
          onClose={closeDialog}
          onSubmit={(keys) => {
            os.removeSelectedTags(keys);
            closeDialog();
          }}
        />

        <MultiSelectRemoveModal
          open={dialog.type === 'removeSelectedTriggers'}
          title="Remove Triggers"
          items={os.triggersList}
          onClose={closeDialog}
          onSubmit={(keys) => {
            os.removeSelectedTriggers(keys);
            closeDialog();
          }}
        />

        <OutcomeModal
          open={dialog.type === 'sendOutcome'}
          onClose={closeDialog}
          onSubmit={(name, mode, value) => {
            if (mode === 'unique') {
              os.sendUniqueOutcome(name);
              showToast(`Unique outcome sent: ${name}`);
            } else if (mode === 'value' && value !== null) {
              os.sendOutcomeWithValue(name, value);
              showToast(`Outcome sent: ${name} = ${value}`);
            } else {
              os.sendOutcome(name);
              showToast(`Outcome sent: ${name}`);
            }
            closeDialog();
          }}
        />

        <TrackEventModal
          open={dialog.type === 'trackEvent'}
          onClose={closeDialog}
          onSubmit={(name, properties) => {
            os.trackEvent(name, properties);
            showToast(`Event tracked: ${name}`);
            closeDialog();
          }}
        />

        <CustomNotificationModal
          open={dialog.type === 'customNotification'}
          onClose={closeDialog}
          onSubmit={async (title, body) => {
            await os.sendCustomNotification(title, body);
            closeDialog();
          }}
        />

        <IonToast
          isOpen={toastOpen}
          message={toastMessage}
          duration={1600}
          onDidDismiss={() => setToastOpen(false)}
          data-testid="snackbar_toast"
        />
        <TooltipModal
          open={tooltipVisible}
          tooltip={activeTooltip}
          onClose={() => setTooltipVisible(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default HomeScreen;
