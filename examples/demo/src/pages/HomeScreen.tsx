import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { IonContent, IonPage } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import oneSignalLogo from '../assets/onesignal_logo.svg';
import ActionButton from '../components/ActionButton';
import TooltipModal from '../components/modals/TooltipModal';
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

const HomeScreen: React.FC = () => {
  const os = useOneSignal();

  const history = useHistory();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<TooltipData | null>(null);

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
      setTooltipOpen(true);
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
              onLogin={(value) => os.loginUser(value)}
              onLogout={() => os.logoutUser()}
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
              onSendCustomNotification={(title, body) => os.sendCustomNotification(title, body)}
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
              aliases={os.aliasesList}
              loading={os.isLoading}
              onInfoTap={() => showTooltipModal('aliases')}
              onAdd={(label, id) => os.addAlias(label, id)}
              onAddMultiple={(pairs) => os.addAliases(pairs)}
            />

            <EmailsSection
              emails={os.emailsList}
              loading={os.isLoading}
              onInfoTap={() => showTooltipModal('emails')}
              onAdd={(email) => os.addEmail(email)}
              onRemove={(email) => os.removeEmail(email)}
            />

            <SmsSection
              smsNumbers={os.smsNumbersList}
              loading={os.isLoading}
              onInfoTap={() => showTooltipModal('sms')}
              onAdd={(sms) => os.addSms(sms)}
              onRemove={(sms) => os.removeSms(sms)}
            />

            <TagsSection
              tags={os.tagsList}
              loading={os.isLoading}
              onInfoTap={() => showTooltipModal('tags')}
              onAdd={(key, value) => os.addTag(key, value)}
              onAddMultiple={(pairs) => os.addTags(pairs)}
              onRemoveSelected={(keys) => os.removeSelectedTags(keys)}
            />

            <OutcomesSection
              onInfoTap={() => showTooltipModal('outcomes')}
              onSendNormal={(name) => os.sendOutcome(name)}
              onSendUnique={(name) => os.sendUniqueOutcome(name)}
              onSendWithValue={(name, value) => os.sendOutcomeWithValue(name, value)}
            />

            <TriggersSection
              triggers={os.triggersList}
              onInfoTap={() => showTooltipModal('triggers')}
              onAdd={(key, value) => os.addTrigger(key, value)}
              onAddMultiple={(pairs) => os.addTriggers(pairs)}
              onRemoveSelected={(keys) => os.removeSelectedTriggers(keys)}
              onClearAll={() => os.clearTriggers()}
            />

            <CustomEventsSection
              onInfoTap={() => showTooltipModal('customEvents')}
              onTrackEvent={(name, properties) => os.trackEvent(name, properties)}
            />

            <LocationSection
              locationShared={os.locationShared}
              onInfoTap={() => showTooltipModal('location')}
              onToggleLocationShared={(checked) => void os.setLocationShared(checked)}
              onPromptLocation={() => os.requestLocationPermission()}
              onCheckLocationShared={() => os.checkLocationShared()}
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

        <TooltipModal
          open={tooltipOpen}
          tooltip={activeTooltip}
          onClose={() => setTooltipOpen(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default HomeScreen;
