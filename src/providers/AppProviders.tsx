import { ThemeProvider } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as NavigationBar from 'expo-navigation-bar';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { AppState, Image, Platform, Pressable, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OnboardingScreen } from '@/src/features/onboarding/OnboardingScreen';
import i18n from '@/src/i18n';
import { appBootstrapService } from '@/src/services/app-bootstrap-service';
import { useAppStore } from '@/src/state/useAppStore';
import { createNavigationTheme } from '@/src/theme';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Text } from '@/src/ui/base';

const EMPTY_PROFILES: { id: string }[] = [];
const MIN_LAUNCH_SCREEN_MS = 2800;

export function AppProviders({ children }: PropsWithChildren) {
  const bootstrapStatus = useAppStore((state) => state.bootstrapStatus);
  const bootstrapError = useAppStore((state) => state.bootstrapError);
  const appPreferences = useAppStore((state) => state.appPreferences);
  const profiles = useAppStore((state) => state.cache.profiles?.data ?? EMPTY_PROFILES);
  const { colorScheme, theme } = useAppTheme();
  const splashHiddenRef = useRef(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockError, setLockError] = useState<string | null>(null);
  const [minimumLaunchElapsed, setMinimumLaunchElapsed] = useState(false);
  const [launchScreenReady, setLaunchScreenReady] = useState(false);
  const authInFlightRef = useRef(false);
  const launchSlogan = 'Personal oral care system';

  const authenticate = useCallback(async () => {
    if (
      Platform.OS === 'web' ||
      bootstrapStatus !== 'ready' ||
      !appPreferences.biometricLockEnabled ||
      authInFlightRef.current
    ) {
      return;
    }

    authInFlightRef.current = true;
    setIsLocked(true);
    setLockError(null);

    try {
      const result = await LocalAuthentication.authenticateAsync({
        cancelLabel: i18n.t('common.retry'),
        fallbackLabel: i18n.t('profile.settings.biometricFallback'),
        promptMessage: i18n.t('profile.settings.biometricPrompt'),
      });

      if (result.success) {
        setIsLocked(false);
      } else {
        setLockError(i18n.t('profile.settings.biometricFailed'));
      }
    } catch {
      setLockError(i18n.t('profile.settings.biometricFailed'));
    } finally {
      authInFlightRef.current = false;
    }
  }, [appPreferences.biometricLockEnabled, bootstrapStatus]);

  useEffect(() => {
    void appBootstrapService.initialize().catch(() => undefined);
  }, []);

  useEffect(() => {
    void i18n.changeLanguage('en');
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const syncNavigationBar = async () => {
      try {
        await NavigationBar.setPositionAsync('absolute');
        await NavigationBar.setBehaviorAsync('overlay-swipe');
        await NavigationBar.setButtonStyleAsync(colorScheme === 'dark' ? 'light' : 'dark');
        await NavigationBar.setVisibilityAsync('hidden');
      } catch {
        // Best-effort only.
      }
    };

    void syncNavigationBar();
  }, [colorScheme]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setMinimumLaunchElapsed(true);
    }, MIN_LAUNCH_SCREEN_MS);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!minimumLaunchElapsed || bootstrapStatus === 'loading') {
      return;
    }

    setLaunchScreenReady(true);

    if (splashHiddenRef.current) {
      return;
    }

    void SplashScreen.hideAsync()
      .then(() => {
        splashHiddenRef.current = true;
      })
      .catch(() => undefined);
  }, [bootstrapStatus, minimumLaunchElapsed]);

  useEffect(() => {
    if (bootstrapStatus !== 'ready' || !appPreferences.biometricLockEnabled) {
      setIsLocked(false);
      setLockError(null);
      return;
    }

    void authenticate();
  }, [appPreferences.biometricLockEnabled, authenticate, bootstrapStatus]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && appPreferences.biometricLockEnabled) {
        void authenticate();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [appPreferences.biometricLockEnabled, authenticate]);

  const shouldShowOnboarding =
    bootstrapStatus === 'ready' &&
    profiles.length === 0 &&
    !appPreferences.onboardingCompleted;
  const shouldShowLaunchScreen = bootstrapStatus === 'loading' || !launchScreenReady;

  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
        <ThemeProvider value={createNavigationTheme(theme)}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          {!shouldShowLaunchScreen ? (
            <>
              {shouldShowOnboarding ? <OnboardingScreen /> : children}
              {isLocked ? (
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: theme.colors.background,
                    bottom: 0,
                    justifyContent: 'center',
                    left: 0,
                    paddingHorizontal: theme.spacing.xl,
                    position: 'absolute',
                    right: 0,
                    top: 0,
                  }}>
                  <Text variant="title" weight="semibold">
                    {i18n.t('profile.settings.biometricPrompt')}
                  </Text>
                  <Text
                    color="muted"
                    style={{ marginTop: theme.spacing.md, textAlign: 'center' }}>
                    {lockError ?? i18n.t('profile.settings.biometricBody')}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void authenticate()}
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
                </View>
              ) : null}
            </>
          ) : (
            <View
              style={{
                alignItems: 'center',
                backgroundColor: '#081824',
                flex: 1,
                justifyContent: 'center',
                paddingHorizontal: theme.spacing.xl,
              }}>
              <View
                style={{
                  alignItems: 'center',
                  marginBottom: theme.spacing.xxxl,
                }}>
                <Image
                  source={require('../../assets/images/splash-icon.png')}
                  style={{
                    height: 88,
                    marginBottom: theme.spacing.lg,
                    width: 88,
                  }}
                />
                <Text variant="display" weight="bold">
                  Dentli
                </Text>
                <Text
                  style={{
                    color: '#D7F1EC',
                    marginTop: theme.spacing.sm,
                    textAlign: 'center',
                  }}>
                  {launchSlogan}
                </Text>
              </View>
              {bootstrapStatus === 'error' ? (
                <>
                  <Text variant="title" weight="semibold">
                    {i18n.t('bootstrap.errorTitle')}
                  </Text>
                  <Text
                    color="muted"
                    style={{ marginTop: theme.spacing.md, textAlign: 'center' }}>
                    {bootstrapError ?? i18n.t('bootstrap.errorBody')}
                  </Text>
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
                </>
              ) : null}
            </View>
          )}
        </ThemeProvider>
      </SafeAreaProvider>
    </I18nextProvider>
  );
}
