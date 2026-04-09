import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { DentistModeSummary } from '@/src/features/dentist-mode/model';
import { dentistModeService } from '@/src/features/dentist-mode/dentist-mode-service';
import { dentistModePdfExportService } from '@/src/features/dentist-mode/pdf-export-service';
import { ProAccessCard, useFeatureAccess } from '@/src/features/monetization';
import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';
import { useAppLocale } from '@/src/i18n/useAppLocale';
import { useAppStore } from '@/src/state/useAppStore';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Button, Card, Screen, StateMessageCard, Text } from '@/src/ui/base';

function getRecentEventTitle(
  event: DentistModeSummary['recentEvents'][number],
  t: ReturnType<typeof useTranslation>['t'],
) {
  if (event.type === 'hygiene') {
    if (event.title === 'morning_brush') return t('today.actions.morningBrush');
    if (event.title === 'night_brush') return t('today.actions.nightBrush');
    if (event.title === 'floss') return t('today.actions.floss');
    if (event.title === 'mouthwash') return t('today.actions.mouthwash');
    return t(`timeline.hygiene.${event.title}`);
  }

  if (event.type === 'symptom') {
    return t(`timeline.symptoms.${event.title}`);
  }

  if (event.type === 'tooth') {
    const toothNumber = event.title.replace(/\D+/g, '');
    return t('timeline.toothUpdateLink', { toothNumber });
  }

  return event.title;
}

function getRecentEventDetail(
  event: DentistModeSummary['recentEvents'][number],
  t: ReturnType<typeof useTranslation>['t'],
) {
  if (
    !event.detail ||
    event.detail === 'timer_completion' ||
    event.detail === event.id ||
    event.detail.includes('extra_same_day_log')
  ) {
    return null;
  }

  const normalizedDetail = event.detail.replaceAll('â€¢', '·').trim();

  if (event.type === 'tooth' && event.detail) {
    return t(`toothMap.status.${normalizedDetail}`);
  }

  return normalizedDetail;
}

function StatTile({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  const { theme } = useAppTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceMuted,
        borderRadius: theme.radii.md,
        flexBasis: '48%',
        flexGrow: 1,
        maxWidth: '48%',
        minWidth: 0,
        padding: theme.spacing.lg,
      }}>
      <Text color="muted" style={{ minHeight: 32, textAlign: 'center' }} variant="caption">
        {label}
      </Text>
      <Text style={{ marginTop: theme.spacing.xs, textAlign: 'center' }} variant="title" weight="bold">
        {value}
      </Text>
    </View>
  );
}

function RateBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const { theme } = useAppTheme();
  const safeValue = Math.max(0, Math.min(value, 100));

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text weight="medium">{label}</Text>
        <Text color="muted">{safeValue}%</Text>
      </View>
      <View
        style={{
          backgroundColor: theme.colors.surfaceMuted,
          borderRadius: theme.radii.pill,
          height: 10,
          overflow: 'hidden',
        }}>
        <View
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radii.pill,
            height: '100%',
            width: `${safeValue}%`,
          }}
        />
      </View>
    </View>
  );
}

export function DentistModeScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { isTablet, isExpanded, contentMaxWidth } = useResponsiveLayout();
  const locale = useAppLocale();
  const selectedProfileId = useAppStore((state) => state.selectedProfileId);
  const [summary, setSummary] = useState<DentistModeSummary | null>(null);
  const [exportUri, setExportUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasDentistModeAccess = useFeatureAccess('dentist_mode');
  const hasPdfExportAccess = useFeatureAccess('pdf_export');

  const load = useCallback(async () => {
    if (!selectedProfileId || !hasDentistModeAccess) {
      setSummary(null);
      setError(null);
      return;
    }

    setError(null);

    try {
      setSummary(await dentistModeService.load(selectedProfileId));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to load summary.');
    }
  }, [hasDentistModeAccess, selectedProfileId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function exportPdf() {
    if (!summary || !hasPdfExportAccess) return;
    const file = await dentistModePdfExportService.export(summary);
    setExportUri(file.uri);
  }

  const generatedLabel = useMemo(() => {
    if (!summary) return null;

    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(summary.generatedAt));
  }, [locale, summary]);

  return (
    <Screen contentMaxWidth={contentMaxWidth}>
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button onPress={() => router.back()} title={t('dentistMode.back')} variant="ghost" />
        <Text variant="title" weight="semibold">
          {t('dentistMode.title')}
        </Text>
      </View>

      {!hasDentistModeAccess ? (
        <ProAccessCard
          body={t('monetization.gates.dentistMode.body')}
          featureKeys={['dentist_mode', 'pdf_export']}
          title={t('monetization.gates.dentistMode.title')}
        />
      ) : error ? (
        <StateMessageCard
          actionLabel={t('common.retry')}
          body={error}
          onActionPress={() => void load()}
          title={t('common.errorTitle')}
        />
      ) : !summary ? (
        <StateMessageCard title={t('dentistMode.loading')} />
      ) : (
        <View style={{ gap: theme.spacing.lg, marginTop: theme.spacing.xl }}>
          <View style={{ flexDirection: isExpanded ? 'row' : 'column', gap: theme.spacing.lg }}>
          <Card style={{ flex: isExpanded ? 1.1 : undefined }}>
            <Text color="primary" variant="caption" weight="semibold">
              {t('dentistMode.statsTitle')}
            </Text>
            <Text style={{ marginTop: theme.spacing.xs }} variant="title" weight="semibold">
              {t('dentistMode.periodLabel', { count: summary.periodDays })}
            </Text>
            {generatedLabel ? (
              <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
                {t('dentistMode.generatedAt', { value: generatedLabel })}
              </Text>
            ) : null}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: theme.spacing.md,
                justifyContent: 'space-between',
                marginTop: theme.spacing.lg,
              }}>
              <StatTile
                label={t('dentistMode.totalHygieneShort')}
                value={summary.stats.totalHygieneEvents}
              />
              <StatTile
                label={t('dentistMode.totalSymptomsShort')}
                value={summary.stats.totalSymptoms}
              />
              <StatTile
                label={t('dentistMode.totalAppointmentsShort')}
                value={summary.stats.totalAppointments}
              />
              <StatTile
                label={t('dentistMode.totalToothUpdatesShort')}
                value={summary.stats.totalToothUpdates}
              />
            </View>
          </Card>

          <Card style={{ flex: isExpanded ? 1 : undefined }}>
            <Text variant="title" weight="semibold">
              {t('dentistMode.hygieneRates')}
            </Text>
            <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
              <RateBar
                label={t('profile.analytics.metrics.brushing')}
                value={summary.hygieneRates.brushingRate}
              />
              <RateBar
                label={t('profile.analytics.metrics.floss')}
                value={summary.hygieneRates.flossRate}
              />
              <RateBar
                label={t('profile.analytics.metrics.mouthwash')}
                value={summary.hygieneRates.mouthwashRate}
              />
            </View>
          </Card>
          </View>

          <View style={{ flexDirection: isExpanded ? 'row' : 'column', gap: theme.spacing.lg }}>
          <Card style={{ flex: isExpanded ? 0.95 : undefined }}>
            <Text variant="title" weight="semibold">
              {t('dentistMode.problemTeeth')}
            </Text>
            <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
              {summary.problemTeeth.length === 0 ? (
                <Text color="muted">{t('dentistMode.noProblemTeeth')}</Text>
              ) : (
                summary.problemTeeth.map((item) => (
                  <View
                    key={item.toothNumber}
                    style={{
                      backgroundColor: theme.colors.surfaceMuted,
                      borderRadius: theme.radii.md,
                      padding: theme.spacing.md,
                    }}>
                    <Text weight="semibold">
                      {t('dentistMode.problemToothItem', {
                        toothNumber: item.toothNumber,
                        status: t(`toothMap.status.${item.status}`),
                        count: item.occurrences,
                      })}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </Card>

          <Card style={{ flex: isExpanded ? 1.05 : undefined }}>
            <Text variant="title" weight="semibold">
              {t('dentistMode.recentEvents')}
            </Text>
            <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
              {summary.recentEvents.map((event) => (
                <View
                  key={event.id}
                  style={{
                    backgroundColor: theme.colors.surfaceMuted,
                    borderRadius: theme.radii.md,
                    padding: theme.spacing.md,
                  }}>
                  <Text weight="semibold">{getRecentEventTitle(event, t)}</Text>
                  {getRecentEventDetail(event, t) ? (
                    <Text color="muted" style={{ marginTop: theme.spacing.xs }}>
                      {getRecentEventDetail(event, t)}
                    </Text>
                  ) : null}
                  <Text color="muted" style={{ marginTop: theme.spacing.sm }} variant="caption">
                    {new Intl.DateTimeFormat(locale, {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(event.timestamp))}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
          </View>

          {hasPdfExportAccess ? (
            <Card
              style={{
                alignItems: 'center',
                alignSelf: isTablet ? 'center' : undefined,
                width: isTablet ? '100%' : undefined,
              }}>
              <Button
                onPress={() => void exportPdf()}
                style={{ minWidth: 240 }}
                title={t('dentistMode.exportPdf')}
              />
              {exportUri ? (
                <Text color="muted" style={{ marginTop: theme.spacing.md }}>
                  {t('dentistMode.exportReady', { uri: exportUri })}
                </Text>
              ) : null}
            </Card>
          ) : (
            <ProAccessCard
              body={t('monetization.gates.pdfExport.body')}
              featureKeys={['pdf_export']}
              title={t('monetization.gates.pdfExport.title')}
            />
          )}
        </View>
      )}
    </Screen>
  );
}
