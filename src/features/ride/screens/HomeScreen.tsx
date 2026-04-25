import { Stack, useLocalSearchParams } from 'expo-router';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import type { LocationResult } from '@/features/map/services/geocoding';
import { RideBooking } from '@/features/ride/components/RideBooking';
import { Button } from '@/ui/button';
import { Icon } from '@/ui/icon';
import { THEME } from '@/utils/theme';
import '@/features/map/config/mapbox';

const SCREEN_OPTIONS = {
  light: {
    title: 'Zabb',
    headerTransparent: true,
    headerShadowVisible: true,
    headerStyle: { backgroundColor: THEME.light.background },
    headerRight: () => <ThemeToggle />,
  },
  dark: {
    title: 'Zabb',
    headerTransparent: true,
    headerShadowVisible: true,
    headerStyle: { backgroundColor: THEME.dark.background },
    headerRight: () => <ThemeToggle />,
  },
};

export default function HomeScreen() {
  const { colorScheme } = useColorScheme();
  const params = useLocalSearchParams();

  // Parse selected destination from search screen
  const selectedDestination = params.selectedDestination
    ? (JSON.parse(params.selectedDestination as string) as LocationResult)
    : null;

  // Check if user wants to select on map
  const selectOnMap = params.selectOnMap === 'true';

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS[colorScheme ?? 'light']} />
      <RideBooking
        initialLocation={[100.5018, 13.7563]} // กรุงเทพฯ
        initialZoom={15}
        selectedDestination={selectedDestination}
        selectOnMap={selectOnMap}
      />
    </>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="rounded-full web:mx-4"
    >
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}
