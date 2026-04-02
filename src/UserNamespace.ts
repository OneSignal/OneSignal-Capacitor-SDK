import type { OneSignalCapacitorPlugin } from './definitions';
import { isObjectSerializable, removeListener } from './helpers';
import PushSubscription from './PushSubscriptionNamespace';

export interface UserState {
  onesignalId?: string;
  externalId?: string;
}

export interface UserChangedState {
  current: UserState;
}

export default class User {
  pushSubscription: PushSubscription;

  private _plugin: OneSignalCapacitorPlugin;
  private _userStateObserverList: ((event: UserChangedState) => void)[] = [];

  constructor(plugin: OneSignalCapacitorPlugin) {
    this._plugin = plugin;
    this.pushSubscription = new PushSubscription(plugin);
  }

  private _processFunctionList(
    array: ((event: UserChangedState) => void)[],
    param: UserChangedState,
  ): void {
    for (let i = 0; i < array.length; i++) {
      array[i](param);
    }
  }

  /**
   * Explicitly set a 2-character language code for the user.
   * @param  {string} language
   * @returns void
   */
  setLanguage(language: string): void {
    void this._plugin.setLanguage({ language });
  }

  /**
   * Set an alias for the current user. If this alias label already exists on this user, it will be overwritten with the new alias id.
   * @param  {string} label
   * @param  {string} id
   * @returns void
   */
  addAlias(label: string, id: string): void {
    void this._plugin.addAliases({ aliases: { [label]: id } });
  }

  /**
   * Set aliases for the current user. If any alias already exists, it will be overwritten to the new values.
   * @param {object} aliases
   * @returns void
   */
  addAliases(aliases: Record<string, string>): void {
    void this._plugin.addAliases({ aliases });
  }

  /**
   * Remove an alias from the current user.
   * @param  {string} label
   * @returns void
   */
  removeAlias(label: string): void {
    void this._plugin.removeAliases({ labels: [label] });
  }

  /**
   * Remove aliases from the current user.
   * @param  {string[]} labels
   * @returns void
   */
  removeAliases(labels: string[]): void {
    void this._plugin.removeAliases({ labels });
  }

  /**
   * Add a new email subscription to the current user.
   * @param  {string} email
   * @returns void
   */
  addEmail(email: string): void {
    void this._plugin.addEmail({ email });
  }

  /**
   * Remove an email subscription from the current user.
   * @param {string} email
   * @returns void
   */
  removeEmail(email: string): void {
    void this._plugin.removeEmail({ email });
  }

  /**
   * Add a new SMS subscription to the current user.
   * @param  {string} smsNumber
   * @returns void
   */
  addSms(smsNumber: string): void {
    void this._plugin.addSms({ smsNumber });
  }

  /**
   * Remove an SMS subscription from the current user.
   * @param {string} smsNumber
   * @returns void
   */
  removeSms(smsNumber: string): void {
    void this._plugin.removeSms({ smsNumber });
  }

  /**
   * Add a tag for the current user. Tags are key:value string pairs used as building blocks for targeting specific users and/or personalizing messages.
   * @param  {string} key
   * @param  {string} value
   * @returns void
   */
  addTag(key: string, value: string): void {
    void this._plugin.addTags({ tags: { [key]: value } });
  }

  /**
   * Add multiple tags for the current user. Tags are key:value string pairs used as building blocks for targeting specific users and/or personalizing messages.
   * @param  {object} tags
   * @returns void
   */
  addTags(tags: object): void {
    const convertedTags = tags as { [key: string]: unknown };
    Object.keys(tags).forEach(function (key) {
      if (typeof convertedTags[key] !== 'string') {
        convertedTags[key] = JSON.stringify(convertedTags[key]);
      }
    });
    void this._plugin.addTags({
      tags: convertedTags as Record<string, string>,
    });
  }

  /**
   * Remove the data tag with the provided key from the current user.
   * @param  {string} key
   * @returns void
   */
  removeTag(key: string): void {
    void this._plugin.removeTags({ keys: [key] });
  }

  /**
   * Remove multiple tags with the provided keys from the current user.
   * @param  {string[]} keys
   * @returns void
   */
  removeTags(keys: string[]): void {
    void this._plugin.removeTags({ keys });
  }

  /**
   * Returns the local tags for the current user.
   * @returns Promise<{ [key: string]: string }>
   */
  async getTags(): Promise<{ [key: string]: string }> {
    const result = await this._plugin.getTags();
    return result.tags;
  }

  /**
   * Add a callback that fires when the OneSignal User state changes.
   * @param  {(event: UserChangedState)=>void} listener
   * @returns void
   */
  addEventListener(
    _event: 'change',
    listener: (event: UserChangedState) => void,
  ) {
    this._userStateObserverList.push(listener);
    void this._plugin.addListener(
      'userStateChange',
      (state: UserChangedState) => {
        this._processFunctionList(this._userStateObserverList, state);
      },
    );
  }

  /**
   * Remove a User State observer that has been previously added.
   * @param  {(event: UserChangedState)=>void} listener
   * @returns void
   */
  removeEventListener(
    _event: 'change',
    listener: (event: UserChangedState) => void,
  ) {
    removeListener(this._userStateObserverList, listener);
  }

  /**
   * Get the nullable OneSignal Id associated with the current user.
   * @returns {Promise<string | null>}
   */
  async getOnesignalId(): Promise<string | null> {
    const result = await this._plugin.getOnesignalId();
    return result.onesignalId;
  }

  /**
   * Get the nullable External Id associated with the current user.
   * @returns {Promise<string | null>}
   */
  async getExternalId(): Promise<string | null> {
    const result = await this._plugin.getExternalId();
    return result.externalId;
  }

  /**
   * Track a custom event with the provided name and optional properties.
   * @param  {string} name - The name of the custom event
   * @param  {object} [properties] - Optional properties to associate with the event
   * @returns void
   */
  trackEvent(name: string, properties?: object): void {
    if (properties !== undefined && !isObjectSerializable(properties)) {
      console.error('Properties must be a JSON-serializable object');
      return;
    }
    void this._plugin.trackEvent({
      name,
      properties: properties as Record<string, unknown> | undefined,
    });
  }
}
