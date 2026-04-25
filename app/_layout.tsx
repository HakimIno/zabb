import '@/global.css';

import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryProvider } from '@/providers/QueryProvider';
import { NAV_THEME } from '@/utils/theme';

export {
  // Catch any errors thrown by the Layout component./
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  const [fontsLoaded] = useFonts({
    'Anuphan-Thin': require('../assets/fonts/anuphan-thai-100-normal.ttf'),
    'Anuphan-ExtraLight': require('../assets/fonts/anuphan-thai-200-normal.ttf'),
    'Anuphan-Light': require('../assets/fonts/anuphan-thai-300-normal.ttf'),
    'Anuphan-Regular': require('../assets/fonts/anuphan-thai-400-normal.ttf'),
    'Anuphan-Medium': require('../assets/fonts/anuphan-thai-500-normal.ttf'),
    'Anuphan-SemiBold': require('../assets/fonts/anuphan-thai-600-normal.ttf'),
    'Anuphan-Bold': require('../assets/fonts/anuphan-thai-700-normal.ttf'),
    'Anuphan-Latin-Thin': require('../assets/fonts/anuphan-latin-100-normal.ttf'),
    'Anuphan-Latin-ExtraLight': require('../assets/fonts/anuphan-latin-200-normal.ttf'),
    'Anuphan-Latin-Light': require('../assets/fonts/anuphan-latin-300-normal.ttf'),
    'Anuphan-Latin-Regular': require('../assets/fonts/anuphan-latin-400-normal.ttf'),
    'Anuphan-Latin-Medium': require('../assets/fonts/anuphan-latin-500-normal.ttf'),
    'Anuphan-Latin-SemiBold': require('../assets/fonts/anuphan-latin-600-normal.ttf'),
    'Anuphan-Latin-Bold': require('../assets/fonts/anuphan-latin-700-normal.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="search" options={{ headerShown: false }} />
          </Stack>
          <PortalHost />
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryProvider>
  );
}
