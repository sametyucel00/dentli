# Dentli Store Release Checklist

Use this checklist before submitting Dentli to the App Store or Google Play.

## Product Metadata

- Confirm app name is `Dentli` everywhere user-facing
- Confirm final slug, bundle identifier, and Android package naming
- Confirm production version `x.y.z`
- Confirm iOS build number increments per submission
- Confirm Android version code increments per submission
- Confirm final subtitle, short description, and full store description
- Confirm support email and privacy policy URL

## Branding Assets

- Replace current working app icon with final brand-approved icon pack
- Verify iOS App Store icon export
- Verify Android adaptive icon foreground/background balance
- Verify splash artwork on light and dark devices
- Verify screenshots for phone sizes required by Apple and Google
- Prepare App Store promotional text and Play feature graphic if needed

## Legal and Privacy

- Replace in-app legal summary screens with lawyer-approved final copy
- Publish final privacy policy URL
- Publish final terms of use / EULA URL if required
- Confirm medical disclaimer wording is acceptable for your jurisdiction
- Confirm support contact details are real and monitored

## Permissions

- Verify notification permission wording is final
- Confirm notifications are optional and user-controlled
- Confirm no unused permissions are requested in native builds

## Monetization

- Replace local purchase gateway with real StoreKit / Play Billing integration
- Create matching App Store and Play Console in-app product entries
- Confirm product ID matches production billing config
- Verify paywall title, description, and restore messaging
- Verify restore purchases works with real sandbox/test accounts

## Quality

- Run `npm run lint`
- Run `npm run typecheck`
- Run `npm run build:web`
- Test EAS preview builds on iOS and Android hardware
- Verify dark mode and light mode
- Verify Today fast actions, timers, reminders, and undo flows
- Verify appointment reminders and quiet hours behavior
- Verify Pro gating and restore flow
- Verify privacy, legal, and permissions screens open correctly

## App Store Connect

- Create app record
- Add privacy nutrition labels
- Add age rating answers
- Add app category
- Upload screenshots and icon
- Upload build
- Complete in-app purchase review details

## Google Play Console

- Create app record
- Complete Data safety form
- Complete content rating
- Complete app access declarations if needed
- Upload screenshots, icon, and feature graphic
- Upload AAB
- Configure in-app product

## Launch Readiness

- Confirm analytics/crash tooling strategy if any
- Confirm backup/sync claims are not mentioned if not implemented
- Confirm all placeholder marketing text is removed
- Confirm release notes are written
