import Ionicons from '@expo/vector-icons/Ionicons';

export type TabRouteKey =
  | 'today'
  | 'map'
  | 'timeline'
  | 'care'
  | 'appointments'
  | 'profile';

export type TabDefinition = {
  key: TabRouteKey;
  titleKey: `tabs.${TabRouteKey}`;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  showPreferencesPanel?: boolean;
};

export const TAB_DEFINITIONS: TabDefinition[] = [
  {
    key: 'today',
    titleKey: 'tabs.today',
    icon: 'today-outline',
  },
  {
    key: 'map',
    titleKey: 'tabs.map',
    icon: 'map-outline',
  },
  {
    key: 'timeline',
    titleKey: 'tabs.timeline',
    icon: 'git-branch-outline',
  },
  {
    key: 'care',
    titleKey: 'tabs.care',
    icon: 'medkit-outline',
  },
  {
    key: 'appointments',
    titleKey: 'tabs.appointments',
    icon: 'calendar-outline',
  },
  {
    key: 'profile',
    titleKey: 'tabs.profile',
    icon: 'person-circle-outline',
    showPreferencesPanel: true,
  },
] as const;

export function getTabDefinition(routeKey: string) {
  return TAB_DEFINITIONS.find((definition) => definition.key === routeKey);
}
