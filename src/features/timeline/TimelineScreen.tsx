import { useIsFocused } from '@react-navigation/native';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFeatureAccess } from '@/src/features/monetization';
import {
  TimelineEditorSheet,
  TimelineFilterBar,
  TimelineListItem,
} from '@/src/features/timeline/components';
import { useTimelineScreen } from '@/src/features/timeline/useTimelineScreen';
import { useAppStore } from '@/src/state/useAppStore';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { FloatingActionButton, Screen, StateMessageCard, Text } from '@/src/ui/base';

export function TimelineScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const selectedProfileId = useAppStore((state) => state.selectedProfileId);
  const timeline = useTimelineScreen(selectedProfileId, isFocused);
  const hasFullTimelineAccess = useFeatureAccess('timeline_full');
  const visibleItems = hasFullTimelineAccess
    ? timeline.visibleItems
    : timeline.visibleItems.filter(
        (item) =>
          new Date(item.occurredAt).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000,
      );

  return (
    <>
      <Screen contentContainerStyle={{ paddingBottom: theme.spacing.xxxxl * 2 }}>
        <Text color="primary" variant="caption" weight="semibold">
          {t('timeline.header.kicker')}
        </Text>
        <Text style={{ marginTop: theme.spacing.sm }} variant="display" weight="bold">
          {t('timeline.header.title')}
        </Text>
        <Text color="muted" style={{ marginTop: theme.spacing.md }}>
          {t('timeline.header.description')}
        </Text>

        <View style={{ marginTop: theme.spacing.xl }}>
          <TimelineFilterBar
            labelMap={(value) => t(`timeline.filters.${value}`)}
            onChange={timeline.setFilter}
            value={timeline.filter}
          />
        </View>

        {timeline.error ? (
          <StateMessageCard
            actionLabel={t('common.retry')}
            body={timeline.error}
            onActionPress={() => void timeline.reload()}
            title={t('common.errorTitle')}
          />
        ) : timeline.loading ? (
          <StateMessageCard title={t('timeline.loading')} />
        ) : visibleItems.length === 0 ? (
          <StateMessageCard
            body={t('timeline.empty.body')}
            title={t('timeline.empty.title')}
          />
        ) : (
          <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
            {visibleItems.map((item) => (
              <TimelineListItem key={`${item.kind}_${item.id}`} item={item} onPress={() => void timeline.openItem(item)} />
            ))}
          </View>
        )}
      </Screen>

      <FloatingActionButton
        accessibilityLabel={t('timeline.newSymptom.cta')}
        bottomOffset={40 + insets.bottom}
        onPress={() => void timeline.openNewSymptom()}
      />

      <TimelineEditorSheet
        appointmentDraft={timeline.appointmentDraft}
        busy={timeline.editorBusy}
        error={timeline.editorError}
        hygieneDraft={timeline.hygieneDraft}
        item={timeline.selectedItem}
        onChangeAppointmentDraft={timeline.setAppointmentDraft}
        onChangeHygieneDraft={timeline.setHygieneDraft}
        onChangeSymptomDraft={timeline.setSymptomDraft}
        onChangeToothDraft={timeline.setToothDraft}
        onClose={timeline.closeEditor}
        onCreateSymptom={() => void timeline.createSymptom()}
        onDelete={() => void timeline.deleteSelectedItem()}
        onSave={() => void timeline.saveEditor()}
        symptomDraft={timeline.symptomDraft}
        toothDraft={timeline.toothDraft}
        visible={timeline.creatingSymptom || timeline.selectedItem !== null}
      />
    </>
  );
}
