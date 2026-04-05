import { getTabDefinition, TabRouteKey } from '@/src/features/tabs/config';
import { TabScreenTemplate } from '@/src/features/tabs/components/TabScreenTemplate';

type TabScreenProps = {
  tabKey: TabRouteKey;
};

export function TabScreen({ tabKey }: TabScreenProps) {
  const tabDefinition = getTabDefinition(tabKey);

  return (
    <TabScreenTemplate
      showPreferencesPanel={tabDefinition?.showPreferencesPanel}
      tabKey={tabKey}
    />
  );
}
