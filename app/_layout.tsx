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
  // Tinos is the Greek face (Times-metric-compatible, full polytonic coverage);
  // Inter is the UI face. Bundling Greek rather than using a platform font keeps
  // iOS and Android rendering identical. See src/theme/typography.ts.
  const [loaded, error] = useFonts({
    'Tinos': require('../assets/fonts/Tinos-Regular.ttf'),
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
