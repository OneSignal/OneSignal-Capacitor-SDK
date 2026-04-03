import ActivityKit
import OneSignalLiveActivities
import SwiftUI
import WidgetKit

struct OneSignalWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DefaultLiveActivityAttributes.self) { context in
            VStack {
                Text(context.state.data["title"]?.asString() ?? "OneSignal Live Activity")
                    .font(.headline)
                Text(context.state.data["message"]?.asString() ?? "")
                    .font(.subheadline)
            }
            .padding()
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text(context.state.data["title"]?.asString() ?? "")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.data["message"]?.asString() ?? "")
                }
            } compactLeading: {
                Text("OS")
            } compactTrailing: {
                Text(context.state.data["message"]?.asString() ?? "")
            } minimal: {
                Text("OS")
            }
        }
    }
}
