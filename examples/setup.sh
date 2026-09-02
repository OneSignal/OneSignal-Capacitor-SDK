#!/usr/bin/env bash
set -euo pipefail

# Run from inside any examples/<demo> directory.
ORIGINAL_DIR=$(pwd)
SDK_ROOT=$(cd "$ORIGINAL_DIR/../.." && pwd)

info() { echo -e "\033[0;32m[setup]\033[0m $*"; }

# ── Plugin tarball cache ─────────────────────────────────────────────────────
# The packed archive is shared, but each demo tracks which archive it installed.
INSTALLED_STAMP="$ORIGINAL_DIR/.capacitor-sdk-installed.stamp"
INSTALLED_DIR="$ORIGINAL_DIR/node_modules/@onesignal/capacitor-plugin"
TARBALL="$SDK_ROOT/onesignal-capacitor-plugin.tgz"

info "Building Capacitor plugin & packing tarball..."
(cd "$SDK_ROOT" && vp run build)
(
  cd "$SDK_ROOT"
  rm -f onesignal-capacitor-plugin-*.tgz
  vp pm pack
  new_tarball=(onesignal-capacitor-plugin-*.tgz)
  if [[ -f "$TARBALL" ]] && cmp -s "${new_tarball[0]}" "$TARBALL"; then
    rm "${new_tarball[0]}"
    info "Capacitor SDK package is unchanged, keeping cached tarball"
  else
    mv "${new_tarball[0]}" "$TARBALL"
    info "Capacitor SDK package changed, refreshed tarball"
  fi
)

TARBALL_HASH=$(shasum "$TARBALL" | awk '{print $1}')
if [[ -d "$INSTALLED_DIR" ]] && [[ -f "$INSTALLED_STAMP" ]] && [[ "$(cat "$INSTALLED_STAMP")" == "$TARBALL_HASH" ]]; then
  info "Plugin already installed from the current tarball, skipping vp add"
else
  # Remove before add so bun.lock's integrity hash refreshes against the new
  # tarball; otherwise `vp add` hits a dependency-loop error under bun 1.3+.
  # Keep the relative `file:../../...` path to match package.json's spec.
  info "Registering tarball with vp (refreshes bun.lock integrity hash)..."
  vp remove @onesignal/capacitor-plugin 2>/dev/null || true
  vp add file:../../onesignal-capacitor-plugin.tgz
  echo "$TARBALL_HASH" > "$INSTALLED_STAMP"
fi

# ── Vite prebundle staleness check ───────────────────────────────────────────
# Vite prebundles deps into node_modules/.vite/deps once at startup and keys
# the cache on lockfileHash. file: deps don't always trip that hash, and a
# long-running Vite (via dev-android.sh's "reuse existing dev server" path)
# never re-bundles mid-session. Always check: if the prebundle predates the
# installed dist, drop it and kill any Vite still on $DEV_PORT so the next
# dev:* run re-bundles cleanly. Self-healing; runs regardless of whether the
# SDK rebuild branch above fired.
DEV_PORT="${DEV_PORT:-5173}"
PREBUNDLE="$ORIGINAL_DIR/node_modules/.vite/deps/@onesignal_capacitor-plugin.js"
INSTALLED_DIST="$INSTALLED_DIR/dist/index.js"
if [[ -f "$INSTALLED_DIST" ]] && [[ -f "$PREBUNDLE" ]] && [[ "$INSTALLED_DIST" -nt "$PREBUNDLE" ]]; then
  info "Vite prebundle is stale (installed dist is newer); invalidating..."
  rm -rf "$ORIGINAL_DIR/node_modules/.vite"
  if lsof -ti:"$DEV_PORT" >/dev/null 2>&1; then
    info "Killing stale Vite on :$DEV_PORT so the rebuild takes effect..."
    lsof -ti:"$DEV_PORT" | xargs kill 2>/dev/null || true
    sleep 1
  fi
fi

# ── Web bundle ───────────────────────────────────────────────────────────────
info "Building web bundle (vite)..."
# Same reasoning as the SDK build above: invoke `vp build` directly to skip
# `vp run`'s task cache, which can be incompatible between vite-plus versions.
vp run build

# ── Capacitor sync cache ─────────────────────────────────────────────────────
# `cap sync` runs `pod install` + `xcodebuild clean` (~30-60s); skip when
# inputs are unchanged. Hash sources (not `dist/`) since bundlers emit
# content-hashed chunk names that can drift between identical builds.
SYNC_STAMP="$ORIGINAL_DIR/.cap-sync.stamp"
SYNC_HASH=$(find "$ORIGINAL_DIR/src" "$ORIGINAL_DIR/index.html" \
                 "$ORIGINAL_DIR/capacitor.config.ts" "$ORIGINAL_DIR/vite.config.ts" \
                 "$ORIGINAL_DIR/package.json" "$ORIGINAL_DIR/bun.lock" \
                 "$ORIGINAL_DIR/ios/App" \
            -type f \
            ! -path "*/node_modules/*" \
            ! -path "*/Pods/*" \
            ! -path "*/build/*" \
            ! -path "*/DerivedData/*" \
            ! -path "*/xcuserdata/*" \
            \( -name "Podfile" -o -name "Package.swift" -o -name "build.gradle" \
               -o -name "*.ts" -o -name "*.tsx" \
               -o -name "*.json" -o -name "*.html" -o -name "*.js" \
               -o -name "*.css" -o -name "*.svg" -o -name "*.xml" \
               -o -name "*.swift" -o -name "*.kt" \
               -o -name "*.lock" \) \
            2>/dev/null \
            | sort \
            | xargs shasum 2>/dev/null \
            | shasum \
            | awk '{print $1}')
SYNC_HASH="${SYNC_HASH}-${TARBALL_HASH}"

if [[ -d "$ORIGINAL_DIR/ios/App/App/public" ]] && [[ -f "$SYNC_STAMP" ]] && [[ "$(cat "$SYNC_STAMP")" == "$SYNC_HASH" ]]; then
  info "Capacitor sync inputs unchanged, skipping cap sync"
elif ! command -v pod >/dev/null 2>&1; then
  # CI Android jobs run on Linux where CocoaPods isn't installed.
  # Sync only Android so plain `cap sync` doesn't shell out to pod.
  info "CocoaPods not found, syncing Android only..."
  vpx cap sync android
  echo "$SYNC_HASH" > "$SYNC_STAMP"
else
  info "Syncing Capacitor..."
  vpx cap sync
  echo "$SYNC_HASH" > "$SYNC_STAMP"
fi
