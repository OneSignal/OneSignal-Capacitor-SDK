import OneSignal, { LogLevel } from '@onesignal/capacitor-plugin';

// Replace with your OneSignal App ID before running on a device.
const ONESIGNAL_APP_ID = '00000000-0000-0000-0000-000000000000';

const logEl = document.getElementById('log');

function log(message: string): void {
  const stamp = new Date().toISOString().slice(11, 19);
  if (logEl) {
    logEl.textContent = `[${stamp}] ${message}\n${logEl.textContent ?? ''}`;
  }
  console.log(`[demo-cap7] ${message}`);
}

let initialized = false;

function initialize(): void {
  if (initialized) {
    log('Already initialized.');
    return;
  }
  OneSignal.Debug.setLogLevel(LogLevel.Verbose);
  OneSignal.initialize(ONESIGNAL_APP_ID);
  initialized = true;
  log(`OneSignal initialized with app id ${ONESIGNAL_APP_ID}`);
}

async function requestPermission(): Promise<void> {
  if (!initialized) {
    log('Call initialize first.');
    return;
  }
  try {
    const accepted = await OneSignal.Notifications.requestPermission(true);
    log(`Permission accepted: ${String(accepted)}`);
  } catch (err) {
    log(`requestPermission error: ${String(err)}`);
  }
}

async function showSubscriptionInfo(): Promise<void> {
  if (!initialized) {
    log('Call initialize first.');
    return;
  }
  try {
    const [onesignalId, subscriptionId, optedIn, hasPerm] = await Promise.all([
      OneSignal.User.getOnesignalId(),
      OneSignal.User.pushSubscription.getIdAsync(),
      OneSignal.User.pushSubscription.getOptedInAsync(),
      OneSignal.Notifications.hasPermission(),
    ]);
    log(
      [
        `OneSignal user id:    ${onesignalId ?? '(none)'}`,
        `Push subscription id: ${subscriptionId ?? '(none)'}`,
        `Opted in:             ${String(optedIn)}`,
        `Has permission:       ${String(hasPerm)}`,
        '',
        'Send a test push to the subscription id above',
        'from the OneSignal dashboard to see it appear.',
      ].join('\n'),
    );
  } catch (err) {
    log(`showSubscriptionInfo error: ${String(err)}`);
  }
}

document.getElementById('init')?.addEventListener('click', initialize);
document.getElementById('requestPermission')?.addEventListener('click', requestPermission);
document.getElementById('testNotification')?.addEventListener('click', showSubscriptionInfo);

log('Ready. Tap "Initialize OneSignal" to start.');
