import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  LOWER_JAW_SEGMENTS,
  TOTAL_TEETH_COUNT,
  UPPER_JAW_SEGMENTS,
} from '@/src/domain/teeth';
import { useFeatureAccess } from '@/src/features/monetization';
import { ToothEditSheet, ToothJawSection } from '@/src/features/map/components';
import { useToothMapScreen } from '@/src/features/map/useToothMapScreen';
import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';
import { useAppStore } from '@/src/state/useAppStore';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Card, Screen, StateMessageCard, Text } from '@/src/ui/base';

export function MapScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { isExpanded, isTablet, contentMaxWidth } = useResponsiveLayout();
  const isFocused = useIsFocused();
  const selectedProfileId = useAppStore((state) => state.selectedProfileId);
  const map = useToothMapScreen(selectedProfileId, isFocused);
  const hasFullMapAccess = useFeatureAccess('tooth_map_full');
  const visibleTeeth = map.teeth;

  return (
    <>
      <Screen contentContainerStyle={{ paddingBottom: theme.spacing.xxxxl }} contentMaxWidth={contentMaxWidth}>
        <Text color="primary" variant="caption" weight="semibold">
          {t('toothMap.header.kicker')}
        </Text>
        <Text style={{ marginTop: theme.spacing.sm }} variant="display" weight="bold">
          {t('toothMap.header.title')}
        </Text>
        <Text color="muted" style={{ marginTop: theme.spacing.md }}>
          {t('toothMap.header.description')}
        </Text>

        <View
          style={{
            flexDirection: isExpanded ? 'row' : 'column',
            gap: theme.spacing.lg,
            marginTop: theme.spacing.xl,
          }}>
          <Card style={{ flex: isExpanded ? 1 : undefined }}>
            <Text variant="title" weight="semibold">
              {t('toothMap.summary.title')}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                gap: theme.spacing.xl,
                marginTop: theme.spacing.lg,
              }}>
              <View style={{ flex: 1 }}>
                <Text color="muted" variant="caption">
                  {t('toothMap.summary.problemZones')}
                </Text>
                <Text style={{ marginTop: theme.spacing.xs }} variant="title" weight="bold">
                  {hasFullMapAccess ? map.problemZoneCount : '-'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text color="muted" variant="caption">
                  {t('toothMap.summary.totalTeeth')}
                </Text>
                <Text style={{ marginTop: theme.spacing.xs }} variant="title" weight="bold">
                  {TOTAL_TEETH_COUNT}
                </Text>
              </View>
            </View>
            <Text color="muted" style={{ marginTop: theme.spacing.lg }}>
              {t('toothMap.summary.helper')}
            </Text>
          </Card>

          {hasFullMapAccess ? (
            <Card style={{ flex: isExpanded ? 1 : undefined }}>
              <Text variant="title" weight="semibold">
                {t('toothMap.guide.title')}
              </Text>
              <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
                {t('toothMap.guide.body')}
              </Text>
              <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
                <Text color="muted">{t('toothMap.guide.pointOne')}</Text>
                <Text color="muted">{t('toothMap.guide.pointTwo')}</Text>
                <Text color="muted">{t('toothMap.guide.pointThree')}</Text>
              </View>
            </Card>
          ) : null}
        </View>

        {map.error ? (
          <StateMessageCard
            actionLabel={t('common.retry')}
            body={map.error}
            onActionPress={() => void map.reload()}
            title={t('common.errorTitle')}
          />
        ) : map.loading ? (
          <StateMessageCard title={t('toothMap.loading')} />
        ) : !hasFullMapAccess ? (
          <Card style={{ marginTop: theme.spacing.lg }}>
            <Text variant="title" weight="semibold">
              {t('toothMap.locked.title')}
            </Text>
            <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
              {t('toothMap.locked.body')}
            </Text>
            <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
              <Text color="muted">{t('toothMap.locked.pointOne')}</Text>
              <Text color="muted">{t('toothMap.locked.pointTwo')}</Text>
              <Text color="muted">{t('toothMap.locked.pointThree')}</Text>
            </View>
          </Card>
        ) : (
          <View
            style={{
              flexDirection: isTablet ? 'row' : 'column',
              flexWrap: 'wrap',
              gap: theme.spacing.lg,
              marginTop: theme.spacing.lg,
              width: '100%',
            }}>
            <View style={{ flex: 1, minWidth: isTablet ? 320 : undefined, width: '100%' }}>
              <ToothJawSection
                isInteractive
                onSelectTooth={map.openTooth}
                segments={UPPER_JAW_SEGMENTS}
                subtitle={t('toothMap.jaws.upperSubtitle')}
                teeth={visibleTeeth}
                title={t('toothMap.jaws.upper')}
              />
            </View>
            <View style={{ flex: 1, minWidth: isTablet ? 320 : undefined, width: '100%' }}>
              <ToothJawSection
                isInteractive
                onSelectTooth={map.openTooth}
                segments={LOWER_JAW_SEGMENTS}
                subtitle={t('toothMap.jaws.lowerSubtitle')}
                teeth={visibleTeeth}
                title={t('toothMap.jaws.lower')}
              />
            </View>
          </View>
        )}
      </Screen>

      <ToothEditSheet
        busy={map.editorBusy}
        error={map.editorError}
        history={map.history}
        note={map.draftNote}
        onChangeNote={map.setDraftNote}
        onChangeStatus={map.setDraftStatus}
        onClose={map.closeEditor}
        onSave={() => void map.saveTooth()}
        recordedAt={map.selectedTooth?.recordedAt ?? null}
        status={map.draftStatus}
        toothNumber={map.selectedToothNumber}
        visible={hasFullMapAccess && map.selectedToothNumber !== null}
      />
    </>
  );
}
