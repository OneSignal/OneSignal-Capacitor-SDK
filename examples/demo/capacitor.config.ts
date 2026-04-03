import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.onesignal.example',
  appName: 'OneSignal Demo',
  webDir: 'dist',
  ios: {
    handleApplicationNotifications: false,
  },
};

export default config;
