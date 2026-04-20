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
bun run build
bunx cap sync
