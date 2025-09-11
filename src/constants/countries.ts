export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: 'TH', name: 'ไทย', dialCode: '+66', flag: '🇹🇭' },
  { code: 'US', name: 'สหรัฐอเมริกา', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'สหราชอาณาจักร', dialCode: '+44', flag: '🇬🇧' },
  { code: 'JP', name: 'ญี่ปุ่น', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'เกาหลีใต้', dialCode: '+82', flag: '🇰🇷' },
  { code: 'CN', name: 'จีน', dialCode: '+86', flag: '🇨🇳' },
  { code: 'SG', name: 'สิงคโปร์', dialCode: '+65', flag: '🇸🇬' },
  { code: 'MY', name: 'มาเลเซีย', dialCode: '+60', flag: '🇲🇾' },
  { code: 'ID', name: 'อินโดนีเซีย', dialCode: '+62', flag: '🇮🇩' },
  { code: 'PH', name: 'ฟิลิปปินส์', dialCode: '+63', flag: '🇵🇭' },
  { code: 'VN', name: 'เวียดนาม', dialCode: '+84', flag: '🇻🇳' },
  { code: 'KH', name: 'กัมพูชา', dialCode: '+855', flag: '🇰🇭' },
  { code: 'LA', name: 'ลาว', dialCode: '+856', flag: '🇱🇦' },
  { code: 'MM', name: 'พม่า', dialCode: '+95', flag: '🇲🇲' },
  { code: 'IN', name: 'อินเดีย', dialCode: '+91', flag: '🇮🇳' },
  { code: 'AU', name: 'ออสเตรเลีย', dialCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'เยอรมนี', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'ฝรั่งเศส', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'อิตาลี', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'สเปน', dialCode: '+34', flag: '🇪🇸' },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // ไทย
