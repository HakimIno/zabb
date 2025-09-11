// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.zabb.com',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'Zabb',
  VERSION: '1.0.0',
  SUPPORTED_LANGUAGES: ['th', 'en'],
  DEFAULT_LANGUAGE: 'th',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PHONE_NUMBER: {
    PATTERN: /^(\+66|0)[0-9]{8,9}$/,
    MIN_LENGTH: 10,
    MAX_LENGTH: 12,
  },
  OTP: {
    LENGTH: 6,
    PATTERN: /^[0-9]{6}$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  ONBOARDING_COMPLETED: 'onboarding_completed',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย',
  INVALID_PHONE: 'รูปแบบเบอร์มือถือไม่ถูกต้อง',
  INVALID_OTP: 'รหัส OTP ไม่ถูกต้อง',
  OTP_EXPIRED: 'รหัส OTP หมดอายุแล้ว',
  LOGIN_FAILED: 'เข้าสู่ระบบไม่สำเร็จ',
  UNAUTHORIZED: 'ไม่มีสิทธิ์เข้าถึง',
  SERVER_ERROR: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์',
  UNKNOWN_ERROR: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  OTP_SENT: 'ส่งรหัส OTP เรียบร้อยแล้ว',
  LOGIN_SUCCESS: 'เข้าสู่ระบบสำเร็จ',
  LOGOUT_SUCCESS: 'ออกจากระบบสำเร็จ',
  PROFILE_UPDATED: 'อัปเดตโปรไฟล์สำเร็จ',
} as const;

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Screen Names
export const SCREEN_NAMES = {
  HOME: 'index',
  LOGIN: 'login',
  PROFILE: 'profile',
} as const;

// Export country data
export * from './countries';
