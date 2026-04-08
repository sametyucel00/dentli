import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View, useWindowDimensions } from 'react-native';

import { AppointmentCard } from '@/src/features/appointments/components/AppointmentCard';
import { AppointmentForm } from '@/src/features/appointments/components/AppointmentForm';
import { useAppointmentsScreen } from '@/src/features/appointments/useAppointmentsScreen';
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

export function AppointmentsScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { isTablet, formMaxWidth, contentMaxWidth } = useResponsiveLayout();
  const { width } = useWindowDimensions();
  const useTwoColumnMobile = width >= 360 && !isTablet;
  const useTwoColumnLayout = isTablet || useTwoColumnMobile;
  const appointmentsScreen = useAppointmentsScreen();

  return (
    <>
      <Screen
        contentContainerStyle={{ paddingBottom: theme.spacing.xxxxl * 2 }}
        contentMaxWidth={contentMaxWidth}>
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
              flexDirection: isTablet ? 'row' : 'column',
              gap: theme.spacing.sm,
              justifyContent: 'center',
              marginTop: theme.spacing.sm,
            }}>
            <Button
              onPress={appointmentsScreen.openCreateSheet}
              style={{ minWidth: 0, width: isTablet ? undefined : '72%' }}
              title={t('appointments.summary.add')}
            />
            <Button
              onPress={() => router.push('/dentist-mode')}
              style={{ minWidth: 0, width: isTablet ? undefined : '72%' }}
              title={t('appointments.summary.dentistMode')}
              variant="ghost"
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
          <View
            style={{
              flexDirection: useTwoColumnLayout ? 'row' : 'column',
              flexWrap: 'wrap',
              gap: theme.spacing.md,
              marginTop: theme.spacing.lg,
              width: '100%',
            }}>
            {appointmentsScreen.appointments.map((appointment) => (
              <View
                key={appointment.id}
                style={{
                  alignSelf: 'stretch',
                  flexGrow: useTwoColumnLayout ? 1 : 0,
                  maxWidth: useTwoColumnLayout ? '48.6%' : '100%',
                  minWidth: 0,
                  width: useTwoColumnLayout ? undefined : '100%',
                }}>
                <AppointmentCard
                  appointment={appointment}
                  onPress={() => router.push(`/appointments/${appointment.id}`)}
                />
              </View>
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
        <View style={{ alignSelf: 'center', maxWidth: formMaxWidth, width: '100%' }}>
          <AppointmentForm
            draft={appointmentsScreen.appointmentDraft}
            onChange={appointmentsScreen.patchAppointmentDraft}
            onSubmit={() => void appointmentsScreen.createAppointment()}
            submitLabel={t('appointments.form.create')}
            title={t('appointments.form.newTitle')}
          />
        </View>
      </BottomSheetModal>
    </>
  );
}
