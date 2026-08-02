import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { DatabaseProvider } from '@/src/state/DatabaseContext';
import { PreferencesProvider } from '@/src/state/PreferencesContext';
import { StudyProvider } from '@/src/state/StudyContext';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Greek renders in Times New Roman (see src/theme/typography.ts) — no Greek
  // face is bundled, so only the UI font is loaded here.
  const [loaded, error] = useFonts({
    'Inter': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <DatabaseProvider>
      <PreferencesProvider>
        <StudyProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </StudyProvider>
      </PreferencesProvider>
    </DatabaseProvider>
  );
}
