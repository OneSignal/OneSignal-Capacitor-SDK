import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.onesignal.example',
  appName: 'OneSignal No Location',
  webDir: 'dist',
  loggingBehavior: 'debug',
  ios: {
    handleApplicationNotifications: false,
    webContentsDebuggingEnabled: true,
  },
};

export default config;
