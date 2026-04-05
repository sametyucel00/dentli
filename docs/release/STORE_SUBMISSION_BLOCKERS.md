# Dentli Store Submission Blockers

These items still block a real App Store / Google Play release even though the app codebase is now much better prepared.

## Hard Blockers

1. Real billing integration is not implemented yet.
   The app still uses the local purchase gateway in [purchase-gateway.local.ts](C:/Users/Samet/Downloads/Dentli/src/services/purchase-gateway.local.ts). App Store and Play release requires real StoreKit / Play Billing integration and sandbox validation.

2. Final legal documents are not linked yet.
   The in-app screens are release-safe summaries, not final lawyer-approved hosted privacy policy / terms URLs.

3. Final support identity is missing.
   Store submission typically requires a real support email, privacy contact, and publisher identity.

4. Bundle/package identifiers are assumptions.
   `com.dentli.app` is a reasonable placeholder, but ownership and final naming should be confirmed before submission.

5. Store assets have not been brand-reviewed.
   Current icon/splash files are technically valid, but they still need visual and brand approval for release.

6. Screenshots and store listing content are missing.
   App Store and Play metadata, screenshots, promotional copy, and category answers are not part of the repo yet.

## Medium-Risk Items

1. Notification behavior needs on-device release testing.
   Quiet hours and adaptive reminders are implemented, but real OS-level behavior still needs device validation for iOS and Android release builds.

2. Restore purchases needs sandbox verification.
   The UI and flow exist, but the production gateway is not connected yet.

3. Privacy disclosures must match final runtime behavior.
   If the app later adds analytics, crash reporting, sync, or account systems, the privacy copy and store disclosures must be updated.

4. Medical positioning should be reviewed.
   Dentli currently positions itself as a personal dental tracking app, not a diagnostic tool. Store copy should preserve that boundary clearly.
