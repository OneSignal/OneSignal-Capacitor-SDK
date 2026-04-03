import { Capacitor } from '@capacitor/core';
import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import oneSignalLogo from '../assets/onesignal_logo.svg';
import ActionButton from '../components/ActionButton';
import LoadingOverlay from '../components/LoadingOverlay';
import LogView from '../components/LogView';
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
import TrackEventSection from '../components/sections/TrackEventSection';
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
    setToastMessage(message);
    setToastOpen(true);
  };

  const runAction = (message: string, action: () => Promise<void>) => {
    action().then(() => showToast(message));
  };

  const closeDialog = () => {
    setDialog({ type: 'none' });
  };

  useEffect(() => {
    void TooltipHelper.getInstance().init();
  }, []);

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
          <LogView />

          <main className="content">
            <AppSection
              appId={os.appId}
              consentRequired={os.consentRequired}
              privacyConsentGiven={os.privacyConsentGiven}
              onToggleConsent={(checked) =>
                runAction(`Consent required: ${checked}`, () => os.setConsentRequired(checked))
              }
              onTogglePrivacyConsent={(checked) =>
                runAction(`Privacy consent: ${checked}`, () => os.setConsentGiven(checked))
              }
            />

            <UserSection
              externalUserId={os.externalUserId}
              onLogin={() => setDialog({ type: 'login' })}
              onLogout={() => runAction('Logged out', os.logoutUser)}
            />

            <PushSection
              pushSubscriptionId={os.pushSubscriptionId ?? null}
              isPushEnabled={os.isPushEnabled}
              hasNotificationPermission={os.hasNotificationPermission}
              onTogglePush={(checked) =>
                runAction(`Push ${checked ? 'enabled' : 'disabled'}`, async () =>
                  os.setPushEnabled(checked),
                )
              }
              onPromptPush={() => runAction('Push permission requested', os.promptPush)}
              onInfoTap={() => showTooltipModal('push')}
            />

            <SendPushSection
              onInfoTap={() => showTooltipModal('sendPushNotification')}
              onSendSimple={() =>
                runAction('Simple notification sent', () =>
                  os.sendNotification(NotificationType.Simple),
                )
              }
              onSendImage={() =>
                runAction('Image notification sent', () =>
                  os.sendNotification(NotificationType.WithImage),
                )
              }
              onSendSound={() =>
                runAction('Sound notification sent', () =>
                  os.sendNotification(NotificationType.WithSound),
                )
              }
              onSendCustom={() => setDialog({ type: 'customNotification' })}
              onClearAll={() =>
                runAction('All notifications cleared', async () => os.clearAllNotifications())
              }
            />

            <InAppSection
              inAppMessagesPaused={os.inAppMessagesPaused}
              onInfoTap={() => showTooltipModal('inAppMessaging')}
              onTogglePaused={(checked) =>
                runAction(checked ? 'In-app messages paused' : 'In-app messages resumed', () =>
                  os.setIamPaused(checked),
                )
              }
            />

            <SendIamSection
              onInfoTap={() => showTooltipModal('sendInAppMessage')}
              onSendTopBanner={() =>
                runAction('Sent IAM: top_banner', async () => os.sendIamTrigger('top_banner'))
              }
              onSendBottomBanner={() =>
                runAction('Sent IAM: bottom_banner', async () => os.sendIamTrigger('bottom_banner'))
              }
              onSendCenterModal={() =>
                runAction('Sent IAM: center_modal', async () => os.sendIamTrigger('center_modal'))
              }
              onSendFullScreen={() =>
                runAction('Sent IAM: full_screen', async () => os.sendIamTrigger('full_screen'))
              }
            />

            <AliasesSection
              aliasItems={aliasItems}
              onInfoTap={() => showTooltipModal('aliases')}
              onAddAlias={() => setDialog({ type: 'addAlias' })}
              onAddMultipleAliases={() => setDialog({ type: 'addMultipleAliases' })}
            />

            <EmailsSection
              emails={os.emailsList}
              onInfoTap={() => showTooltipModal('emails')}
              onAddEmail={() => setDialog({ type: 'addEmail' })}
              onRemoveEmail={(email) =>
                runAction(`Email removed: ${email}`, async () => os.removeEmail(email))
              }
            />

            <SmsSection
              smsNumbers={os.smsNumbersList}
              onInfoTap={() => showTooltipModal('sms')}
              onAddSms={() => setDialog({ type: 'addSms' })}
              onRemoveSms={(sms) => runAction(`SMS removed: ${sms}`, async () => os.removeSms(sms))}
            />

            <TagsSection
              tagItems={tagItems}
              onInfoTap={() => showTooltipModal('tags')}
              onRemoveTag={(key) =>
                runAction(`Tag removed: ${key}`, async () => os.removeSelectedTags([key]))
              }
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
              onRemoveTrigger={(key) =>
                runAction(`Trigger removed: ${key}`, async () => os.removeSelectedTriggers([key]))
              }
              onAddTrigger={() => setDialog({ type: 'addTrigger' })}
              onAddMultipleTriggers={() => setDialog({ type: 'addMultipleTriggers' })}
              onRemoveSelectedTriggers={() => setDialog({ type: 'removeSelectedTriggers' })}
              onClearTriggers={() =>
                runAction('All triggers cleared', async () => os.clearTriggers())
              }
            />

            <TrackEventSection
              onInfoTap={() => showTooltipModal('trackEvent')}
              onTrackEvent={() => setDialog({ type: 'trackEvent' })}
            />

            <LocationSection
              locationShared={os.locationShared}
              onInfoTap={() => showTooltipModal('location')}
              onToggleLocationShared={(checked) =>
                runAction(checked ? 'Location sharing enabled' : 'Location sharing disabled', () =>
                  os.setLocationShared(checked),
                )
              }
              onPromptLocation={() =>
                runAction('Location permission prompt shown', async () =>
                  os.requestLocationPermission(),
                )
              }
            />

            {Capacitor.getPlatform() === 'ios' && (
              <LiveActivitySection
                onStart={(activityId, attributes, content) =>
                  runAction(`Started live activity: ${activityId}`, async () =>
                    os.startDefaultLiveActivity(activityId, attributes, content),
                  )
                }
                onUpdate={async (activityId, eventUpdates) => {
                  await os.updateLiveActivity(activityId, eventUpdates);
                  showToast(`Updated live activity: ${activityId}`);
                }}
                onEnd={async (activityId) => {
                  await os.endLiveActivity(activityId);
                  showToast(`Ended live activity: ${activityId}`);
                }}
                hasApiKey={!!API_KEY}
              />
            )}

            <section className="section">
              <ActionButton type="button" onClick={() => history.push('/secondary')}>
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
          onClose={closeDialog}
          onSubmit={(value) =>
            runAction(`Logged in as ${value}`, async () => {
              await os.loginUser(value);
              closeDialog();
            })
          }
        />

        <PairInputModal
          open={dialog.type === 'addAlias'}
          title="Add Alias"
          firstPlaceholder="Label"
          secondPlaceholder="ID"
          confirmLabel="Add"
          onClose={closeDialog}
          onSubmit={(label, id) =>
            runAction(`Alias added: ${label}`, async () => {
              os.addAlias(label, id);
              closeDialog();
            })
          }
        />

        <SingleInputModal
          open={dialog.type === 'addEmail'}
          title="Add Email"
          placeholder="Email Address"
          confirmLabel="Add"
          onClose={closeDialog}
          onSubmit={(value) =>
            runAction(`Email added: ${value}`, async () => {
              os.addEmail(value);
              closeDialog();
            })
          }
        />

        <SingleInputModal
          open={dialog.type === 'addSms'}
          title="Add SMS"
          placeholder="Phone Number"
          confirmLabel="Add"
          onClose={closeDialog}
          onSubmit={(value) =>
            runAction(`SMS added: ${value}`, async () => {
              os.addSms(value);
              closeDialog();
            })
          }
        />

        <PairInputModal
          open={dialog.type === 'addTag'}
          title="Add Tag"
          firstPlaceholder="Key"
          secondPlaceholder="Value"
          confirmLabel="Add"
          onClose={closeDialog}
          onSubmit={(key, value) =>
            runAction(`Tag added: ${key}`, async () => {
              os.addTag(key, value);
              closeDialog();
            })
          }
        />

        <PairInputModal
          open={dialog.type === 'addTrigger'}
          title="Add Trigger"
          firstPlaceholder="Key"
          secondPlaceholder="Value"
          confirmLabel="Add"
          onClose={closeDialog}
          onSubmit={(key, value) =>
            runAction(`Trigger added: ${key}`, async () => {
              os.addTrigger(key, value);
              closeDialog();
            })
          }
        />

        <MultiPairInputModal
          open={dialog.type === 'addMultipleAliases'}
          title="Add Multiple Aliases"
          firstPlaceholder="Label"
          secondPlaceholder="ID"
          onClose={closeDialog}
          onSubmit={(pairs) =>
            runAction(`${Object.keys(pairs).length} alias(es) added`, async () => {
              os.addAliases(pairs);
              closeDialog();
            })
          }
        />

        <MultiPairInputModal
          open={dialog.type === 'addMultipleTriggers'}
          title="Add Multiple Triggers"
          firstPlaceholder="Key"
          secondPlaceholder="Value"
          onClose={closeDialog}
          onSubmit={(pairs) =>
            runAction(`${Object.keys(pairs).length} trigger(s) added`, async () => {
              os.addTriggers(pairs);
              closeDialog();
            })
          }
        />

        <MultiPairInputModal
          open={dialog.type === 'addMultipleTags'}
          title="Add Multiple Tags"
          firstPlaceholder="Key"
          secondPlaceholder="Value"
          onClose={closeDialog}
          onSubmit={(pairs) =>
            runAction(`${Object.keys(pairs).length} tag(s) added`, async () => {
              os.addTags(pairs);
              closeDialog();
            })
          }
        />

        <MultiSelectRemoveModal
          open={dialog.type === 'removeSelectedTags'}
          title="Remove Tags"
          items={os.tagsList}
          onClose={closeDialog}
          onSubmit={(keys) =>
            runAction(`${keys.length} tag(s) removed`, async () => {
              os.removeSelectedTags(keys);
              closeDialog();
            })
          }
        />

        <MultiSelectRemoveModal
          open={dialog.type === 'removeSelectedTriggers'}
          title="Remove Triggers"
          items={os.triggersList}
          onClose={closeDialog}
          onSubmit={(keys) =>
            runAction(`${keys.length} trigger(s) removed`, async () => {
              os.removeSelectedTriggers(keys);
              closeDialog();
            })
          }
        />

        <OutcomeModal
          open={dialog.type === 'sendOutcome'}
          onClose={closeDialog}
          onSubmit={(name, mode, value) => {
            if (mode === 'unique') {
              runAction(`Unique outcome sent: ${name}`, async () => {
                os.sendUniqueOutcome(name);
                closeDialog();
              });
              return;
            }
            if (mode === 'value' && value !== null) {
              runAction(`Outcome with value sent: ${name}`, async () => {
                os.sendOutcomeWithValue(name, value);
                closeDialog();
              });
              return;
            }
            runAction(`Outcome sent: ${name}`, async () => {
              os.sendOutcome(name);
              closeDialog();
            });
          }}
        />

        <TrackEventModal
          open={dialog.type === 'trackEvent'}
          onClose={closeDialog}
          onSubmit={(name, properties) =>
            runAction(`Event tracked: ${name}`, async () => {
              os.trackEvent(name, properties);
              closeDialog();
            })
          }
        />

        <CustomNotificationModal
          open={dialog.type === 'customNotification'}
          onClose={closeDialog}
          onSubmit={(title, body) =>
            runAction(`Notification sent: ${title}`, async () => {
              await os.sendCustomNotification(title, body);
              closeDialog();
            })
          }
        />

        <IonToast
          isOpen={toastOpen}
          message={toastMessage}
          duration={1600}
          onDidDismiss={() => setToastOpen(false)}
        />
        <TooltipModal
          open={tooltipVisible}
          tooltip={activeTooltip}
          onClose={() => setTooltipVisible(false)}
        />
        <LoadingOverlay visible={os.isLoading} />
      </IonContent>
    </IonPage>
  );
};

export default HomeScreen;
