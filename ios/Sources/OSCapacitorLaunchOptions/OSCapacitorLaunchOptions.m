#import "OSCapacitorLaunchOptions.h"
#import <UIKit/UIKit.h>
#import <UserNotifications/UserNotifications.h>
#import <objc/runtime.h>

@implementation OSCapacitorLaunchOptions

static NSDictionary *_capturedLaunchOptions = nil;
static NSMutableArray<UNNotificationResponse *> *_capturedColdStartResponses = nil;
// Flips to YES once drainColdStartResponses runs (i.e. after the JS layer has
// called OneSignal.initialize). The hook stays installed for the process
// lifetime, so without this flag every later tap would be retained forever.
// Once drained, taps fall straight through to the OneSignal iOS SDK.
static BOOL _coldStartResponsesDrained = NO;

+ (void)load {
    _capturedColdStartResponses = [NSMutableArray array];
    [[NSNotificationCenter defaultCenter]
        addObserver:self
           selector:@selector(applicationDidFinishLaunching:)
               name:UIApplicationDidFinishLaunchingNotification
             object:nil];
    [self hookProcessNotificationResponse];
}

+ (void)applicationDidFinishLaunching:(NSNotification *)notification {
    _capturedLaunchOptions = notification.userInfo;

    [[NSNotificationCenter defaultCenter]
        removeObserver:self
                  name:UIApplicationDidFinishLaunchingNotification
                object:nil];
}

// The OneSignal iOS SDK drops UNNotificationResponses inside
// +[OSNotificationsManager processNotificationResponse:] when no appId is set
// yet, which is always true on cold start because the JS layer has not called
// OneSignal.initialize yet. Every tap reaches that method: the SDK's swizzle
// re-hooks whichever UNUserNotificationCenter delegate is current (including
// one installed after launch, like Capacitor's NotificationRouter in the
// scene-based template), and apps with swizzling disabled forward to it
// manually. Hooking it here, rather than a specific delegate class, captures
// cold-start taps regardless of who owns the delegate. The plugin replays the
// captured responses after initialize() so the SDK fires its click listeners.
+ (void)hookProcessNotificationResponse {
    Class managerClass = NSClassFromString(@"OSNotificationsManager");
    SEL processSel = NSSelectorFromString(@"processNotificationResponse:");
    Method original = managerClass ? class_getClassMethod(managerClass, processSel) : NULL;
    if (!original) {
        NSLog(@"[OneSignal] Capacitor: OSNotificationsManager.processNotificationResponse: not found; cold-start notification taps will not be replayed.");
        return;
    }

    __block IMP originalIMP = method_getImplementation(original);
    IMP newIMP = imp_implementationWithBlock(^(id self_, UNNotificationResponse *response) {
        @synchronized (_capturedColdStartResponses) {
            if (!_coldStartResponsesDrained) {
                [_capturedColdStartResponses addObject:response];
            }
        }
        ((void(*)(id, SEL, UNNotificationResponse *))originalIMP)(self_, processSel, response);
    });
    method_setImplementation(original, newIMP);
}

+ (NSDictionary *)launchOptions {
    return _capturedLaunchOptions;
}

+ (NSArray<UNNotificationResponse *> *)drainColdStartResponses {
    @synchronized (_capturedColdStartResponses) {
        _coldStartResponsesDrained = YES;
        NSArray<UNNotificationResponse *> *responses = [_capturedColdStartResponses copy];
        [_capturedColdStartResponses removeAllObjects];
        return responses;
    }
}

@end
