import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Appointment } from '@/src/domain/models';
import { AppointmentForm } from '@/src/features/appointments/components/AppointmentForm';
import {
  AppointmentDraft,
  createInitialAppointmentDraft,
  mapAppointmentToDraft,
  mapDraftToAppointmentInput,
} from '@/src/features/appointments/model';
import { useDraftState } from '@/src/hooks/useDraftState';
import { appointmentService } from '@/src/services';
import { useAppTheme } from '@/src/theme/useAppTheme';
import { Button, Screen, StateMessageCard, Text } from '@/src/ui/base';

export function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const { draft, patchDraft, resetDraft, setDraft } =
    useDraftState<AppointmentDraft>(createInitialAppointmentDraft);

  const loadAppointment = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const current = await appointmentService.getById(id);
      setAppointment(current);
      if (current) {
        setDraft(mapAppointmentToDraft(current));
      } else {
        resetDraft();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : t('appointments.detail.loadError'));
    } finally {
      setLoading(false);
    }
  }, [id, resetDraft, setDraft, t]);

  useEffect(() => {
    void loadAppointment();
  }, [loadAppointment]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeoutId = setTimeout(() => setFeedback(null), 2800);
    return () => clearTimeout(timeoutId);
  }, [feedback]);

  async function save() {
    if (!appointment || !draft.title.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const updated = await appointmentService.update(
        appointment.id,
        mapDraftToAppointmentInput(appointment.profileId, draft),
      );

      if (updated) {
        setAppointment(updated);
        setDraft(mapAppointmentToDraft(updated));
        setFeedback(t('appointments.detail.saved'));
        return;
      }

      setError(t('appointments.detail.notFoundBody'));
    } catch (error) {
      setError(error instanceof Error ? error.message : t('appointments.detail.saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!appointment) return;
    setError(null);

    try {
      await appointmentService.delete(appointment.id);
      router.back();
    } catch (error) {
      setError(error instanceof Error ? error.message : t('appointments.detail.deleteError'));
    }
  }

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button onPress={() => router.back()} title={t('appointments.detail.back')} variant="ghost" />
        <Text variant="title" weight="semibold">
          {t('appointments.detail.title')}
        </Text>
      </View>

      {loading ? (
        <StateMessageCard title={t('appointments.loading')} />
      ) : error && !appointment ? (
        <StateMessageCard
          actionLabel={t('common.retry')}
          body={error}
          onActionPress={() => void loadAppointment()}
          title={t('common.errorTitle')}
        />
      ) : !appointment ? (
        <StateMessageCard
          body={t('appointments.detail.notFoundBody')}
          title={t('appointments.detail.notFoundTitle')}
        />
      ) : (
        <View style={{ marginTop: theme.spacing.xl }}>
          {feedback ? <StateMessageCard title={feedback} /> : null}
          {error ? (
            <StateMessageCard
              actionLabel={t('common.retry')}
              body={error}
              onActionPress={() => void loadAppointment()}
              title={t('common.errorTitle')}
            />
          ) : null}
          <AppointmentForm
            draft={draft}
            onChange={patchDraft}
            onDelete={() => void remove()}
            onSubmit={() => void save()}
            submitLabel={saving ? t('appointments.detail.saving') : t('appointments.form.save')}
            title={appointment.title}
          />
        </View>
      )}
    </Screen>
  );
}
