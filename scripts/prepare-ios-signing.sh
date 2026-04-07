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
PROFILE_PLIST="$TEMP_DIR/profile.plist"

echo "$IOS_P12_BASE64" | base64 --decode > "$P12_PATH"
echo "$IOS_MOBILEPROVISION_BASE64" | base64 --decode > "$PROFILE_PATH"

security create-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_NAME"
security set-keychain-settings -lut 21600 "$KEYCHAIN_NAME"
security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_NAME"
security import "$P12_PATH" -P "$IOS_P12_PASSWORD" -A -t cert -f pkcs12 -k "$KEYCHAIN_NAME"
security list-keychains -d user -s "$KEYCHAIN_NAME"
security default-keychain -d user -s "$KEYCHAIN_NAME"
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$KEYCHAIN_PASSWORD" "$KEYCHAIN_NAME"

security cms -D -i "$PROFILE_PATH" > "$PROFILE_PLIST"

PROFILE_UUID=$(/usr/libexec/PlistBuddy -c 'Print UUID' "$PROFILE_PLIST")
PROFILE_NAME=$(/usr/libexec/PlistBuddy -c 'Print Name' "$PROFILE_PLIST")
APP_IDENTIFIER=$(/usr/libexec/PlistBuddy -c 'Print Entitlements:application-identifier' "$PROFILE_PLIST")
TEAM_IDENTIFIER=$(/usr/libexec/PlistBuddy -c 'Print TeamIdentifier:0' "$PROFILE_PLIST")

if [[ "$TEAM_IDENTIFIER" != "$IOS_TEAM_ID" ]]; then
  echo "Provisioning profile team identifier does not match IOS_TEAM_ID."
  echo "Profile team: $TEAM_IDENTIFIER"
  echo "Expected team: $IOS_TEAM_ID"
  exit 1
fi

SIGNING_IDENTITY=$(security find-identity -v -p codesigning "$KEYCHAIN_NAME" | grep "Apple Distribution" | head -1 | sed -E 's/.*"(.+)".*/\1/')

if [[ -z "${SIGNING_IDENTITY:-}" ]]; then
  echo "No Apple Distribution signing identity found in keychain."
  exit 1
fi

mkdir -p "$HOME/Library/MobileDevice/Provisioning Profiles"
cp "$PROFILE_PATH" "$HOME/Library/MobileDevice/Provisioning Profiles/$PROFILE_UUID.mobileprovision"

if [[ -n "${GITHUB_ENV:-}" ]]; then
  {
    echo "IOS_PROFILE_UUID=$PROFILE_UUID"
    echo "IOS_PROFILE_NAME=$PROFILE_NAME"
    echo "IOS_APP_IDENTIFIER=$APP_IDENTIFIER"
    echo "IOS_CODE_SIGN_IDENTITY=$SIGNING_IDENTITY"
  } >> "$GITHUB_ENV"
fi

echo "iOS signing prepared successfully."
