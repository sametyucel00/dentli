import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { DentistModeSummary } from '@/src/features/dentist-mode/model';
import { dentistModeService } from '@/src/features/dentist-mode/dentist-mode-service';
import { dentistModePdfExportService } from '@/src/features/dentist-mode/pdf-export-service';
import { ProAccessCard, useFeatureAccess } from '@/src/features/monetization';
import { useAppStore } from '@/src/state/useAppStore';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Button, Card, Screen, StateMessageCard, Text } from '@/src/ui/base';

export function DentistModeScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
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
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load summary.');
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

  return (
    <Screen>
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
          <Card>
            <Text variant="title" weight="semibold">
              {t('dentistMode.statsTitle')}
            </Text>
            <Text color="muted" style={{ marginTop: theme.spacing.sm }}>
              {t('dentistMode.periodLabel', { count: summary.periodDays })}
            </Text>
            <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
              <Text>{t('dentistMode.totalHygiene', { count: summary.stats.totalHygieneEvents })}</Text>
              <Text>{t('dentistMode.totalSymptoms', { count: summary.stats.totalSymptoms })}</Text>
              <Text>{t('dentistMode.totalAppointments', { count: summary.stats.totalAppointments })}</Text>
              <Text>{t('dentistMode.totalToothUpdates', { count: summary.stats.totalToothUpdates })}</Text>
            </View>
          </Card>

          <Card>
            <Text variant="title" weight="semibold">
              {t('dentistMode.hygieneRates')}
            </Text>
            <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
              <Text>{t('dentistMode.brushingRate', { count: summary.hygieneRates.brushingRate })}</Text>
              <Text>{t('dentistMode.flossRate', { count: summary.hygieneRates.flossRate })}</Text>
              <Text>{t('dentistMode.mouthwashRate', { count: summary.hygieneRates.mouthwashRate })}</Text>
            </View>
          </Card>

          <Card>
            <Text variant="title" weight="semibold">
              {t('dentistMode.problemTeeth')}
            </Text>
            <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
              {summary.problemTeeth.length === 0 ? (
                <Text color="muted">{t('dentistMode.noProblemTeeth')}</Text>
              ) : (
                summary.problemTeeth.map((item) => (
                  <Text key={item.toothNumber}>
                    {t('dentistMode.problemToothItem', {
                      toothNumber: item.toothNumber,
                      status: t(`toothMap.status.${item.status}`),
                      count: item.occurrences,
                    })}
                  </Text>
                ))
              )}
            </View>
          </Card>

          <Card>
            <Text variant="title" weight="semibold">
              {t('dentistMode.recentEvents')}
            </Text>
            <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
              {summary.recentEvents.map((event) => (
                <Text key={event.id}>
                  {event.title}
                  {event.detail ? ` - ${event.detail}` : ''}
                </Text>
              ))}
            </View>
          </Card>

          {hasPdfExportAccess ? (
            <Button onPress={() => void exportPdf()} title={t('dentistMode.exportPdf')} />
          ) : (
            <ProAccessCard
              body={t('monetization.gates.pdfExport.body')}
              featureKeys={['pdf_export']}
              title={t('monetization.gates.pdfExport.title')}
            />
          )}
          {exportUri ? (
            <Text color="muted">{t('dentistMode.exportReady', { uri: exportUri })}</Text>
          ) : null}
        </View>
      )}
    </Screen>
  );
}
