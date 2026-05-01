import type { OneSignalAPI } from './api';
import Debug from './DebugNamespace';
import type { OneSignalCapacitorPlugin } from './definitions';
import InAppMessages from './InAppMessagesNamespace';
import LiveActivities from './LiveActivitiesNamespace';
import Location from './LocationNamespace';
import { _setNotificationEventPlugin } from './NotificationReceivedEvent';
import Notifications from './NotificationsNamespace';
import { _setOSNotificationPlugin } from './OSNotification';
import Session from './SessionNamespace';
import User from './UserNamespace';

export class OneSignalPlugin implements OneSignalAPI {
  User: User;
  Debug: Debug;
  Session: Session;
  Location: Location;
  InAppMessages: InAppMessages;
  Notifications: Notifications;
  LiveActivities: LiveActivities;

  private _plugin: OneSignalCapacitorPlugin;
  private _appID = '';

  constructor(plugin: OneSignalCapacitorPlugin) {
    this._plugin = plugin;
    _setOSNotificationPlugin(plugin);
    _setNotificationEventPlugin(plugin);

    this.User = new User(plugin);
    this.Debug = new Debug(plugin);
    this.Session = new Session(plugin);
    this.Location = new Location(plugin);
    this.InAppMessages = new InAppMessages(plugin);
    this.Notifications = new Notifications(plugin);
    this.LiveActivities = new LiveActivities(plugin);
  }

  /**
   * Initializes the OneSignal SDK. This should be called during startup of the application.
   * @param  {string} appId
   * @returns Promise<void>
   */
  initialize(appId: string): Promise<void> {
    this._appID = appId;

    return this._plugin.initialize({ appId: this._appID });
  }

  /**
   * Login to OneSignal under the user identified by the [externalId] provided. The act of logging a user into the OneSignal SDK will switch the [user] context to that specific user.
   * @param  {string} externalId
   * @returns Promise<void>
   */
  login(externalId: string): Promise<void> {
    return this._plugin.login({ externalId });
  }

  /**
   * Logout the user previously logged in via [login]. The [user] property now references a new device-scoped user.
   * @returns Promise<void>
   */
  logout(): Promise<void> {
    return this._plugin.logout();
  }

  /**
   * Determines whether a user must consent to privacy prior to their user data being sent up to OneSignal. This should be set to true prior to the invocation of initialization to ensure compliance.
   * @param  {boolean} required
   * @returns void
   */
  setConsentRequired(required: boolean): void {
    void this._plugin.setConsentRequired({ required });
  }

  /**
   * Indicates whether privacy consent has been granted. This field is only relevant when the application has opted into data privacy protections.
   * @param  {boolean} granted
   * @returns void
   */
  setConsentGiven(granted: boolean): void {
    void this._plugin.setConsentGiven({ granted });
  }
}
