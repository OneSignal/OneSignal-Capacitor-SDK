import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.onesignal.example',
  appName: 'OneSignal Cap7 Demo',
  webDir: 'dist/browser',
  loggingBehavior: 'debug',
  ios: {
    // Disable Capacitor's UNUserNotificationCenterDelegate swizzling so the
    // OneSignal iOS SDK can install its own foreground delegate. Without this,
    // pushes arriving while the app is foregrounded are silently suppressed
    // (token registration still succeeds, which is why the device shows up
    // on the OneSignal dashboard regardless).
    handleApplicationNotifications: false,
  },
};

export default config;
