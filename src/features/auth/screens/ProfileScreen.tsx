import { router, Stack } from 'expo-router';
import {
  BellIcon,
  ChevronRightIcon,
  EditIcon,
  GlobeIcon,
  HelpCircleIcon,
  KeyIcon,
  LogOutIcon,
  MailIcon,
  MoonIcon,
  PhoneIcon,
  Settings2Icon,
  ShieldIcon,
  StarIcon,
  SunIcon,
  UserIcon,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { ScrollView, Switch, TouchableOpacity, View } from 'react-native';
import { Text } from '@/ui/text';
import { THEME } from '@/utils/theme';
import { cn } from '@/utils/utils';

const SCREEN_OPTIONS = {
  light: {
    title: 'โปรไฟล์',
    headerStyle: { backgroundColor: THEME.light.background },
    headerTintColor: THEME.light.foreground,
  },
  dark: {
    title: 'โปรไฟล์',
    headerStyle: { backgroundColor: THEME.dark.background },
    headerTintColor: THEME.dark.foreground,
  },
};

export default function ProfileScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(colorScheme === 'dark');

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    toggleColorScheme();
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    showChevron = true,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity
      className="bg-card p-1 rounded-2xl border border-border/50 flex-row items-center justify-between mb-3"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-12 h-12 bg-primary/8 rounded-2xl items-center justify-center mr-4">
          {icon}
        </View>
        <View className="flex-1">
          <Text className="text-foreground font-anuphan-semibold text-base mb-1">{title}</Text>
          {subtitle && (
            <Text className="text-muted-foreground text-sm font-anuphan">{subtitle}</Text>
          )}
        </View>
      </View>
      {rightElement ||
        (showChevron && (
          <ChevronRightIcon
            size={20}
            color={colorScheme === 'dark' ? THEME.dark.muted : THEME.light.muted}
          />
        ))}
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS[colorScheme ?? 'light']} />
      <ScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        {/* Simplified Profile Header */}
        <View className="p-12">
          <View className="items-center">
            {/* Avatar */}
            <View
              className={cn(
                'w-20 h-20 rounded-full items-center justify-center mb-3',
                colorScheme === 'dark' ? 'bg-primary/10' : 'bg-primary/10'
              )}
            >
              <UserIcon size={40} color="white" />
            </View>

            {/* User Info */}
            <View>
              <Text className="text-2xl text-foreground mb-2 font-anuphan-bold">Weerachit</Text>
            </View>
            <View className="flex-row items-center bg-primary/10 px-3 py-1 rounded-lg">
              <StarIcon
                size={16}
                color={colorScheme === 'dark' ? THEME.dark.primary : THEME.light.primary}
              />
              <Text className="ml-2 text-primary font-anuphan-medium">สมาชิกใหม่</Text>
            </View>
          </View>
        </View>

        <View className="px-4">
          {/* Personal Information Section */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2 ml-1">
              <UserIcon
                size={20}
                color={colorScheme === 'dark' ? THEME.dark.primary : THEME.light.primary}
              />
              <Text className="ml-2 font-anuphan-bold text-lg">ข้อมูลส่วนตัว</Text>
            </View>

            <SettingItem
              icon={
                <MailIcon
                  size={22}
                  color={colorScheme === 'dark' ? THEME.dark.primary : THEME.light.primary}
                />
              }
              title="อีเมล"
              subtitle="user@example.com"
              onPress={() => {}}
              rightElement={undefined}
            />

            <SettingItem
              icon={
                <PhoneIcon
                  size={22}
                  color={colorScheme === 'dark' ? THEME.dark.primary : THEME.light.primary}
                />
              }
              title="เบอร์โทรศัพท์"
              subtitle="+66 123 456 789"
              onPress={() => {}}
              rightElement={undefined}
            />
          </View>

          {/* Account Management Section */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2 ml-1">
              <Settings2Icon
                size={20}
                color={colorScheme === 'dark' ? THEME.dark.primary : THEME.light.primary}
              />
              <Text className="ml-2 font-anuphan-bold text-lg">การจัดการบัญชี</Text>
            </View>

            <SettingItem
              icon={<EditIcon size={22} color="#3b82f6" />}
              title="แก้ไขโปรไฟล์"
              subtitle="อัพเดทข้อมูลส่วนตัว"
              onPress={() => {}}
              rightElement={undefined}
            />

            <SettingItem
              icon={<KeyIcon size={22} color="#f59e0b" />}
              title="เปลี่ยนรหัสผ่าน"
              subtitle="อัพเดทรหัสผ่านของคุณ"
              onPress={() => {}}
              rightElement={undefined}
            />
          </View>

          {/* App Settings Section */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2 ml-1">
              <Settings2Icon
                size={20}
                color={colorScheme === 'dark' ? THEME.dark.primary : THEME.light.primary}
              />
              <Text className="ml-2 font-anuphan-bold text-lg">การตั้งค่าแอป</Text>
            </View>

            {/* Dark Mode Toggle */}
            <SettingItem
              icon={
                colorScheme === 'dark' ? (
                  <MoonIcon size={22} color={THEME.dark.primary} />
                ) : (
                  <SunIcon size={22} color={THEME.light.primary} />
                )
              }
              title="โหมดมืด"
              subtitle={darkMode ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
              onPress={handleDarkModeToggle}
              showChevron={false}
              rightElement={
                <Switch
                  value={darkMode}
                  onValueChange={handleDarkModeToggle}
                  trackColor={{
                    false: '#e5e7eb',
                    true: colorScheme === 'dark' ? THEME.dark.primary : THEME.light.primary,
                  }}
                  thumbColor={darkMode ? '#ffffff' : '#f3f4f6'}
                />
              }
            />

            {/* Language */}
            <SettingItem
              icon={<GlobeIcon size={22} color="#10b981" />}
              title="ภาษา"
              subtitle="ไทย"
              onPress={() => {}}
              rightElement={undefined}
            />

            {/* Notifications */}
            <SettingItem
              icon={<BellIcon size={22} color="#8b5cf6" />}
              title="การแจ้งเตือน"
              subtitle={notifications ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
              onPress={() => setNotifications(!notifications)}
              showChevron={false}
              rightElement={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{
                    false: '#e5e7eb',
                    true: colorScheme === 'dark' ? THEME.dark.primary : THEME.light.primary,
                  }}
                  thumbColor={notifications ? '#ffffff' : '#f3f4f6'}
                />
              }
            />
          </View>

          {/* Support Section */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2 ml-1">
              <ShieldIcon
                size={20}
                color={colorScheme === 'dark' ? THEME.dark.primary : THEME.light.primary}
              />
              <Text className="ml-2 font-anuphan-bold text-lg">สนับสนุน</Text>
            </View>

            <SettingItem
              icon={<ShieldIcon size={22} color="#ec4899" />}
              title="นโยบายความเป็นส่วนตัว"
              subtitle="เรียนรู้เกี่ยวกับความเป็นส่วนตัว"
              onPress={() => {}}
              rightElement={undefined}
            />

            <SettingItem
              icon={<HelpCircleIcon size={22} color="#06b6d4" />}
              title="ช่วยเหลือ & สนับสนุน"
              subtitle="ติดต่อทีมสนับสนุน"
              onPress={() => {}}
              rightElement={undefined}
            />
          </View>

          {/* Logout Section */}
          <View className="mb-8">
            <TouchableOpacity
              className="bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800/30 p-3 rounded-lg flex-row items-center justify-center"
              activeOpacity={0.8}
              onPress={() => router.push('/login')}
            >
              <LogOutIcon size={22} color="#ef4444" />
              <Text className="ml-3 text-red-500 text-base font-anuphan-bold">ออกจากระบบ</Text>
            </TouchableOpacity>
          </View>

          {/* App Version */}
          <View className="items-center pb-4">
            <Text className="text-muted-foreground text-sm font-anuphan">เวอร์ชัน 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
