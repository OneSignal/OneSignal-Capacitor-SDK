import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CapacitorHttp } from '@capacitor/core';
import OneSignal, { LogLevel } from '@onesignal/capacitor-plugin';

const ONESIGNAL_APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>OneSignal Capacitor 7 Demo</h1>
    <p class="subtitle">Hello-world for verifying the OneSignal plugin on Capacitor 7.</p>

    <button type="button" (click)="initialize()">1. Initialize OneSignal</button>
    <button type="button" [disabled]="!initialized()" (click)="requestPermission()">
      2. Request Notification Permission
    </button>
    <button type="button" [disabled]="!initialized()" (click)="showSubscriptionInfo()">
      3. Show OneSignal ID (send a test push to it)
    </button>
    <button type="button" [disabled]="!initialized() || sending()" (click)="sendTestNotification()">
      4. Send Test Notification
    </button>

    <pre>{{ logText() }}</pre>
  `,
})
export class AppComponent {
  protected readonly initialized = signal(false);
  protected readonly sending = signal(false);
  protected readonly logText = signal('Ready. Tap "Initialize OneSignal" to start.');

  protected initialize(): void {
    if (this.initialized()) {
      this.log('Already initialized.');
      return;
    }
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    void OneSignal.initialize(ONESIGNAL_APP_ID);

    OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
      const n = event.getNotification();
      this.log(`foregroundWillDisplay: ${n.title ?? '(no title)'}`);
    });

    this.initialized.set(true);
    this.log(`OneSignal initialized with app id ${ONESIGNAL_APP_ID}`);
  }

  protected async requestPermission(): Promise<void> {
    try {
      const accepted = await OneSignal.Notifications.requestPermission(true);
      this.log(`Permission accepted: ${String(accepted)}`);
    } catch (err) {
      this.log(`requestPermission error: ${String(err)}`);
    }
  }

  protected async showSubscriptionInfo(): Promise<void> {
    try {
      const [onesignalId, subscriptionId, optedIn, hasPerm] = await Promise.all([
        OneSignal.User.getOnesignalId(),
        OneSignal.User.pushSubscription.getIdAsync(),
        OneSignal.User.pushSubscription.getOptedInAsync(),
        OneSignal.Notifications.hasPermission(),
      ]);
      this.log(
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
      this.log(`showSubscriptionInfo error: ${String(err)}`);
    }
  }

  protected async sendTestNotification(): Promise<void> {
    this.sending.set(true);
    try {
      const subscriptionId = await OneSignal.User.pushSubscription.getIdAsync();
      if (!subscriptionId) {
        this.log('No push subscription id yet. Grant permission first.');
        return;
      }

      const response = await CapacitorHttp.post({
        url: 'https://onesignal.com/api/v1/notifications',
        headers: {
          Accept: 'application/vnd.onesignal.v1+json',
          'Content-Type': 'application/json',
        },
        data: {
          app_id: ONESIGNAL_APP_ID,
          include_subscription_ids: [subscriptionId],
          headings: { en: 'Simple Notification' },
          contents: { en: 'This is a simple push notification' },
        },
      });

      if (response.status < 200 || response.status >= 300) {
        this.log(`Send failed (${response.status}): ${JSON.stringify(response.data)}`);
        return;
      }

      this.log(`Sent. response: ${JSON.stringify(response.data)}`);
    } catch (err) {
      this.log(`sendTestNotification error: ${String(err)}`);
    } finally {
      this.sending.set(false);
    }
  }

  private log(message: string): void {
    const stamp = new Date().toISOString().slice(11, 19);
    this.logText.update((prev) => `[${stamp}] ${message}\n${prev}`);
    console.log(`[demo-cap7] ${message}`);
  }
}
