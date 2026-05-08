#import <Foundation/Foundation.h>
#import <UserNotifications/UserNotifications.h>

NS_ASSUME_NONNULL_BEGIN

/// Captures cold-start state from iOS that the OneSignal SDK would otherwise
/// drop because its JS-driven initialize() runs too late.
///
/// This class subscribes to UIApplicationDidFinishLaunchingNotification from
/// +load (executed by dyld at process start, before main()) so:
///   * launchOptions are captured before any other code can lose them, and
///   * the UNUserNotificationCenter delegate's
///     didReceiveNotificationResponse: is wrapped so we can hold on to the
///     UNNotificationResponse for a cold-start tap. The OneSignal iOS SDK
///     drops it inside processNotificationResponse: when no appId is set
///     yet (OSNotificationsManager.m). We replay it after the JS layer
///     finishes calling OneSignal.initialize.
@interface OSCapacitorLaunchOptions : NSObject

@property (class, readonly, nullable) NSDictionary *launchOptions;

/// UNNotificationResponses delivered by iOS while the JS layer was still
/// booting (i.e. before OneSignal.initialize ran and we drained the queue).
/// Empty for warm starts and after consumeColdStartResponses has been called.
/// Multiple entries are possible: the user can tap a second notification from
/// the shade while the JS bundle is still loading, especially in dev builds.
@property (class, readonly, nonnull) NSArray<UNNotificationResponse *> *pendingColdStartResponses;

/// Mark the captured cold-start responses as consumed so they are not replayed
/// twice. Call after handing each response off to the OneSignal iOS SDK.
+ (void)consumeColdStartResponses;

@end

NS_ASSUME_NONNULL_END
