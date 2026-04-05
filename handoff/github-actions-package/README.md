# Dentli GitHub Actions Package

Bu klasor, GitHub Actions uzerinden Android ve iOS build almak icin gereken minimum CI paketini icerir.

Amac:

- Expo Cloud / EAS zorunlulugu olmadan
- GitHub Actions uzerinden
- imzali `apk` ve `aab`
- artifact olarak indirilebilir build almak

## Klasor yapisi

- `.github/workflows/android-release.yml`
- `.github/workflows/ios-build.yml`
- `scripts/prepare-android-signing.sh`
- `scripts/prepare-ios-signing.sh`
- `SECRETS_REQUIRED.md`
- `IOS_SECRETS_REQUIRED.md`

## Hedef repoya nasil kopyalanir

1. Bu klasorun icindeki `.github` klasorunu hedef reponun kokune kopyala.
2. Bu klasorun icindeki `scripts` klasorunu hedef reponun kokune kopyala.
3. `SECRETS_REQUIRED.md` ve gerekiyorsa `IOS_SECRETS_REQUIRED.md` dosyasindaki secret'lari GitHub repo settings icine ekle.
4. Android icin `Actions > Android Release Build`
5. iOS icin `Actions > iOS Build`

## Build davranisi

Android workflow su adimlari yapar:

1. Node ve Java kurar
2. `npm ci` calistirir
3. `expo prebuild --platform android --clean` ile native Android projesini CI icinde olusturur
4. Keystore secret'larindan release signing ayarlarini olusturur
5. `bundleRelease` ve `assembleRelease` ile AAB + APK alir
6. Artifact olarak yukler

## iOS workflow ne yapar

1. Node ve Ruby kurar
2. `npm ci` calistirir
3. `expo prebuild --platform ios --clean` ile iOS projesini olusturur
4. CocoaPods kurar
5. Apple sertifika + provisioning profile ile signing hazirlar
6. `xcarchive` ve `ipa` uretir
7. Artifact olarak yukler

## Notlar

- Android klasoru repoda tutulmak zorunda degil
- Build tamamen GitHub runner uzerinde olusur
- Expo hesabina veya EAS token'ina ihtiyac yok
- iOS tarafinda Apple signing secret'lari olmadan build artifact alinmaz
