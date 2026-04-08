import { useIsFocused } from '@react-navigation/native';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  formatDateTime,
  formatLongDate,
  formatTime,
} from '@/src/features/today/formatters';
import {
  TodayActionRow,
  TodaySheetContent,
  TodayStatusRow,
} from '@/src/features/today/components';
import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';
import { useAppLocale } from '@/src/i18n/useAppLocale';
import { useTodayScreen } from '@/src/features/today/useTodayScreen';
import { useAppStore } from '@/src/state/useAppStore';
import { useAppTheme } from '@/src/theme/useAppTheme';
import {
  ActionBanner,
  BottomSheetModal,
  Card,
  FloatingActionButton,
  Screen,
  StateMessageCard,
  Text,
} from '@/src/ui/base';

export function TodayScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { isExpanded, isTablet, readingMaxWidth } = useResponsiveLayout();
  const isFocused = useIsFocused();
  const locale = useAppLocale();
  const selectedProfileId = useAppStore((state) => state.selectedProfileId);
  const today = useTodayScreen(selectedProfileId, isFocused);
  const feedbackActionLabel = today.actionFeedback
    ? t(
        today.visibleActions.find((item) => item.key === today.actionFeedback?.actionKey)
          ?.titleKey ?? 'today.header.kicker',
      )
    : '';
  const toothbrushCountdownLabel =
    today.quickStatus.toothbrushDaysLeft === null
      ? t('today.status.notTracked')
      : today.quickStatus.toothbrushDaysLeft <= 0
        ? t('today.status.replaceNow')
        : t('today.status.daysLeft', { count: today.quickStatus.toothbrushDaysLeft });

  return (
    <>
      <Screen
        contentContainerStyle={{ paddingBottom: theme.spacing.xxxxl * 2 }}
        contentMaxWidth={readingMaxWidth}>
        <Text color="primary" variant="caption" weight="semibold">
          {t('today.header.kicker')}
        </Text>
        <Text variant="display" weight="bold" style={{ marginTop: theme.spacing.xs }}>
          {formatLongDate(new Date(), locale)}
        </Text>
        <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
          {t('today.header.subtitle')}
        </Text>

        {today.actionFeedback ? (
          <ActionBanner
            actionLabel={t('today.feedback.undo')}
            message={t(
              today.actionFeedback.completed
                ? 'today.feedback.completed'
                : 'today.feedback.undone',
              { action: feedbackActionLabel },
            )}
            onActionPress={() => void today.undoLastAction()}
          />
        ) : null}

        <View
          style={{
            flexDirection: isExpanded ? 'row' : 'column',
            gap: theme.spacing.lg,
            marginTop: theme.spacing.xl,
          }}>
          <View style={{ flex: isExpanded ? 1.45 : undefined }}>
            <Card style={{ paddingVertical: theme.spacing.md }}>
              <Text
                color="muted"
                style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.sm }}
                variant="caption">
                {t('today.actions.sectionTitle')}
              </Text>
              {today.error ? (
                <View style={{ paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md }}>
                  <Text weight="semibold">{t('common.errorTitle')}</Text>
                  <Text color="muted" style={{ marginTop: theme.spacing.xs }}>
                    {today.error}
                  </Text>
                </View>
              ) : today.loading ? (
                <View style={{ paddingVertical: theme.spacing.xl }}>
                  <Text color="muted">{t('today.loading')}</Text>
                </View>
              ) : (
                today.visibleActions.map((action, index) => (
                  <TodayActionRow
                    key={action.key}
                    action={action}
                    completed={today.actionState[action.key].completed}
                    helperLabel={t(
                      today.actionState[action.key].completed
                        ? 'today.actions.undoHint'
                        : 'today.actions.tapHint',
                    )}
                    isLast={index === today.visibleActions.length - 1}
                    label={t(action.titleKey)}
                    onPress={() => void today.toggleAction(action.key)}
                    optionalLabel={t('today.actions.optional')}
                  />
                ))
              )}
            </Card>
          </View>

          <View style={{ flex: isExpanded ? 1 : undefined, gap: theme.spacing.lg }}>
            <Card>
              <Text variant="title" weight="semibold">
                {t('today.status.title')}
              </Text>
              <View style={{ marginTop: theme.spacing.lg, gap: theme.spacing.md }}>
                <TodayStatusRow
                  label={t('today.status.lastBrush')}
                  value={formatTime(today.quickStatus.lastBrushAt, locale, t('today.status.notYet'))}
                />
                <TodayStatusRow
                  label={t('today.status.lastFloss')}
                  value={formatTime(today.quickStatus.lastFlossAt, locale, t('today.status.notYet'))}
                />
                <TodayStatusRow
                  accent={today.quickStatus.toothbrushDaysLeft !== null && today.quickStatus.toothbrushDaysLeft <= 7}
                  label={t('today.status.toothbrush')}
                  value={toothbrushCountdownLabel}
                />
                <TodayStatusRow
                  accent={today.quickStatus.nextDentalCheckAt === null}
                  label={t('today.status.nextCheck')}
                  value={formatDateTime(
                    today.quickStatus.nextDentalCheckAt,
                    locale,
                    t('today.status.notScheduled'),
                  )}
                />
              </View>
            </Card>

            {today.error ? (
              <StateMessageCard
                actionLabel={t('common.retry')}
                body={today.error}
                onActionPress={() => void today.reload()}
                title={t('common.errorTitle')}
              />
            ) : today.insights.length > 0 ? (
              <Card
                style={{
                  backgroundColor:
                    today.insights.some((insight) => insight.tone === 'warning')
                      ? theme.colors.surfaceAccent
                      : theme.colors.surface,
                }}>
                <Text variant="title" weight="semibold">
                  {t('profile.insights.title')}
                </Text>
                <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
                  {today.insights.map((insight) => (
                    <View key={insight.id}>
                      <Text weight="semibold">{t(insight.titleKey)}</Text>
                      <Text color="muted" style={{ marginTop: theme.spacing.xs }}>
                        {t(insight.bodyKey, insight.bodyValues)}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            ) : !isTablet ? null : (
              <Card>
                <Text variant="title" weight="semibold">
                  {t('today.status.title')}
                </Text>
                <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
                  {t('today.header.subtitle')}
                </Text>
              </Card>
            )}
          </View>
        </View>
      </Screen>

      <FloatingActionButton
        accessibilityLabel={t('today.sheet.title')}
        onPress={() => today.openSheet('actions')}
      />

      <BottomSheetModal onClose={today.closeSheet} visible={today.sheetMode !== null}>
        <TodaySheetContent today={today} />
      </BottomSheetModal>
    </>
  );
}
