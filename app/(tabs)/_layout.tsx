import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_DEFINITIONS, getTabDefinition } from '@/src/features/tabs/config';
import { useAppTheme } from '@/src/theme/useAppTheme';

export default function TabsLayout() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 64 + Math.max(insets.bottom, theme.spacing.sm);

  return (
    <Tabs
      initialRouteName="today"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, theme.spacing.sm),
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.caption.fontSize,
          fontWeight: '600',
        },
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
        tabBarIcon: ({ color, size }) => {
          const tabDefinition = getTabDefinition(route.name);

          return (
            <Ionicons
              color={color}
              name={tabDefinition?.icon ?? 'ellipse-outline'}
              size={size}
            />
          );
        },
      })}>
      {TAB_DEFINITIONS.map((tab) => (
        <Tabs.Screen
          key={tab.key}
          name={tab.key}
          options={{ title: t(tab.titleKey) }}
        />
      ))}
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
