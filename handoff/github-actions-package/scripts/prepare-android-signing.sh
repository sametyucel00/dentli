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

python3 - <<'PY'
from pathlib import Path

path = Path("android/app/build.gradle")
text = path.read_text(encoding="utf-8")

release_signing_block = """        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
"""

if "signingConfigs {\n" not in text:
    raise SystemExit("Could not find signingConfigs block in android/app/build.gradle")

if "signingConfigs.release" not in text:
    debug_block = """        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
"""
    if debug_block not in text:
        raise SystemExit("Could not find debug signing config block to extend")
    text = text.replace(debug_block, debug_block + release_signing_block, 1)

release_build_debug_signing = """        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug
"""
release_build_release_signing = """        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.release
"""

if release_build_debug_signing in text:
    text = text.replace(release_build_debug_signing, release_build_release_signing, 1)
elif "signingConfig signingConfigs.release" not in text:
    raise SystemExit("Could not find release buildType signing config to replace")

path.write_text(text, encoding="utf-8")
PY

echo "Android signing prepared successfully."
