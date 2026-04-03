package com.onesignal.capacitor

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.onesignal.OneSignal
import com.onesignal.common.OneSignalWrapper
import com.onesignal.inAppMessages.IInAppMessageClickEvent
import com.onesignal.inAppMessages.IInAppMessageClickListener
import com.onesignal.inAppMessages.IInAppMessageDidDismissEvent
import com.onesignal.inAppMessages.IInAppMessageDidDisplayEvent
import com.onesignal.inAppMessages.IInAppMessageLifecycleListener
import com.onesignal.inAppMessages.IInAppMessageWillDismissEvent
import com.onesignal.inAppMessages.IInAppMessageWillDisplayEvent
import com.onesignal.notifications.INotificationClickEvent
import com.onesignal.notifications.INotificationClickListener
import com.onesignal.notifications.INotificationLifecycleListener
import com.onesignal.notifications.INotificationWillDisplayEvent
import com.onesignal.notifications.IPermissionObserver
import com.onesignal.user.state.IUserStateObserver
import com.onesignal.user.state.UserChangedState
import com.onesignal.user.subscriptions.IPushSubscriptionObserver
import com.onesignal.user.subscriptions.PushSubscriptionChangedState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject

@CapacitorPlugin(name = "OneSignalCapacitor")
class OneSignalCapacitorPlugin : Plugin(),
    INotificationLifecycleListener,
    INotificationClickListener,
    IInAppMessageLifecycleListener,
    IInAppMessageClickListener {

    private val notificationWillDisplayCache = mutableMapOf<String, INotificationWillDisplayEvent>()
    private val preventDefaultCache = mutableSetOf<String>()
    private var pendingClickEvent: INotificationClickEvent? = null

    // region Core

    @PluginMethod
    fun initialize(call: PluginCall) {
        val appId = call.getString("appId")
        if (appId == null) {
            call.reject("appId is required")
            return
        }

        OneSignalWrapper.sdkType = "capacitor"
        OneSignalWrapper.sdkVersion = "010000"
        OneSignal.initWithContext(context, appId)

        OneSignal.Notifications.addPermissionObserver(object : IPermissionObserver {
            override fun onNotificationPermissionChange(permission: Boolean) {
                val ret = JSObject()
                ret.put("permission", permission)
                notifyListeners("permissionChange", ret)
            }
        })

        OneSignal.Notifications.addForegroundLifecycleListener(this)
        OneSignal.Notifications.addClickListener(this)

        OneSignal.User.pushSubscription.addObserver(object : IPushSubscriptionObserver {
            override fun onPushSubscriptionChange(state: PushSubscriptionChangedState) {
                val ret = JSObject()
                val prev = JSObject()
                prev.put("id", state.previous.id.ifEmpty { JSONObject.NULL })
                prev.put("token", state.previous.token.ifEmpty { JSONObject.NULL })
                prev.put("optedIn", state.previous.optedIn)
                ret.put("previous", prev)

                val curr = JSObject()
                curr.put("id", state.current.id.ifEmpty { JSONObject.NULL })
                curr.put("token", state.current.token.ifEmpty { JSONObject.NULL })
                curr.put("optedIn", state.current.optedIn)
                ret.put("current", curr)

                notifyListeners("pushSubscriptionChange", ret)
            }
        })

        OneSignal.User.addObserver(object : IUserStateObserver {
            override fun onUserStateChange(state: UserChangedState) {
                val ret = JSObject()
                val curr = JSObject()
                curr.put("onesignalId", state.current.onesignalId.ifEmpty { JSONObject.NULL })
                curr.put("externalId", state.current.externalId.ifEmpty { JSONObject.NULL })
                ret.put("current", curr)
                notifyListeners("userStateChange", ret)
            }
        })

        OneSignal.InAppMessages.addLifecycleListener(this)
        OneSignal.InAppMessages.addClickListener(this)

        pendingClickEvent?.let { event ->
            val ret = JSObject()
            val clickResult = JSObject()
            clickResult.put("actionId", event.result.actionId)
            clickResult.put("url", event.result.url)
            ret.put("result", clickResult)
            ret.put("notification", JSObject(event.notification.rawPayload))
            notifyListeners("notificationClick", ret)
            pendingClickEvent = null
        }

        call.resolve()
    }

    @PluginMethod
    fun login(call: PluginCall) {
        val externalId = call.getString("externalId")
        if (externalId == null) {
            call.reject("externalId is required")
            return
        }
        OneSignal.login(externalId)
        call.resolve()
    }

    @PluginMethod
    fun logout(call: PluginCall) {
        OneSignal.logout()
        call.resolve()
    }

    @PluginMethod
    fun setConsentRequired(call: PluginCall) {
        val required = call.getBoolean("required") ?: false
        OneSignal.consentRequired = required
        call.resolve()
    }

    @PluginMethod
    fun setConsentGiven(call: PluginCall) {
        val granted = call.getBoolean("granted") ?: false
        OneSignal.consentGiven = granted
        call.resolve()
    }

    // endregion

    // region Debug

    @PluginMethod
    fun setLogLevel(call: PluginCall) {
        val level = call.getInt("logLevel") ?: 0
        OneSignal.Debug.logLevel = com.onesignal.debug.LogLevel.fromInt(level)
        call.resolve()
    }

    @PluginMethod
    fun setAlertLevel(call: PluginCall) {
        val level = call.getInt("logLevel") ?: 0
        OneSignal.Debug.alertLevel = com.onesignal.debug.LogLevel.fromInt(level)
        call.resolve()
    }

    // endregion

    // region User

    @PluginMethod
    fun setLanguage(call: PluginCall) {
        val language = call.getString("language")
        if (language == null) {
            call.reject("language is required")
            return
        }
        OneSignal.User.setLanguage(language)
        call.resolve()
    }

    @PluginMethod
    fun addAliases(call: PluginCall) {
        val aliasesObj = call.getObject("aliases") ?: run {
            call.reject("aliases is required")
            return
        }
        val aliases = mutableMapOf<String, String>()
        aliasesObj.keys().forEach { key -> aliasesObj.getString(key)?.let { aliases[key] = it } }
        OneSignal.User.addAliases(aliases)
        call.resolve()
    }

    @PluginMethod
    fun removeAliases(call: PluginCall) {
        val labels = call.getArray("labels") ?: run {
            call.reject("labels is required")
            return
        }
        val list = mutableListOf<String>()
        for (i in 0 until labels.length()) {
            list.add(labels.getString(i))
        }
        OneSignal.User.removeAliases(list)
        call.resolve()
    }

    @PluginMethod
    fun addEmail(call: PluginCall) {
        val email = call.getString("email")
        if (email == null) {
            call.reject("email is required")
            return
        }
        OneSignal.User.addEmail(email)
        call.resolve()
    }

    @PluginMethod
    fun removeEmail(call: PluginCall) {
        val email = call.getString("email")
        if (email == null) {
            call.reject("email is required")
            return
        }
        OneSignal.User.removeEmail(email)
        call.resolve()
    }

    @PluginMethod
    fun addSms(call: PluginCall) {
        val smsNumber = call.getString("smsNumber")
        if (smsNumber == null) {
            call.reject("smsNumber is required")
            return
        }
        OneSignal.User.addSms(smsNumber)
        call.resolve()
    }

    @PluginMethod
    fun removeSms(call: PluginCall) {
        val smsNumber = call.getString("smsNumber")
        if (smsNumber == null) {
            call.reject("smsNumber is required")
            return
        }
        OneSignal.User.removeSms(smsNumber)
        call.resolve()
    }

    @PluginMethod
    fun addTags(call: PluginCall) {
        val tagsObj = call.getObject("tags") ?: run {
            call.reject("tags is required")
            return
        }
        val tags = mutableMapOf<String, String>()
        tagsObj.keys().forEach { key -> tagsObj.getString(key)?.let { tags[key] = it } }
        OneSignal.User.addTags(tags)
        call.resolve()
    }

    @PluginMethod
    fun removeTags(call: PluginCall) {
        val keysArr = call.getArray("keys") ?: run {
            call.reject("keys is required")
            return
        }
        val keys = mutableListOf<String>()
        for (i in 0 until keysArr.length()) {
            keys.add(keysArr.getString(i))
        }
        OneSignal.User.removeTags(keys)
        call.resolve()
    }

    @PluginMethod
    fun getTags(call: PluginCall) {
        val tags = OneSignal.User.getTags()
        val tagsObj = JSObject()
        tags.forEach { (key, value) -> tagsObj.put(key, value) }
        val ret = JSObject()
        ret.put("tags", tagsObj)
        call.resolve(ret)
    }

    @PluginMethod
    fun getOnesignalId(call: PluginCall) {
        val ret = JSObject()
        ret.put("onesignalId", OneSignal.User.onesignalId.ifEmpty { JSONObject.NULL })
        call.resolve(ret)
    }

    @PluginMethod
    fun getExternalId(call: PluginCall) {
        val ret = JSObject()
        ret.put("externalId", OneSignal.User.externalId.ifEmpty { JSONObject.NULL })
        call.resolve(ret)
    }

    @PluginMethod
    fun trackEvent(call: PluginCall) {
        val name = call.getString("name")
        if (name == null) {
            call.reject("name is required")
            return
        }
        val propertiesObj = call.getObject("properties")
        val properties = if (propertiesObj != null) {
            val map = mutableMapOf<String, Any>()
            propertiesObj.keys().forEach { key ->
                map[key] = propertiesObj.get(key)
            }
            map
        } else null

        OneSignal.User.trackEvent(name, properties)
        call.resolve()
    }

    // endregion

    // region Push Subscription

    @PluginMethod
    fun getPushSubscriptionId(call: PluginCall) {
        val ret = JSObject()
        ret.put("id", OneSignal.User.pushSubscription.id)
        call.resolve(ret)
    }

    @PluginMethod
    fun getPushSubscriptionToken(call: PluginCall) {
        val ret = JSObject()
        ret.put("token", OneSignal.User.pushSubscription.token)
        call.resolve(ret)
    }

    @PluginMethod
    fun getPushSubscriptionOptedIn(call: PluginCall) {
        val ret = JSObject()
        ret.put("optedIn", OneSignal.User.pushSubscription.optedIn)
        call.resolve(ret)
    }

    @PluginMethod
    fun optInPushSubscription(call: PluginCall) {
        OneSignal.User.pushSubscription.optIn()
        call.resolve()
    }

    @PluginMethod
    fun optOutPushSubscription(call: PluginCall) {
        OneSignal.User.pushSubscription.optOut()
        call.resolve()
    }

    // endregion

    // region Notifications

    @PluginMethod
    fun getPermission(call: PluginCall) {
        val ret = JSObject()
        ret.put("permission", OneSignal.Notifications.permission)
        call.resolve(ret)
    }

    @PluginMethod
    fun permissionNative(call: PluginCall) {
        val ret = JSObject()
        ret.put("permission", if (OneSignal.Notifications.permission) 2 else 1)
        call.resolve(ret)
    }

    @PluginMethod
    fun requestPermission(call: PluginCall) {
        val fallback = call.getBoolean("fallbackToSettings") ?: false
        CoroutineScope(Dispatchers.Main).launch {
            val accepted = OneSignal.Notifications.requestPermission(fallback)
            val ret = JSObject()
            ret.put("permission", accepted)
            call.resolve(ret)
        }
    }

    @PluginMethod
    fun canRequestPermission(call: PluginCall) {
        val ret = JSObject()
        ret.put("canRequest", OneSignal.Notifications.canRequestPermission)
        call.resolve(ret)
    }

    @PluginMethod
    fun registerForProvisionalAuthorization(call: PluginCall) {
        val ret = JSObject()
        ret.put("accepted", true)
        call.resolve(ret)
    }

    @PluginMethod
    fun clearAllNotifications(call: PluginCall) {
        OneSignal.Notifications.clearAllNotifications()
        call.resolve()
    }

    @PluginMethod
    fun removeNotification(call: PluginCall) {
        val id = call.getInt("id") ?: run {
            call.reject("id is required")
            return
        }
        OneSignal.Notifications.removeNotification(id)
        call.resolve()
    }

    @PluginMethod
    fun removeGroupedNotifications(call: PluginCall) {
        val id = call.getString("id")
        if (id == null) {
            call.reject("id is required")
            return
        }
        OneSignal.Notifications.removeGroupedNotifications(id)
        call.resolve()
    }

    @PluginMethod
    fun preventDefault(call: PluginCall) {
        val notificationId = call.getString("notificationId")
        if (notificationId == null) {
            call.reject("notificationId is required")
            return
        }
        val event = notificationWillDisplayCache[notificationId]
        if (event == null) {
            call.reject("Could not find notification will display event")
            return
        }
        event.preventDefault()
        preventDefaultCache.add(notificationId)
        call.resolve()
    }

    @PluginMethod
    fun proceedWithWillDisplay(call: PluginCall) {
        val notificationId = call.getString("notificationId")
        if (notificationId == null) {
            call.reject("notificationId is required")
            return
        }
        val event = notificationWillDisplayCache[notificationId]
        if (event == null) {
            call.reject("Could not find notification will display event")
            return
        }
        if (!preventDefaultCache.contains(notificationId)) {
            event.notification.display()
        }
        call.resolve()
    }

    @PluginMethod
    fun displayNotification(call: PluginCall) {
        val notificationId = call.getString("notificationId")
        if (notificationId == null) {
            call.reject("notificationId is required")
            return
        }
        val event = notificationWillDisplayCache[notificationId]
        if (event == null) {
            call.reject("Could not find notification will display event")
            return
        }
        event.notification.display()
        call.resolve()
    }

    // endregion

    // region In-App Messages

    @PluginMethod
    fun addTriggers(call: PluginCall) {
        val triggersObj = call.getObject("triggers") ?: run {
            call.reject("triggers is required")
            return
        }
        val triggers = mutableMapOf<String, String>()
        triggersObj.keys().forEach { key -> triggersObj.getString(key)?.let { triggers[key] = it } }
        OneSignal.InAppMessages.addTriggers(triggers)
        call.resolve()
    }

    @PluginMethod
    fun removeTriggers(call: PluginCall) {
        val keysArr = call.getArray("keys") ?: run {
            call.reject("keys is required")
            return
        }
        val keys = mutableListOf<String>()
        for (i in 0 until keysArr.length()) {
            keys.add(keysArr.getString(i))
        }
        OneSignal.InAppMessages.removeTriggers(keys)
        call.resolve()
    }

    @PluginMethod
    fun clearTriggers(call: PluginCall) {
        OneSignal.InAppMessages.clearTriggers()
        call.resolve()
    }

    @PluginMethod
    fun setPaused(call: PluginCall) {
        val pause = call.getBoolean("pause") ?: false
        OneSignal.InAppMessages.paused = pause
        call.resolve()
    }

    @PluginMethod
    fun isPaused(call: PluginCall) {
        val ret = JSObject()
        ret.put("paused", OneSignal.InAppMessages.paused)
        call.resolve(ret)
    }

    // endregion

    // region Session / Outcomes

    @PluginMethod
    fun addOutcome(call: PluginCall) {
        val name = call.getString("name")
        if (name == null) {
            call.reject("name is required")
            return
        }
        OneSignal.Session.addOutcome(name)
        call.resolve()
    }

    @PluginMethod
    fun addUniqueOutcome(call: PluginCall) {
        val name = call.getString("name")
        if (name == null) {
            call.reject("name is required")
            return
        }
        OneSignal.Session.addUniqueOutcome(name)
        call.resolve()
    }

    @PluginMethod
    fun addOutcomeWithValue(call: PluginCall) {
        val name = call.getString("name")
        if (name == null) {
            call.reject("name is required")
            return
        }
        val value = call.getFloat("value") ?: 0f
        OneSignal.Session.addOutcomeWithValue(name, value)
        call.resolve()
    }

    // endregion

    // region Location

    @PluginMethod
    fun requestLocationPermission(call: PluginCall) {
        CoroutineScope(Dispatchers.Main).launch {
            OneSignal.Location.requestPermission()
            call.resolve()
        }
    }

    @PluginMethod
    fun setLocationShared(call: PluginCall) {
        val shared = call.getBoolean("shared") ?: false
        OneSignal.Location.isShared = shared
        call.resolve()
    }

    @PluginMethod
    fun isLocationShared(call: PluginCall) {
        val ret = JSObject()
        ret.put("shared", OneSignal.Location.isShared)
        call.resolve(ret)
    }

    // endregion

    // region Live Activities (no-op on Android)

    @PluginMethod
    fun enterLiveActivity(call: PluginCall) {
        call.resolve()
    }

    @PluginMethod
    fun exitLiveActivity(call: PluginCall) {
        call.resolve()
    }

    @PluginMethod
    fun setPushToStartToken(call: PluginCall) {
        call.resolve()
    }

    @PluginMethod
    fun removePushToStartToken(call: PluginCall) {
        call.resolve()
    }

    @PluginMethod
    fun setupDefaultLiveActivity(call: PluginCall) {
        call.resolve()
    }

    @PluginMethod
    fun startDefaultLiveActivity(call: PluginCall) {
        call.resolve()
    }

    // endregion

    // region Observer Callbacks

    override fun onWillDisplay(event: INotificationWillDisplayEvent) {
        val notificationId = event.notification.notificationId ?: return
        notificationWillDisplayCache[notificationId] = event
        event.preventDefault()
        val ret = JSObject(event.notification.rawPayload)
        notifyListeners("notificationForegroundWillDisplay", ret)
    }

    override fun onClick(event: INotificationClickEvent) {
        if (bridge != null) {
            val ret = JSObject()
            val clickResult = JSObject()
            clickResult.put("actionId", event.result.actionId)
            clickResult.put("url", event.result.url)
            ret.put("result", clickResult)
            ret.put("notification", JSObject(event.notification.rawPayload))
            notifyListeners("notificationClick", ret)
        } else {
            pendingClickEvent = event
        }
    }

    override fun onWillDisplay(event: IInAppMessageWillDisplayEvent) {
        val ret = JSObject()
        ret.put("message", JSObject().put("messageId", event.message.messageId))
        notifyListeners("inAppMessageWillDisplay", ret)
    }

    override fun onDidDisplay(event: IInAppMessageDidDisplayEvent) {
        val ret = JSObject()
        ret.put("message", JSObject().put("messageId", event.message.messageId))
        notifyListeners("inAppMessageDidDisplay", ret)
    }

    override fun onWillDismiss(event: IInAppMessageWillDismissEvent) {
        val ret = JSObject()
        ret.put("message", JSObject().put("messageId", event.message.messageId))
        notifyListeners("inAppMessageWillDismiss", ret)
    }

    override fun onDidDismiss(event: IInAppMessageDidDismissEvent) {
        val ret = JSObject()
        ret.put("message", JSObject().put("messageId", event.message.messageId))
        notifyListeners("inAppMessageDidDismiss", ret)
    }

    override fun onClick(event: IInAppMessageClickEvent) {
        val urlTarget = event.result.urlTarget?.toString() ?: "browser"

        val clickResult = JSObject()
        clickResult.put("closingMessage", event.result.closingMessage)
        clickResult.put("actionId", event.result.actionId)
        clickResult.put("url", event.result.url)
        clickResult.put("urlTarget", urlTarget)

        val ret = JSObject()
        ret.put("message", JSObject().put("messageId", event.message.messageId))
        ret.put("result", clickResult)
        notifyListeners("inAppMessageClick", ret)
    }

    // endregion
}
