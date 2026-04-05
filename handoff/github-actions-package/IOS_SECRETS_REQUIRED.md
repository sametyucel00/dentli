# iOS Required GitHub Secrets

Bu dosya, GitHub Actions uzerinden iOS archive / IPA build almak icin gereken minimum secret listesini verir.

## Zorunlu

### `IOS_P12_BASE64`

- Apple Distribution sertifikasinin `.p12` dosyasinin base64 hali

### `IOS_P12_PASSWORD`

- `.p12` export sifresi

### `IOS_MOBILEPROVISION_BASE64`

- App Store veya Ad Hoc provisioning profile dosyasinin base64 hali

### `IOS_TEAM_ID`

- Apple Developer Team ID

### `KEYCHAIN_PASSWORD`

- GitHub runner icinde gecici keychain olusturmak icin kullanilacak sifre

## Tavsiye edilen

### `IOS_BUNDLE_IDENTIFIER`

- Varsayilan: `com.dentli.app`

### `APPLE_DISTRIBUTION_CERTIFICATE_NAME`

- Bilgi/diagnostic amacli

## Not

iOS tarafinda CI ile imzali build almak Android'den daha hassastir.

Bu secret'lar olmadan:

- imzali archive
- IPA export

alinamaz.
