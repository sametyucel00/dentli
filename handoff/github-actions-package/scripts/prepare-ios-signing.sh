#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${IOS_P12_BASE64:-}" || -z "${IOS_P12_PASSWORD:-}" || -z "${IOS_MOBILEPROVISION_BASE64:-}" || -z "${IOS_TEAM_ID:-}" || -z "${KEYCHAIN_PASSWORD:-}" ]]; then
  echo "Missing required iOS signing secrets."
  exit 1
fi

TEMP_DIR="$(mktemp -d)"
KEYCHAIN_NAME="build.keychain-db"
P12_PATH="$TEMP_DIR/cert.p12"
PROFILE_PATH="$TEMP_DIR/profile.mobileprovision"

echo "$IOS_P12_BASE64" | base64 --decode > "$P12_PATH"
echo "$IOS_MOBILEPROVISION_BASE64" | base64 --decode > "$PROFILE_PATH"

security create-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_NAME"
security set-keychain-settings -lut 21600 "$KEYCHAIN_NAME"
security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_NAME"
security import "$P12_PATH" -P "$IOS_P12_PASSWORD" -A -t cert -f pkcs12 -k "$KEYCHAIN_NAME"
security list-keychains -d user -s "$KEYCHAIN_NAME"

mkdir -p "$HOME/Library/MobileDevice/Provisioning Profiles"
cp "$PROFILE_PATH" "$HOME/Library/MobileDevice/Provisioning Profiles/"

echo "iOS signing prepared successfully."
