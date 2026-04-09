import { useTranslation } from 'react-i18next';
import { View, useWindowDimensions } from 'react-native';

import { CareItemCard } from '@/src/features/care/components/CareItemCard';
import { CareItemForm } from '@/src/features/care/components/CareItemForm';
import { useFeatureAccess } from '@/src/features/monetization';
import { useCareScreen } from '@/src/features/care/useCareScreen';
import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';
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
  const { isTablet, formMaxWidth, contentMaxWidth } = useResponsiveLayout();
  const { width } = useWindowDimensions();
  const careScreen = useCareScreen();
  const hasFullCareInventoryAccess = useFeatureAccess('care_full_inventory');
  const useTwoColumnMobile = width >= 320 && !isTablet;
  const useTwoColumnLayout = isTablet || useTwoColumnMobile;
  const horizontalPadding = width < 390 ? theme.spacing.lg : theme.spacing.xl;
  const twoColumnCardWidth = (width - horizontalPadding * 2 - theme.spacing.md) / 2;

  return (
    <>
      <Screen
        contentContainerStyle={{ paddingBottom: theme.spacing.xxxxl * 2 }}
        contentMaxWidth={contentMaxWidth}>
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
          bodyNumberOfLines={2}
          title={t('careTracking.summary.title')}>
          <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
            <Button
              onPress={careScreen.openCreateEditor}
              style={{ alignSelf: 'center', width: isTablet ? undefined : '72%' }}
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
          <View
            style={{
              flexDirection: useTwoColumnLayout ? 'row' : 'column',
              flexWrap: 'wrap',
              gap: theme.spacing.md,
              justifyContent: useTwoColumnLayout ? 'space-between' : 'flex-start',
              marginTop: theme.spacing.lg,
              width: '100%',
            }}>
            {careScreen.careItems.map((item) => (
              <View
                key={item.id}
                style={{
                  alignSelf: 'stretch',
                  flexBasis: useTwoColumnMobile ? twoColumnCardWidth : useTwoColumnLayout ? '48.5%' : '100%',
                  flexGrow: 0,
                  maxWidth: useTwoColumnMobile ? twoColumnCardWidth : useTwoColumnLayout ? '48.5%' : '100%',
                  minWidth: 0,
                  width: useTwoColumnMobile ? twoColumnCardWidth : useTwoColumnLayout ? undefined : '100%',
                }}>
                <CareItemCard
                  item={item}
                  onPress={() => careScreen.openEditEditor(item)}
                />
              </View>
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
        <View style={{ alignSelf: 'center', maxWidth: formMaxWidth, width: '100%' }}>
          <CareItemForm
            allowAdvancedTypes={
              hasFullCareInventoryAccess ||
              !!careScreen.editingItem?.itemType &&
                ['interdental_brush', 'water_flosser'].includes(
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
        </View>
      </BottomSheetModal>
    </>
  );
}
