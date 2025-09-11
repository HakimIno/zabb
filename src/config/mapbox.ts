import Mapbox from '@rnmapbox/maps';

// ตั้งค่า Mapbox access token
// คุณต้องไปที่ https://account.mapbox.com/access-tokens/ เพื่อสร้าง access token
const MAPBOX_ACCESS_TOKEN = 'sk.eyJ1Ijoid2VlcmFjaGl0IiwiYSI6ImNtZmY3eTZnNzBpaGMya3NndDZnd2pqOGEifQ.XfKoxoJyVVSlPL6lFn2E1Q';

// ตั้งค่า Mapbox access token
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

export { MAPBOX_ACCESS_TOKEN };
