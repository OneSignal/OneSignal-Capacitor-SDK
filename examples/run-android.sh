#!/bin/bash
# DON'T RUN THIS FILE DIRECTLY, USE PACKAGE.JSON SCRIPTS
set -e

# Run from the calling package's directory (demo or demo_pods) so each
# project deploys its own native build, not demo's.
PROJECT_DIR="${INIT_CWD:-$PWD}"

serials=$(adb devices | awk '/\tdevice$/{print $1}')

if [ -z "$serials" ]; then
  echo "No Android devices connected. Start an emulator and try again."
  exit 1
fi

labels=()
devices=()
while IFS= read -r serial; do
  avd=$(adb -s "$serial" emu avd name 2>/dev/null | head -1 | tr -d '\r')
  label="${avd:-$serial} ($serial)"
  labels+=("$label")
  devices+=("$serial")
done <<< "$serials"

if [ ${#devices[@]} -eq 1 ]; then
  selected="${devices[0]}"
  echo "Using device: ${labels[0]}"
else
  echo "Select a device:"
  for i in "${!labels[@]}"; do
    echo "  $((i+1))) ${labels[$i]}"
  done
  printf "Choice [1]: "
  read -r choice
  choice=${choice:-1}
  idx=$((choice - 1))
  if [ "$idx" -lt 0 ] || [ "$idx" -ge ${#devices[@]} ]; then
    echo "Invalid choice."
    exit 1
  fi
  selected="${devices[$idx]}"
fi

cd "$PROJECT_DIR"
npx cap run android --target "$selected"
