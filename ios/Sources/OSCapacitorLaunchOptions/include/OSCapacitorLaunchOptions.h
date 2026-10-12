#import <Foundation/Foundation.h>
#import <UserNotifications/UserNotifications.h>

NS_ASSUME_NONNULL_BEGIN

/// Captures cold-start state from iOS that the OneSignal SDK would otherwise
/// drop because its JS-driven initialize() runs too late.
///
/// From +load (executed by dyld before main()) this class:
///   * subscribes to UIApplicationDidFinishLaunchingNotification so
///     launchOptions are captured before any other code can lose them, and
///   * hooks +[OSNotificationsManager processNotificationResponse:] so it can
///     hold on to the UNNotificationResponse for a cold-start tap. The OneSignal
///     iOS SDK drops it there when no appId is set yet. We replay it after the
///     JS layer finishes calling OneSignal.initialize.
@interface OSCapacitorLaunchOptions : NSObject

@property (class, readonly, nullable) NSDictionary *launchOptions;

/// Returns the UNNotificationResponses delivered by iOS while the JS layer was
/// still booting, and stops capturing new ones. Multiple entries are possible:
/// the user can tap a second notification from the shade while the JS bundle
/// is still loading. Call once, after OneSignal.initialize has set the appId.
+ (NSArray<UNNotificationResponse *> *)drainColdStartResponses;

@end

NS_ASSUME_NONNULL_END
