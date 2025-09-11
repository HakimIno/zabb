# การตั้งค่า Maps API Keys

## Google Maps API Key

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. สร้างโปรเจคใหม่หรือเลือกโปรเจคที่มีอยู่
3. เปิดใช้งาน Maps SDK for Android และ Maps SDK for iOS
4. สร้าง API Key
5. จำกัดการใช้งาน API Key ให้กับแอปของคุณ (แนะนำ)

## Apple Maps API Key (สำหรับ iOS)

1. ไปที่ [Apple Developer Console](https://developer.apple.com/account/resources/authkeys/list)
2. สร้าง API Key ใหม่
3. เปิดใช้งาน MapKit JS

## การตั้งค่าในแอป

1. แก้ไขไฟล์ `app.json` และแทนที่:
   - `YOUR_GOOGLE_MAPS_API_KEY_HERE` ด้วย Google Maps API Key ของคุณ
   - `YOUR_APPLE_MAPS_API_KEY_HERE` ด้วย Apple Maps API Key ของคุณ

2. รันคำสั่ง:
   ```bash
   expo prebuild --clean
   ```

3. รันแอป:
   ```bash
   expo run:ios
   # หรือ
   expo run:android
   ```

## หมายเหตุ

- สำหรับการทดสอบใน Expo Go คุณไม่จำเป็นต้องมี API Key
- API Keys จำเป็นสำหรับการ build แอปจริงเท่านั้น
