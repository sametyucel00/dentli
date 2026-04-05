#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"
APP_DIR="$ANDROID_DIR/app"
KEYSTORE_PATH="$APP_DIR/dentli-upload-key.jks"
GRADLE_PROPERTIES_PATH="$ANDROID_DIR/gradle.properties"
APP_BUILD_GRADLE="$APP_DIR/build.gradle"

if [[ ! -d "$ANDROID_DIR" ]]; then
  echo "android directory not found. Run expo prebuild first."
  exit 1
fi

if [[ -z "${ANDROID_KEYSTORE_BASE64:-}" || -z "${ANDROID_KEYSTORE_PASSWORD:-}" || -z "${ANDROID_KEY_ALIAS:-}" || -z "${ANDROID_KEY_PASSWORD:-}" ]]; then
  echo "Missing required Android signing secrets."
  exit 1
fi

echo "$ANDROID_KEYSTORE_BASE64" | base64 --decode > "$KEYSTORE_PATH"

cat <<EOF >> "$GRADLE_PROPERTIES_PATH"

MYAPP_UPLOAD_STORE_FILE=dentli-upload-key.jks
MYAPP_UPLOAD_KEY_ALIAS=$ANDROID_KEY_ALIAS
MYAPP_UPLOAD_STORE_PASSWORD=$ANDROID_KEYSTORE_PASSWORD
MYAPP_UPLOAD_KEY_PASSWORD=$ANDROID_KEY_PASSWORD
EOF

node <<'NODE'
const fs = require('node:fs');
const path = 'android/app/build.gradle';
let text = fs.readFileSync(path, 'utf8');

const releaseSigningBlock = `        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
`;

if (!text.includes('signingConfigs {\n')) {
  throw new Error('Could not find signingConfigs block in android/app/build.gradle');
}

if (!text.includes('signingConfigs.release')) {
  const debugBlock = `        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
`;

  if (!text.includes(debugBlock)) {
    throw new Error('Could not find debug signing config block to extend');
  }

  text = text.replace(debugBlock, `${debugBlock}${releaseSigningBlock}`);
}

const releaseBuildDebugSigning = `        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug
`;

const releaseBuildReleaseSigning = `        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.release
`;

if (text.includes(releaseBuildDebugSigning)) {
  text = text.replace(releaseBuildDebugSigning, releaseBuildReleaseSigning);
} else if (!text.includes('signingConfig signingConfigs.release')) {
  throw new Error('Could not find release buildType signing config to replace');
}

fs.writeFileSync(path, text, 'utf8');
NODE

echo "Android signing prepared successfully."
