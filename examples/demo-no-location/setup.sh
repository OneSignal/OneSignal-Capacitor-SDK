#!/usr/bin/env bash
set -euo pipefail

DEMO_DIR=$(cd "$(dirname "$0")" && pwd)
SDK_ROOT=$(cd "$DEMO_DIR/../.." && pwd)
export ONESIGNAL_DISABLE_LOCATION=true

info() { echo -e "\033[0;32m[demo-no-location]\033[0m $*"; }

info "Packing local Capacitor plugin..."
(cd "$SDK_ROOT" && bun run build)
(cd "$SDK_ROOT" && rm -f onesignal-capacitor-plugin*.tgz && bun pm pack --filename onesignal-capacitor-plugin.tgz >/dev/null)

info "Installing demo dependencies..."
(cd "$DEMO_DIR" && bun update @onesignal/capacitor-plugin && bun install)

info "Building web bundle..."
(cd "$DEMO_DIR" && vp build)

if [[ ! -d "$DEMO_DIR/android" ]]; then
  info "Adding Android platform..."
  (cd "$DEMO_DIR" && vpx cap add android)
fi

if [[ ! -d "$DEMO_DIR/ios" ]]; then
  info "Adding iOS platform..."
  (cd "$DEMO_DIR" && vpx cap add ios)
fi

info "Syncing Capacitor with ONESIGNAL_DISABLE_LOCATION=${ONESIGNAL_DISABLE_LOCATION:-}"
(cd "$DEMO_DIR" && vpx cap sync)
