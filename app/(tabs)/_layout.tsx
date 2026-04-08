import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_DEFINITIONS, getTabDefinition } from '@/src/features/tabs/config';
import { useAppTheme } from '@/src/theme/useAppTheme';

export default function TabsLayout() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompactWidth = width < 390;
  const tabBarHeight = 64 + Math.max(insets.bottom, theme.spacing.sm);

  return (
    <Tabs
      initialRouteName="today"
      screenOptions={({ route }) => ({
        animation: 'fade',
        freezeOnBlur: true,
        headerShown: false,
        lazy: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, theme.spacing.sm),
        },
        tabBarItemStyle: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: isCompactWidth ? 2 : 4,
        },
        tabBarLabelStyle: {
          fontSize: isCompactWidth ? 11 : theme.typography.caption.fontSize,
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
