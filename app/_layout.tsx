import 'react-native-reanimated';
import '@/src/i18n';

import { Stack } from 'expo-router';

import { AppProviders } from '@/src/providers/AppProviders';

export { ErrorBoundary } from 'expo-router';

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
