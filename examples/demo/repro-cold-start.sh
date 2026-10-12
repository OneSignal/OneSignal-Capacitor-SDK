#!/bin/bash
# Cold-start notification tap repro (SDK-5461 / SDK-5498).
# Usage: ./repro-cold-start.sh [launch-url]   (needs exactly one booted simulator)
set -euo pipefail

BUNDLE_ID=com.onesignal.example
URL="${1:-https://onesignal.com}"
ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
PAYLOAD=$(mktemp -t os-repro).json

cat > "$PAYLOAD" <<JSON
{
  "Simulator Target Bundle": "$BUNDLE_ID",
  "aps": { "alert": { "title": "Cold start repro", "body": "Tap me ($ID)" } },
  "custom": { "i": "$ID", "u": "$URL" }
}
JSON

xcrun simctl terminate booted "$BUNDLE_ID" 2>/dev/null || true
sleep 1
xcrun simctl push booted "$BUNDLE_ID" "$PAYLOAD"

echo
echo "Tap the banner (or open Notification Center and tap it) within a few seconds."
echo "Streaming relevant logs, Ctrl+C to stop..."
echo
xcrun simctl spawn booted log stream --style compact \
  --predicate 'process == "App" AND (eventMessage CONTAINS "[Repro]" OR eventMessage CONTAINS "handleNotificationOpened" OR eventMessage CONTAINS "notification click")'
