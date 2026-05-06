#import "OSCapacitorLaunchOptions.h"
#import <UIKit/UIKit.h>
#import <UserNotifications/UserNotifications.h>
#import <objc/runtime.h>

@implementation OSCapacitorLaunchOptions

static NSDictionary *_capturedLaunchOptions = nil;
static UNNotificationResponse *_capturedColdStartResponse = nil;

+ (void)load {
    [[NSNotificationCenter defaultCenter]
        addObserver:self
           selector:@selector(applicationDidFinishLaunching:)
               name:UIApplicationDidFinishLaunchingNotification
             object:nil];
}

+ (void)applicationDidFinishLaunching:(NSNotification *)notification {
    _capturedLaunchOptions = notification.userInfo;

    [[NSNotificationCenter defaultCenter]
        removeObserver:self
                  name:UIApplicationDidFinishLaunchingNotification
                object:nil];

    // Wrap the UN delegate's didReceiveNotificationResponse so we can hold on
    // to the UNNotificationResponse iOS hands us on cold start. The OneSignal
    // iOS SDK drops cold-start responses inside processNotificationResponse:
    // when no appId is set yet, which is always true on cold start because the
    // JS layer has not called OneSignal.initialize yet. The plugin replays the
    // captured response after initialize() so the SDK can fire its click
    // listeners normally.
    id unDelegate = [UNUserNotificationCenter currentNotificationCenter].delegate;
    if (!unDelegate) return;

    SEL didReceiveSel = NSSelectorFromString(@"userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:");
    Method original = class_getInstanceMethod([unDelegate class], didReceiveSel);
    if (!original) return;

    __block IMP originalIMP = method_getImplementation(original);
    IMP newIMP = imp_implementationWithBlock(^(id self_, UNUserNotificationCenter *center, UNNotificationResponse *response, void (^completionHandler)(void)) {
        _capturedColdStartResponse = response;
        ((void(*)(id, SEL, UNUserNotificationCenter*, UNNotificationResponse*, void(^)(void)))originalIMP)(self_, didReceiveSel, center, response, completionHandler);
    });
    method_setImplementation(original, newIMP);
}

+ (NSDictionary *)launchOptions {
    return _capturedLaunchOptions;
}

+ (UNNotificationResponse *)pendingColdStartResponse {
    return _capturedColdStartResponse;
}

+ (void)consumeColdStartResponse {
    _capturedColdStartResponse = nil;
}

@end
