# Dentli

Dentli is a local-first Expo app for dental care tracking. It includes a fast daily routine flow, appointments, care-item tracking, a 32-tooth map, timeline/history, analytics, reminders, and a Free vs Pro entitlement layer.

This repository is structured for a real product handoff: Expo Router, TypeScript, Zustand, a typed SQLite repository layer, i18n, theming, GitHub Actions, and EAS configuration are already in place.

## What is in scope

- Expo SDK 54 with Expo Router
- React Native + React Native Web
- TypeScript with strict mode
- Zustand global state and cache helpers
- SQLite-backed native persistence with migrations
- i18next with English and Turkish
- Light, dark, and system theme support
- Local notifications and scheduling infrastructure
- One-time Pro entitlement abstraction
- GitHub Actions CI and EAS profiles

## First 10 minutes

### Requirements

- Node.js 20+
- npm 10+
- Xcode for iOS builds
- Android Studio for Android builds
- Expo CLI via `npx`

The repository includes [.nvmrc](/C:/Users/Samet/Downloads/Dentli/.nvmrc) and `package.json` engine hints so the expected Node version is explicit.

### Install

```bash
npm install
```

### Start the app

```bash
npm run start
```

Useful variants:

```bash
npm run start:clear
npm run ios
npm run android
npm run web
```

### Validate the repo

```bash
npm run validate
```

That runs:

- `npm run lint`
- `npm run typecheck`
- `npm run build:web`

## Environment and config

Dentli currently does not require runtime environment variables for local development.

- [.env.example](/C:/Users/Samet/Downloads/Dentli/.env.example) is intentionally minimal
- [app.json](/C:/Users/Samet/Downloads/Dentli/app.json) contains Expo app configuration
- [eas.json](/C:/Users/Samet/Downloads/Dentli/eas.json) contains EAS build/submit profiles
- [.github/workflows/ci.yml](/C:/Users/Samet/Downloads/Dentli/.github/workflows/ci.yml) contains CI validation

Current release-facing assumptions that should be confirmed by the product owner before store launch:

- app name: `Dentli`
- iOS bundle identifier: `com.dentli.app`
- Android package: `com.dentli.app`
- app version: `1.0.0`

## Running on each platform

### iOS and Android

Native builds use `expo-sqlite` and run the full migration path. This is the primary persistence target for the app today.

### Web

Web is supported for development and static export:

```bash
npm run web
npm run build:web
```

Important limitation:

- native builds use real SQLite persistence
- web uses the fallback service in [database-service.web.ts](/C:/Users/Samet/Downloads/Dentli/src/services/database-service.web.ts)
- the current web fallback is render-safe, but not persistence-complete

In practical terms, web is handoff-ready for UI review, routing checks, and static export, but it is not yet a full local-data replacement for native SQLite behavior.

## Repository structure

### App routing

- [app](/C:/Users/Samet/Downloads/Dentli/app)
  Expo Router route files only

### Core source

- [src/domain](/C:/Users/Samet/Downloads/Dentli/src/domain)
  shared models, vocabulary, and typed contracts
- [src/features](/C:/Users/Samet/Downloads/Dentli/src/features)
  feature modules such as Today, Map, Timeline, Appointments, Care, Profile, Dentist Mode, and Monetization
- [src/repositories](/C:/Users/Samet/Downloads/Dentli/src/repositories)
  database-facing data access
- [src/services](/C:/Users/Samet/Downloads/Dentli/src/services)
  orchestration for bootstrap, settings, notifications, purchases, and cross-feature flows
- [src/state](/C:/Users/Samet/Downloads/Dentli/src/state)
  Zustand store, selectors, and cache helpers
- [src/theme](/C:/Users/Samet/Downloads/Dentli/src/theme)
  tokens and runtime theme resolution
- [src/i18n](/C:/Users/Samet/Downloads/Dentli/src/i18n)
  i18n bootstrap and translations
- [src/ui/base](/C:/Users/Samet/Downloads/Dentli/src/ui/base)
  reusable base UI components

## Data model and persistence

SQLite tables currently include:

- `profiles`
- `routine_settings`
- `hygiene_events`
- `symptom_events`
- `appointments`
- `care_items`
- `tooth_current_status`
- `tooth_status_history`
- `app_entitlements`

Migration definitions live in [src/database/migrations/index.ts](/C:/Users/Samet/Downloads/Dentli/src/database/migrations/index.ts).

Native database bootstrapping lives in [src/services/database-service.native.ts](/C:/Users/Samet/Downloads/Dentli/src/services/database-service.native.ts).

## Development seed behavior

[seed-data.ts](/C:/Users/Samet/Downloads/Dentli/src/dev/seed-data.ts) seeds realistic development data only when both conditions are true:

- the build is running in `__DEV__`
- the database has no profiles yet

That seed data is there to make first-run development easier. It is not intended as production onboarding logic.

## Notifications

Local notification behavior is split across:

- [notification-service.ts](/C:/Users/Samet/Downloads/Dentli/src/services/notification-service.ts)
  low-level scheduling/cancellation wrapper
- [notification-scheduler-service.ts](/C:/Users/Samet/Downloads/Dentli/src/services/notification-scheduler-service.ts)
  routine-aware scheduling rules, quiet hours, and appointment sync

Current reminder coverage:

- morning brush
- night brush
- floss
- mouthwash
- toothbrush replacement
- dental check
- appointment reminders

## Monetization

Dentli includes a Free vs Pro entitlement layer with a one-time purchase abstraction.

Important handoff note:

- the entitlement model and gating are wired
- the current purchase gateway abstraction is ready for a real store billing implementation
- production App Store / Play billing still needs to replace the local gateway before submission

## CI/CD

GitHub Actions validation lives in [.github/workflows/ci.yml](/C:/Users/Samet/Downloads/Dentli/.github/workflows/ci.yml).

The workflow currently:

- installs dependencies with `npm ci`
- runs `npm run validate`

EAS profiles are defined in [eas.json](/C:/Users/Samet/Downloads/Dentli/eas.json):

- `development`
- `preview`
- `production`

Typical usage:

```bash
npx eas build --platform ios --profile preview
npx eas build --platform android --profile preview
npx eas build --platform all --profile production
```

## Legal and release prep

Release support docs:

- [STORE_RELEASE_CHECKLIST.md](/C:/Users/Samet/Downloads/Dentli/docs/release/STORE_RELEASE_CHECKLIST.md)
- [STORE_SUBMISSION_BLOCKERS.md](/C:/Users/Samet/Downloads/Dentli/docs/release/STORE_SUBMISSION_BLOCKERS.md)

In-app release-facing screens:

- [privacy.tsx](/C:/Users/Samet/Downloads/Dentli/app/privacy.tsx)
- [legal.tsx](/C:/Users/Samet/Downloads/Dentli/app/legal.tsx)
- [permissions.tsx](/C:/Users/Samet/Downloads/Dentli/app/permissions.tsx)

## Known handoff notes

- Native is the primary data target; web export works, but browser persistence is intentionally limited today.
- Purchase entitlement scaffolding is real, but production billing integration is still a follow-up task.
- Local notifications are implemented, but platform-level store submission work still needs real product/legal review.
- The repo is ready for a developer or founder to continue building, validate flows, and start release prep without reverse-engineering the stack.
