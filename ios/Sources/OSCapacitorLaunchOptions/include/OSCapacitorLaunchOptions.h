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

/// The UNNotificationResponse delivered by iOS on cold start, if any.
/// Returns nil for warm starts or once the response has been consumed.
@property (class, readonly, nullable) UNNotificationResponse *pendingColdStartResponse;

/// Mark the captured cold-start response as consumed so it is not replayed
/// twice. Call after handing the response off to the OneSignal iOS SDK.
+ (void)consumeColdStartResponse;

@end

NS_ASSUME_NONNULL_END
