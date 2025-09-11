# การตั้งค่า Mapbox

## ขั้นตอนการตั้งค่า

### 1. สร้าง Mapbox Account
- ไปที่ [Mapbox](https://www.mapbox.com/) และสร้างบัญชี
- หรือเข้าสู่ระบบหากมีบัญชีอยู่แล้ว

### 2. สร้าง Access Token
- ไปที่ [Access Tokens](https://account.mapbox.com/access-tokens/)
- คลิก "Create a token"
- ตั้งชื่อ token (เช่น "Zabb App")
- เลือก scopes ที่ต้องการ (อย่างน้อยต้องมี `styles:read` และ `fonts:read`)
- คลิก "Create token"

### 3. อัปเดต Access Token ในโปรเจค

#### ในไฟล์ `src/config/mapbox.ts`:
```typescript
const MAPBOX_ACCESS_TOKEN = 'pk.your_actual_token_here';
```

#### ในไฟล์ `app.json`:
```json
{
  "plugins": [
    [
      "@rnmapbox/maps",
      {
        "RNMapboxMapsImpl": "mapbox",
        "RNMapboxMapsDownloadToken": "pk.your_actual_token_here"
      }
    ]
  ]
}
```

### 4. รันโปรเจค
```bash
bun run dev
```

## ฟีเจอร์ที่รองรับ

- ✅ แผนที่แบบ Street และ Dark mode
- ✅ การเปลี่ยนธีมอัตโนมัติ
- ✅ ตำแหน่งเริ่มต้นที่กรุงเทพมหานคร
- ✅ Zoom level ที่เหมาะสม

## หมายเหตุ

- Access token จะถูกใช้สำหรับดาวน์โหลดแผนที่และสไตล์
- อย่าลืมเก็บ access token เป็นความลับ
- สามารถสร้าง token หลายตัวสำหรับ environment ต่างๆ ได้
