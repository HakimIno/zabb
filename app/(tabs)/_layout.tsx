import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { HomeIcon, UserIcon } from 'lucide-react-native';
import { THEME } from '@/src/utils/theme';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '400',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'หน้าหลัก',
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'โปรไฟล์ & ตั้งค่า',
          tabBarIcon: ({ color, size }) => <UserIcon color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
