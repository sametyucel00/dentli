import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppointmentCard } from '@/src/features/appointments/components/AppointmentCard';
import { AppointmentForm } from '@/src/features/appointments/components/AppointmentForm';
import { useAppointmentsScreen } from '@/src/features/appointments/useAppointmentsScreen';
import { useAppTheme } from '@/src/theme/useAppTheme';
import {
  BottomSheetModal,
  Button,
  FloatingActionButton,
  Screen,
  StateMessageCard,
  Text,
} from '@/src/ui/base';

export function AppointmentsScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const appointmentsScreen = useAppointmentsScreen();

  return (
    <>
      <Screen contentContainerStyle={{ paddingBottom: theme.spacing.xxxxl * 2 }}>
        <Text color="primary" variant="caption" weight="semibold">
          {t('appointments.header.kicker')}
        </Text>
        <Text style={{ marginTop: theme.spacing.sm }} variant="display" weight="bold">
          {t('appointments.header.title')}
        </Text>
        <Text color="muted" style={{ marginTop: theme.spacing.md }}>
          {t('appointments.header.description')}
        </Text>

        <StateMessageCard
          body={t('appointments.summary.body', { count: appointmentsScreen.upcomingCount })}
          title={t('appointments.summary.title')}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: theme.spacing.sm,
              justifyContent: 'center',
              marginTop: theme.spacing.sm,
            }}>
            <Button
              onPress={() => router.push('/dentist-mode')}
              style={{ minWidth: 0 }}
              title={t('appointments.summary.dentistMode')}
              variant="secondary"
            />
            <Button
              onPress={appointmentsScreen.openCreateSheet}
              style={{ minWidth: 0 }}
              title={t('appointments.summary.add')}
            />
          </View>
        </StateMessageCard>
        {appointmentsScreen.error ? (
          <StateMessageCard
            actionLabel={t('common.retry')}
            body={appointmentsScreen.error}
            onActionPress={() => void appointmentsScreen.reload()}
            title={t('common.errorTitle')}
          />
        ) : appointmentsScreen.loading ? (
          <StateMessageCard title={t('appointments.loading')} />
        ) : appointmentsScreen.appointments.length === 0 ? (
          <StateMessageCard
            body={t('appointments.empty.body')}
            title={t('appointments.empty.title')}
          />
        ) : (
          <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
            {appointmentsScreen.appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onPress={() => router.push(`/appointments/${appointment.id}`)}
              />
            ))}
          </View>
        )}
      </Screen>

      <FloatingActionButton
        accessibilityLabel={t('appointments.summary.add')}
        onPress={appointmentsScreen.openCreateSheet}
      />

      <BottomSheetModal
        minHeight={460}
        onClose={appointmentsScreen.closeCreateSheet}
        visible={appointmentsScreen.isCreateSheetVisible}>
        <AppointmentForm
          draft={appointmentsScreen.appointmentDraft}
          onChange={appointmentsScreen.patchAppointmentDraft}
          onSubmit={() => void appointmentsScreen.createAppointment()}
          submitLabel={t('appointments.form.create')}
          title={t('appointments.form.newTitle')}
        />
      </BottomSheetModal>
    </>
  );
}
