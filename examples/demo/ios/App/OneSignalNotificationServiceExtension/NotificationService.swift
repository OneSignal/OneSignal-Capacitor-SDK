// FILE: OneSignalNotificationServiceExtension/NotificationService.swift
// PURPOSE: Enables rich notifications (images) and confirmed delivery analytics
// REQUIREMENT: This extension must share an App Group with the main app target (configured in next steps)
// WHEN IT RUNS: iOS calls this extension when a push has "mutable-content": true
//               (automatically set when you include images or action buttons)

import UserNotifications
import OneSignalExtension

class NotificationService: UNNotificationServiceExtension {
    
    // Callback to deliver the modified notification to iOS
    var contentHandler: ((UNNotificationContent) -> Void)?
    
    // The original push request from APNs
    var receivedRequest: UNNotificationRequest!
    
    // A mutable copy of the notification we can modify (add images, etc.)
    var bestAttemptContent: UNMutableNotificationContent?

    // Called when a push notification arrives with mutable-content: true
    // You have ~30 seconds to modify the notification before iOS displays it
    override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
        self.receivedRequest = request
        self.contentHandler = contentHandler
        self.bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)

        if let bestAttemptContent = bestAttemptContent {
            // DEBUGGING: Uncomment to verify NSE is running
            // bestAttemptContent.body = "[Modified] " + bestAttemptContent.body

            // OneSignal processes the notification:
            // - Downloads and attaches images
            // - Reports confirmed delivery to dashboard
            // - Handles action buttons
            OneSignalExtension.didReceiveNotificationExtensionRequest(self.receivedRequest, with: bestAttemptContent, withContentHandler: self.contentHandler)
        }
    }

    // Called if didReceive() takes too long (~30 seconds)
    // Delivers whatever content we have so the notification isn't lost
    override func serviceExtensionTimeWillExpire() {
        if let contentHandler = contentHandler, let bestAttemptContent = bestAttemptContent {
            OneSignalExtension.serviceExtensionTimeWillExpireRequest(self.receivedRequest, with: self.bestAttemptContent)
            contentHandler(bestAttemptContent)
        }
    }
}
