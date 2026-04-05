import { ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { PropsWithChildren, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import i18n from '@/src/i18n';
import { appBootstrapService } from '@/src/services/app-bootstrap-service';
import { useAppStore } from '@/src/state/useAppStore';
import { createNavigationTheme } from '@/src/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Text } from '@/src/ui/base';

export function AppProviders({ children }: PropsWithChildren) {
  const language = useAppStore((state) => state.language);
  const bootstrapStatus = useAppStore((state) => state.bootstrapStatus);
  const bootstrapError = useAppStore((state) => state.bootstrapError);
  const { colorScheme, theme } = useAppTheme();

  useEffect(() => {
    void appBootstrapService.initialize().catch(() => undefined);
  }, []);

  useEffect(() => {
    void i18n.changeLanguage(language);
  }, [language]);

  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <ThemeProvider value={createNavigationTheme(theme)}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          {bootstrapStatus === 'ready' ? (
            children
          ) : (
            <View
              style={{
                alignItems: 'center',
                backgroundColor: theme.colors.background,
                flex: 1,
                justifyContent: 'center',
                paddingHorizontal: theme.spacing.xl,
              }}>
              <Text variant="title" weight="semibold">
                {bootstrapStatus === 'error'
                  ? i18n.t('bootstrap.errorTitle')
                  : i18n.t('bootstrap.loadingTitle')}
              </Text>
              <Text
                color="muted"
                style={{ marginTop: theme.spacing.md, textAlign: 'center' }}>
                {bootstrapStatus === 'error'
                  ? bootstrapError ?? i18n.t('bootstrap.errorBody')
                  : i18n.t('bootstrap.loadingBody')}
              </Text>
              {bootstrapStatus === 'error' ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void appBootstrapService.initialize()}
                  style={{
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.radii.pill,
                    marginTop: theme.spacing.xl,
                    paddingHorizontal: theme.spacing.xl,
                    paddingVertical: theme.spacing.md,
                  }}>
                  <Text style={{ color: theme.colors.textInverse }} weight="semibold">
                    {i18n.t('common.retry')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          )}
        </ThemeProvider>
      </SafeAreaProvider>
    </I18nextProvider>
  );
}
