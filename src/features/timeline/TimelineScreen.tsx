import Ionicons from '@expo/vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  TimelineEditorSheet,
  TimelineFilterBar,
  TimelineListItem,
} from '@/src/features/timeline/components';
import { useTimelineScreen } from '@/src/features/timeline/useTimelineScreen';
import { useAppStore } from '@/src/state/useAppStore';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Screen, StateMessageCard, Text } from '@/src/ui/base';

export function TimelineScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const isFocused = useIsFocused();
  const selectedProfileId = useAppStore((state) => state.selectedProfileId);
  const timeline = useTimelineScreen(selectedProfileId, isFocused);

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
        ) : timeline.visibleItems.length === 0 ? (
          <StateMessageCard
            body={t('timeline.empty.body')}
            title={t('timeline.empty.title')}
          />
        ) : (
          <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
            {timeline.visibleItems.map((item) => (
              <TimelineListItem key={`${item.kind}_${item.id}`} item={item} onPress={() => void timeline.openItem(item)} />
            ))}
          </View>
        )}
      </Screen>

      <Pressable
        accessibilityLabel={t('timeline.newSymptom.cta')}
        accessibilityRole="button"
        onPress={() => void timeline.openNewSymptom()}
        style={{
          alignItems: 'center',
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radii.pill,
          bottom: theme.spacing.xxxl,
          flexDirection: 'row',
          gap: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          position: 'absolute',
          right: theme.spacing.xl,
          ...theme.shadows.floating,
        }}>
        <Ionicons color={theme.colors.textInverse} name="add" size={18} />
        <Text style={{ color: theme.colors.textInverse }} weight="semibold">
          {t('timeline.newSymptom.cta')}
        </Text>
      </Pressable>

      <TimelineEditorSheet
        appointmentDraft={timeline.appointmentDraft}
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
