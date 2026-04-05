import { TabRouteKey } from '@/src/features/tabs/config';
import { TabScreen } from '@/src/features/tabs/screens/TabScreen';

export function createTabRoute(tabKey: TabRouteKey) {
  return function TabRoute() {
    return <TabScreen tabKey={tabKey} />;
  };
}
