#!/bin/bash
set -euo pipefail

ORIGINAL_DIR=$(pwd)

# Build and pack the plugin
cd ../../
bun run build

rm -f onesignal-capacitor-plugin*.tgz
bun pm pack
mv onesignal-capacitor-plugin-*.tgz onesignal-capacitor-plugin.tgz

# Install the packed plugin in the demo app
cd "$ORIGINAL_DIR"

bun pm cache rm

bun remove onesignal-capacitor-plugin
bun add file:../../onesignal-capacitor-plugin.tgz

# Build the web app and sync native projects
npx vite build
npx cap sync

# Fix pod name casing (Capacitor derives "Onesignal" but podspec uses "OneSignal")
if [ -f ios/App/Podfile ]; then
  sed -i '' 's/OnesignalCapacitorPlugin/OneSignalCapacitorPlugin/g' ios/App/Podfile
  cd ios/App && pod install && cd ../..
fi
