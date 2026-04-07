import 'react-native-reanimated';
import '@/src/i18n';

import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';

import { AppProviders } from '@/src/providers/AppProviders';

export { ErrorBoundary } from 'expo-router';

void SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions({
  duration: 300,
  fade: true,
});

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AppProviders>
  );
}
