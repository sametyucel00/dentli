import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { CareItemCard } from '@/src/features/care/components/CareItemCard';
import { CareItemForm } from '@/src/features/care/components/CareItemForm';
import { useFeatureAccess } from '@/src/features/monetization';
import { useCareScreen } from '@/src/features/care/useCareScreen';
import { useAppTheme } from '@/src/theme/useAppTheme';
import {
  BottomSheetModal,
  Button,
  FloatingActionButton,
  Screen,
  StateMessageCard,
  Text,
} from '@/src/ui/base';

export function CareScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const careScreen = useCareScreen();
  const hasFullCareInventoryAccess = useFeatureAccess('care_full_inventory');

  return (
    <>
      <Screen contentContainerStyle={{ paddingBottom: theme.spacing.xxxxl * 2 }}>
        <Text color="primary" variant="caption" weight="semibold">
          {t('careTracking.header.kicker')}
        </Text>
        <Text style={{ marginTop: theme.spacing.sm }} variant="display" weight="bold">
          {t('careTracking.header.title')}
        </Text>
        <Text color="muted" style={{ marginTop: theme.spacing.md }}>
          {t('careTracking.header.description')}
        </Text>

        <StateMessageCard
          body={t('careTracking.summary.body', { count: careScreen.dueSoonCount })}
          title={t('careTracking.summary.title')}>
          <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
            <Button
              onPress={careScreen.openCreateEditor}
              style={{ alignSelf: 'center' }}
              title={t('careTracking.summary.add')}
            />
            {!hasFullCareInventoryAccess ? (
              <Text color="muted" variant="caption">
                {t('careTracking.summary.freeHint')}
              </Text>
            ) : null}
          </View>
        </StateMessageCard>

        {careScreen.error ? (
          <StateMessageCard
            actionLabel={t('common.retry')}
            body={careScreen.error}
            onActionPress={() => void careScreen.reload()}
            title={t('common.errorTitle')}
          />
        ) : careScreen.loading ? (
          <StateMessageCard title={t('careTracking.loading')} />
        ) : careScreen.careItems.length === 0 ? (
          <StateMessageCard
            body={t('careTracking.empty.body')}
            title={t('careTracking.empty.title')}
          />
        ) : (
          <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
            {careScreen.careItems.map((item) => (
              <CareItemCard
                key={item.id}
                item={item}
                onPress={() => careScreen.openEditEditor(item)}
              />
            ))}
          </View>
        )}
      </Screen>

      <FloatingActionButton
        accessibilityLabel={t('careTracking.summary.add')}
        onPress={careScreen.openCreateEditor}
      />

      <BottomSheetModal
        minHeight={440}
        onClose={careScreen.closeEditor}
        visible={careScreen.isEditorVisible}>
        <CareItemForm
          allowAdvancedTypes={
            hasFullCareInventoryAccess ||
            !!careScreen.editingItem?.itemType &&
              ['interdental_brush', 'water_flosser', 'other'].includes(
                careScreen.editingItem.itemType,
              )
          }
          draft={careScreen.careItemDraft}
          onChange={careScreen.patchCareItemDraft}
          onDelete={careScreen.editingItem ? () => void careScreen.deleteCareItem() : undefined}
          onSubmit={() => void careScreen.saveCareItem()}
          submitLabel={
            careScreen.editingItem
              ? t('careTracking.form.save')
              : t('careTracking.form.create')
          }
          title={
            careScreen.editingItem
              ? careScreen.editingItem.title
              : t('careTracking.form.newTitle')
          }
        />
      </BottomSheetModal>
    </>
  );
}
