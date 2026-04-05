# Required GitHub Secrets

Android release build icin asagidaki secret'lari ekle:

## Zorunlu

### `ANDROID_KEYSTORE_BASE64`

- Android upload keystore dosyasinin base64 hali
- `.jks` veya `.keystore` dosyasini base64'e cevirip buraya koy

### `ANDROID_KEYSTORE_PASSWORD`

- Keystore store password

### `ANDROID_KEY_ALIAS`

- Upload key alias

### `ANDROID_KEY_PASSWORD`

- Upload key password

## Opsiyonel ama tavsiye edilir

### `ANDROID_PACKAGE_NAME`

- Varsayilan: `com.dentli.app`
- Eger workflow icinde package kontrolu yapmak istersen kullanilabilir

### `APP_ENV_NAME`

- Sadece bilgi/etiket amacli
- Ornek: `production`

## Base64 nasil uretilir

### macOS / Linux

```bash
base64 -i your-upload-key.jks | pbcopy
```

veya

```bash
base64 your-upload-key.jks
```

### Windows PowerShell

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\\path\\to\\your-upload-key.jks"))
```

## Workflow artifact ciktilari

Workflow sonunda su dosyalar artifact olarak yuklenir:

- release APK
- release AAB

## Important

- Keystore'u repoya koyma
- Sadece GitHub Secrets'a ekle
- Bu secret'lar olmadan release build calismaz
