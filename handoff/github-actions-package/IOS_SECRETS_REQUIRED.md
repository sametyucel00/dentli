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

## App Store Connect upload icin ek secret'lar

Asagidaki secret'lar eklenirse workflow sadece IPA uretmekle kalmaz, build'i App Store Connect'e de yukler.

### `APP_STORE_CONNECT_API_KEY_ID`

- App Store Connect API key ID

### `APP_STORE_CONNECT_ISSUER_ID`

- App Store Connect issuer ID

### `APP_STORE_CONNECT_API_KEY_BASE64`

- App Store Connect `.p8` API key dosyasinin base64 hali

## Not

iOS tarafinda CI ile imzali build almak Android'den daha hassastir.

Bu secret'lar olmadan:

- imzali archive
- IPA export

alinamaz.

App Store Connect upload secret'lari olmadan ise:

- IPA build alinabilir
- ama build Apple tarafina otomatik gonderilmez
